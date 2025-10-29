'use server';

/**
 * @fileOverview Summarizes details about activities, providing a quick grasp of key information.
 *
 * - summarizeActivityDetails - A function that handles the summarization process.
 * - SummarizeActivityDetailsInput - The input type for the summarizeActivityDetails function.
 * - SummarizeActivityDetailsOutput - The return type for the summarizeActivityDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeActivityDetailsInputSchema = z.object({
  activityDetails: z
    .string()
    .describe('The detailed description of the activity to be summarized.'),
});
export type SummarizeActivityDetailsInput = z.infer<
  typeof SummarizeActivityDetailsInputSchema
>;

const SummarizeActivityDetailsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the activity details.'),
});
export type SummarizeActivityDetailsOutput = z.infer<
  typeof SummarizeActivityDetailsOutputSchema
>;

export async function summarizeActivityDetails(
  input: SummarizeActivityDetailsInput
): Promise<SummarizeActivityDetailsOutput> {
  return summarizeActivityDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeActivityDetailsPrompt',
  input: {schema: SummarizeActivityDetailsInputSchema},
  output: {schema: SummarizeActivityDetailsOutputSchema},
  prompt: `Summarize the following activity details in a concise and informative way:\n\n{{{activityDetails}}}`,
});

const summarizeActivityDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeActivityDetailsFlow',
    inputSchema: SummarizeActivityDetailsInputSchema,
    outputSchema: SummarizeActivityDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
