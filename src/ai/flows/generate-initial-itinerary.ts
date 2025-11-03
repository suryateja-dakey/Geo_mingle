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
  imageHint: z.string().optional().describe("A 2-3 word hint for a stock photo, like 'Eiffel Tower night'. This is used if the activity has a specific location."),
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
  prompt: `You are a travel planner. You will generate a plan for the city of {{city}} based on this user request: "{{prompt}}".

**CRITICAL DIRECTIVE: ROUTE OPTIMIZATION**
This is your most important task. Before providing the final output, you MUST mentally map out the locations of all suggested activities.
1. The final order of activities in the array MUST represent a sensible, continuous path through the city.
2. The user should not have to backtrack or travel long distances between consecutive activities.
3. You MUST NOT suggest the same location or activity twice in one itinerary. The path must be logical.

For example, do not suggest an activity in the north, then one in the south, and then another one back in the north.

Your itinerary should include suggestions for Breakfast, Lunch, and Dinner.

If the user prompt asks for "3 to 5 activities", you must generate an itinerary with a total of 3 to 5 activities.

For each activity in the itinerary, provide the following structured information:
1. 'time': The time for the activity.
2. 'description': A clear description of what the activity is.

If an activity has a specific, named location (e.g., "Eiffel Tower", "Central Park"), you must provide:
3. 'location': The specific, concise name of the place.
4. 'imageHint': A 2-3 word hint for a stock photo, like 'Eiffel Tower night'.

If the activity is a meal like breakfast, lunch or dinner, you MUST suggest a specific, well-known restaurant in that city and use its name for the 'location'. For example, if suggesting biryani in Hyderabad, you might set the location to "Paradise Biryani". You MUST still provide an 'imageHint' for the restaurant.

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
