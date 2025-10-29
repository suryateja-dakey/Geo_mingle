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

const ActivitySchema = z.object({
  time: z.string().describe('The time of the activity in a friendly format (e.g., "9:00 AM", "1:30 PM").'),
  description: z.string().describe('A description of the activity.'),
  location: z.string().optional().describe('The specific name of the main location or venue for this activity (e.g., "Eiffel Tower", "Louvre Museum"). This should be just the name of the place, not the full address.'),
  imageHint: z.string().optional().describe('One or two keywords describing the location for an image search (e.g., "Eiffel Tower"). This should be based on the location field.'),
});

const GenerateInitialItineraryOutputSchema = z.object({
  activities: z.array(ActivitySchema).describe('An array of activity objects that make up the itinerary for the day.'),
});
export type GenerateInitialItineraryOutput = z.infer<typeof GenerateInitialItineraryOutputSchema>;

export async function generateInitialItinerary(input: GenerateInitialItineraryInput): Promise<GenerateInitialItineraryOutput> {
  return generateInitialItineraryFlow(input);
}

const generateInitialItineraryPrompt = ai.definePrompt({
  name: 'generateInitialItineraryPrompt',
  input: {schema: GenerateInitialItineraryInputSchema},
  output: {schema: GenerateInitialItineraryOutputSchema},
  prompt: `You are a travel expert who specializes in creating personalized daily itineraries. Generate a detailed itinerary for the city of {{city}} based on the following description: {{prompt}}.

For each activity in the itinerary, provide the following structured information:
1. 'time': The time for the activity.
2. 'description': A clear description of what the activity is.

If and only if there is a specific, named location for an activity (e.g., "Eiffel Tower", "Central Park", "Louvre Museum"), you must also provide:
3. 'location': The specific, concise name of the place, monument, or venue ONLY. Do NOT add any other descriptive text or commentary in this field. For example, it should be "Louvre Museum", not "The world-famous Louvre Museum".
4. 'imageHint': One or two keywords that describe the location, which can be used for an image search later. This hint should directly relate to the 'location' field.

If an activity does not have a specific location (like "lunch at a local restaurant"), you MUST OMIT the 'location' and 'imageHint' fields for that activity.`,
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
