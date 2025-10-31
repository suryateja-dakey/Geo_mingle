'use server';
/**
 * @fileOverview Generates an initial daily itinerary based on a user prompt.
 *
 * - generateInitialItinerary - A function that generates the itinerary.
 * - GenerateInitialItineraryInput - The input type for the generateInitialItinerary function.
 * - GenerateInitialItineraryOutput - The return type for the generateInitialItinerary function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateInitialItineraryInputSchema = z.object({
  city: z.string().describe('The city for which to generate the itinerary.'),
  prompt: z.string().describe('A description of the desired itinerary, including preferences and interests. If the prompt mentions "3 to 5 activities", the output should contain between 3 and 5 activities.'),
});
export type GenerateInitialItineraryInput = z.infer<typeof GenerateInitialItineraryInputSchema>;

const ActivitySchema = z.object({
  time: z.string().describe('The time of the activity in a friendly format (e.g., "9:00 AM", "1:30 PM").'),
  description: z.string().describe('A description of the activity.'),
  location: z.string().optional().describe('The specific name of the main location or venue for this activity (e.g., "Eiffel Tower", "Paradise Biryani"). This should be just the name of the place, not the full address.'),
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
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a travel expert who specializes in creating personalized daily itineraries. Generate a detailed itinerary for the city of {{city}} based on the following description: {{prompt}}.

Your itinerary should, whenever possible, include suggestions for Breakfast, Lunch, and Dinner.

If the user prompt asks for "3 to 5 activities", you must generate an itinerary with a total of 3 to 5 activities.

For each activity in the itinerary, provide the following structured information:
1. 'time': The time for the activity.
2. 'description': A clear description of what the activity is.

If an activity has a specific, named location (e.g., "Eiffel Tower", "Central Park"), you must provide:
3. 'location': The specific, concise name of the place.
4. 'imageHint': One or two keywords for an image search related to the 'location'.

If the activity is a meal like breakfast, lunch or dinner, you MUST suggest a specific, well-known restaurant in that city and use its name for the 'location'. For example, if suggesting biryani in Hyderabad, you might set the location to "Paradise Biryani".

If an activity does not have a specific location (e.g., "take a walk"), you MUST OMIT the 'location' and 'imageHint' fields. Do NOT invent locations.`,
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
