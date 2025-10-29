'use server';
/**
 * @fileOverview Generates an initial daily itinerary based on a user prompt.
 *
 * - generateInitialItinerary - A function that generates the itinerary.
 * - GenerateInitialItineraryInput - The input type for the generateInitialItinerary function.
 * - GenerateInitialItineraryOutput - The return type for the generateInitialItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialItineraryInputSchema = z.object({
  city: z.string().describe('The city for which to generate the itinerary.'),
  prompt: z.string().describe('A description of the desired itinerary, including preferences and interests.'),
});
export type GenerateInitialItineraryInput = z.infer<typeof GenerateInitialItineraryInputSchema>;

const GenerateInitialItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A detailed itinerary for the day, including activities, locations, and times.'),
});
export type GenerateInitialItineraryOutput = z.infer<typeof GenerateInitialItineraryOutputSchema>;

export async function generateInitialItinerary(input: GenerateInitialItineraryInput): Promise<GenerateInitialItineraryOutput> {
  return generateInitialItineraryFlow(input);
}

const generateInitialItineraryPrompt = ai.definePrompt({
  name: 'generateInitialItineraryPrompt',
  input: {schema: GenerateInitialItineraryInputSchema},
  output: {schema: GenerateInitialItineraryOutputSchema},
  prompt: `You are a travel expert who specializes in creating personalized daily itineraries. Generate a detailed itinerary for the city of {{city}} based on the following description: {{prompt}}. The itinerary should include specific activities, locations, and times. Make the itinerary concise and easy to follow.`,
});

const generateInitialItineraryFlow = ai.defineFlow(
  {
    name: 'generateInitialItineraryFlow',
    inputSchema: GenerateInitialItineraryInputSchema,
    outputSchema: GenerateInitialItineraryOutputSchema,
  },
  async input => {
    const {output} = await generateInitialItineraryPrompt(input);
    return output!;
  }
);
