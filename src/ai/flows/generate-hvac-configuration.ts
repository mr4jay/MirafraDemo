'use server';

/**
 * @fileOverview A GenAI-powered tool to generate an initial HVAC configuration.
 *
 * - generateHVACConfiguration - A function that handles the HVAC configuration generation process.
 * - GenerateHVACConfigurationInput - The input type for the generateHVACConfiguration function.
 * - GenerateHVACConfigurationOutput - The return type for the generateHVACConfiguration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHVACConfigurationInputSchema = z.object({
  buildingDescription: z.string().describe('A description of the building, including size, materials, and layout.'),
  usagePatterns: z.string().describe('A description of how the building is used, including occupancy schedules and activities.'),
  desiredComfortLevels: z.string().describe('The desired temperature and humidity levels for the building.'),
});
export type GenerateHVACConfigurationInput = z.infer<typeof GenerateHVACConfigurationInputSchema>;

const GenerateHVACConfigurationOutputSchema = z.object({
  hvacConfiguration: z.string().describe('The generated HVAC configuration, including settings for temperature, humidity, and airflow.'),
});
export type GenerateHVACConfigurationOutput = z.infer<typeof GenerateHVACConfigurationOutputSchema>;

export async function generateHVACConfiguration(input: GenerateHVACConfigurationInput): Promise<GenerateHVACConfigurationOutput> {
  return generateHVACConfigurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHVACConfigurationPrompt',
  input: {schema: GenerateHVACConfigurationInputSchema},
  output: {schema: GenerateHVACConfigurationOutputSchema},
  prompt: `You are an expert HVAC technician. Based on the following information, generate an initial HVAC configuration:

Building Description: {{{buildingDescription}}}
Usage Patterns: {{{usagePatterns}}}
Desired Comfort Levels: {{{desiredComfortLevels}}}

Provide a detailed configuration, including settings for temperature, humidity, and airflow.`, 
});

const generateHVACConfigurationFlow = ai.defineFlow(
  {
    name: 'generateHVACConfigurationFlow',
    inputSchema: GenerateHVACConfigurationInputSchema,
    outputSchema: GenerateHVACConfigurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
