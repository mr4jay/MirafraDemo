# AI Features with Genkit

This directory houses the Artificial Intelligence (AI) capabilities of the HVAC Optimizer application, primarily implemented using [Genkit](https://firebase.google.com/docs/genkit). Genkit is a framework for building, deploying, and monitoring AI-powered features.

## Overview

The AI features in this project leverage Generative AI models (e.g., Google's Gemini) to provide intelligent suggestions, configurations, or insights related to HVAC system optimization.

## Core Components

*   **`genkit.ts`**:
    *   **Purpose**: This is the central configuration file for Genkit within the application.
    *   **Functionality**:
        *   Initializes the Genkit framework.
        *   Configures necessary plugins, such as the `googleAI` plugin for accessing Google's Generative AI models.
        *   Specifies the default model to be used (e.g., `googleai/gemini-2.0-flash`).
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
    *   **Purpose**: This file is used by the Genkit development server (`genkit start`).
    *   **Functionality**:
        *   Imports all defined Genkit flows to make them available to the development server for testing and inspection.
        *   Loads environment variables using `dotenv` (e.g., `GOOGLE_API_KEY`).
    *   **Key Code**:
        ```typescript
        import { config } from 'dotenv';
        config(); // Load .env variables

        import '@/ai/flows/generate-hvac-configuration.ts'; // Example flow import
        // Import other flows here
        ```
    *   **Running the Dev Server**:
        ```bash
        npm run genkit:dev
        # or for watching changes
        npm run genkit:watch
        ```
        This typically starts a local server (e.g., on port 3400) where you can inspect and test your flows via a UI.

*   **`/flows` Directory**:
    *   **Purpose**: Contains individual Genkit "flows". A flow is a defined sequence of operations, often involving an AI model call, to achieve a specific task.
    *   **Structure of a Flow File** (e.g., `generate-hvac-configuration.ts`):
        *   **`'use server';`**: Directive for Next.js, indicating this module can contain server-side code (Server Actions, etc.).
        *   **File Overview Doc Comment**: Describes the purpose of the file and its exported members.
        *   **Input/Output Schemas**: Defined using Zod (`z`) to specify the expected structure and types for the flow's input and output. These schemas are also used to guide the AI model in generating structured responses.
            ```typescript
            import {z} from 'genkit';

            const MyInputSchema = z.object({
              description: z.string().describe('A detailed description of the problem.'),
            });
            export type MyInput = z.infer<typeof MyInputSchema>;
            ```
        *   **Exported Wrapper Function**: An async function that serves as the public API for the flow. This function is called from the application's React components or server-side logic.
            ```typescript
            export async function myFlowFunction(input: MyInput): Promise<MyOutput> {
              return internalFlowName(input);
            }
            ```
        *   **Prompt Definition (`ai.definePrompt`)**:
            *   Defines the prompt template that will be sent to the AI model.
            *   Uses Handlebars templating (`{{{input_field}}}`) to inject input data into the prompt.
            *   Specifies the input and output schemas to guide the model's response format.
            ```typescript
            const prompt = ai.definePrompt({
              name: 'myPromptName',
              input: {schema: MyInputSchema},
              output: {schema: MyOutputSchema},
              prompt: `Analyze the following: {{{description}}}`,
            });
            ```
        *   **Flow Definition (`ai.defineFlow`)**:
            *   Defines the actual Genkit flow.
            *   Takes the input schema and output schema.
            *   Contains the core logic, which usually involves calling the defined prompt.
            ```typescript
            const internalFlowName = ai.defineFlow(
              {
                name: 'myInternalFlowName',
                inputSchema: MyInputSchema,
                outputSchema: MyOutputSchema,
              },
              async (input) => {
                const {output} = await prompt(input); // Call the AI model
                return output!; // Assumes output is not null
              }
            );
            ```

## Usage

AI flows are typically invoked from server components or Server Actions within the Next.js application. The exported wrapper function from a flow file is imported and called with the appropriate input data.

Example (`src/app/(app)/configure/page.tsx` or a similar component might call a flow):
```typescript
// In a React Server Component or Server Action
import { generateHVACConfiguration } from '@/ai/flows/generate-hvac-configuration';

async function handleConfigurationRequest(formData) {
  const buildingDescription = formData.get('buildingDescription');
  // ... get other form data

  try {
    const hvacConfig = await generateHVACConfiguration({
      buildingDescription,
      // ... other inputs
    });
    console.log("Generated HVAC Configuration:", hvacConfig.hvacConfiguration);
    // Update UI or state with the result
  } catch (error) {
    console.error("Error generating HVAC configuration:", error);
  }
}
```

## Key Considerations

*   **API Keys**: Ensure `GOOGLE_API_KEY` (or keys for other AI providers) is set in your `.env` or `.env.local` file.
*   **Prompt Engineering**: The quality of the AI's output heavily depends on well-crafted prompts. Descriptions in Zod schemas also play a role in guiding the model for structured output.
*   **Error Handling**: Implement robust error handling for AI model calls, as they can fail due to various reasons (API issues, rate limits, content filtering).
*   **Cost Management**: Be mindful of the costs associated with calling Generative AI models, especially during development and testing.
```