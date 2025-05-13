# AI Features with Genkit

This directory houses the Artificial Intelligence (AI) capabilities of the HVAC Optimizer application, primarily implemented using [Genkit](https://firebase.google.com/docs/genkit). Genkit is a framework for building, deploying, and monitoring AI-powered features. For Data Analytics Engineers, Genkit provides a streamlined way to incorporate generative AI into control strategies or analytics workflows.

## Overview

The AI features in this project leverage Generative AI models (e.g., Google's Gemini) to provide intelligent suggestions, configurations, or insights related to HVAC system optimization. Data Analytics Engineers can design and implement Genkit flows to:
*   Generate initial HVAC configurations based on building descriptions and usage patterns.
*   Develop AI-driven diagnostic tools (e.g., "ask an expert" about HVAC issues).
*   Create natural language interfaces for querying data or controlling systems.
*   Potentially augment AI/ML control algorithms with generative capabilities.

## Core Components for Data Analytics Engineers

*   **`genkit.ts`**:
    *   **Purpose**: Central configuration for Genkit.
    *   **Relevance for Engineers**: Understand how models are configured (`googleai/gemini-2.0-flash` by default) and how plugins (`googleAI`) are initialized. This impacts model capabilities and API key requirements (`GOOGLE_API_KEY`).
    *   **Key Code**:
        ```typescript
        import {genkit} from 'genkit';
        import {googleAI} from '@genkit-ai/googleai';

        export const ai = genkit({
          plugins: [googleAI()], // GOOGLE_API_KEY environment variable is required
          model: 'googleai/gemini-2.0-flash',
        });
        ```

*   **`dev.ts`**:
    *   **Purpose**: Entry point for the Genkit development server.
    *   **Relevance for Engineers**: Engineers add imports to their new flow files here to make them discoverable by the Genkit dev server for local testing and inspection.
    *   **Key Code**:
        ```typescript
        import { config } from 'dotenv';
        config(); // Load .env variables

        import '@/ai/flows/generate-hvac-configuration.ts'; // Example flow
        // Engineers import their new flow files here, e.g.:
        // import '@/ai/flows/my-custom-hvac-advisor-flow.ts';
        ```
    *   **Running the Dev Server**:
        ```bash
        npm run genkit:dev
        # or for watching changes
        npm run genkit:watch
        ```
        The dev server (typically on port 3400) provides a UI to test flows with various inputs and inspect outputs.

*   **`/flows` Directory**:
    *   **Purpose**: This is where Data Analytics Engineers implement their Genkit flows. Each flow is a self-contained module for a specific AI task.
    *   **Structure of a Flow File** (e.g., `src/ai/flows/generate-hvac-configuration.ts`):
        *   **`'use server';`**: Next.js directive for server-side code.
        *   **File Overview Doc Comment**: Describes the flow's purpose, inputs, and outputs.
        *   **Input/Output Schemas (Zod)**: Engineers define the structure of data entering and exiting the flow using Zod. Descriptions within schemas guide the LLM for structured output. This is crucial for data integrity and predictable AI behavior.
            ```typescript
            import {z} from 'genkit';

            const GenerateHVACConfigurationInputSchema = z.object({
              buildingDescription: z.string().describe('Detailed description of the building, including size, materials, insulation, window types, and orientation.'),
              usagePatterns: z.string().describe('Occupancy schedules, typical activities, and equipment usage (e.g., office hours, server rooms).'),
              desiredComfortLevels: z.string().describe('Target temperature ranges, humidity preferences, and any specific comfort requirements for different zones.'),
              // Engineers can add more specific inputs like 'localClimateZone', 'energyTariffStructure', etc.
            });
            export type GenerateHVACConfigurationInput = z.infer<typeof GenerateHVACConfigurationInputSchema>;

            const GenerateHVACConfigurationOutputSchema = z.object({
              hvacConfiguration: z.string().describe('A comprehensive HVAC configuration plan including temperature setpoints (seasonal/time-of-day), humidity control strategy, ventilation rates (CFM per zone/person), and suggestions for zoning or advanced features like demand-controlled ventilation.'),
              // Engineers can structure this output more, e.g., nested objects for 'temperature_settings', 'ventilation_plan'.
            });
            export type GenerateHVACConfigurationOutput = z.infer<typeof GenerateHVACConfigurationOutputSchema>;
            ```
        *   **Exported Wrapper Function**: An async function serving as the primary interface to the flow from the application (React components or server-side logic).
            ```typescript
            export async function generateHVACConfiguration(input: GenerateHVACConfigurationInput): Promise<GenerateHVACConfigurationOutput> {
              return generateHVACConfigurationFlow(input);
            }
            ```
        *   **Prompt Definition (`ai.definePrompt`)**: Engineers craft the prompt template here. This is where prompt engineering skills are critical. Handlebars templating (`{{{input_field}}}`) injects dynamic data. Input/output schemas guide the LLM.
            ```typescript
            const prompt = ai.definePrompt({
              name: 'generateHVACConfigurationPrompt', // Unique name for the prompt
              input: {schema: GenerateHVACConfigurationInputSchema},
              output: {schema: GenerateHVACConfigurationOutputSchema},
              prompt: `You are an expert HVAC systems engineer. Based on the following building information, usage patterns, and desired comfort levels, generate a comprehensive initial HVAC configuration plan.

            Building Description: {{{buildingDescription}}}
            Usage Patterns: {{{usagePatterns}}}
            Desired Comfort Levels: {{{desiredComfortLevels}}}

            Provide a detailed configuration addressing temperature setpoints (consider seasonal and time-of-day variations), humidity control, ventilation rates (e.g., CFM per zone or per person based on ASHRAE standards if applicable), and any recommendations for zoning or advanced features like demand-controlled ventilation or economizer modes. The output should be a structured plan.`,
            });
            ```
        *   **Flow Definition (`ai.defineFlow`)**: Defines the Genkit flow, linking the input/output schemas and the core logic (typically calling the prompt). Engineers can add pre-processing of inputs or post-processing of LLM outputs here if needed.
            ```typescript
            const generateHVACConfigurationFlow = ai.defineFlow(
              {
                name: 'generateHVACConfigurationFlow', // Unique name for the flow
                inputSchema: GenerateHVACConfigurationInputSchema,
                outputSchema: GenerateHVACConfigurationOutputSchema,
              },
              async (input) => {
                // Pre-processing example:
                // const enhancedInput = { ...input, buildingDescription: input.buildingDescription + " Additional context." };
                const {output} = await prompt(input); // Call the AI model
                // Post-processing example:
                // if (output && output.hvacConfiguration) {
                //   output.hvacConfiguration = output.hvacConfiguration.replace("some placeholder", "actual value");
                // }
                return output!; // Assumes output is not null
              }
            );
            ```

## Workflow for Data Analytics Engineers

1.  **Define the AI Task**: Clearly state the problem the AI flow will solve (e.g., "Generate an energy-saving schedule based on weather forecast and occupancy").
2.  **Design Schemas**: Define input and output Zod schemas with descriptive fields. This structures the AI's interaction.
3.  **Craft the Prompt**: Write a clear, detailed prompt. Use Handlebars for dynamic data. Iterate on the prompt for best results.
4.  **Implement the Flow**: Create a new `.ts` file in `src/ai/flows/`. Implement the prompt and flow definitions.
5.  **Register in `dev.ts`**: Import the new flow file in `src/ai/dev.ts`.
6.  **Test with Dev Server**: Run `npm run genkit:dev` and use the Genkit UI (localhost:3400) to test the flow with various inputs. Debug and refine.
7.  **Integrate into Application**: Call the exported wrapper function from your Next.js components (client or server) or Server Actions.

## Key Considerations for Engineers

*   **API Keys**: Ensure `GOOGLE_API_KEY` is set in `.env.local`.
*   **Prompt Engineering**: This is key. Well-crafted prompts and descriptive Zod schemas significantly improve output quality and reliability.
*   **Structured Output**: Leverage Zod schemas to force the LLM to return data in a specific JSON format, making it easier to consume in the application.
*   **Error Handling**: Implement try-catch blocks around flow invocations in the application code. Genkit flows themselves might also include internal error handling for robustness.
*   **Cost Management**: Be mindful of API call costs, especially with complex prompts or frequent invocations.
*   **Idempotency**: If flows trigger actions, consider idempotency if they might be retried.
*   **Security**: Do not include sensitive information directly in prompts if possible. Sanitize inputs.
*   **Version Control (Git)**:
    *   Commit Genkit flow files (`.ts`), schema definitions, and prompt changes.
    *   Use feature branches for developing new flows (e.g., `feature/ai-hvac-diagnostics`).
    *   Document flows and their intended use.
```