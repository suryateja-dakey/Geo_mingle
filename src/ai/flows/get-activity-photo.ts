'use server';

import { ai } from '@/ai/genkit';
import { getPlacePhotoUrlTool } from '@/ai/tools/get-place-photo';
import { z } from 'zod';

const GetActivityPhotoInputSchema = z.object({
  query: z.string().describe('The search query for the place (e.g., "Charminar, Hyderabad").'),
});
export type GetActivityPhotoInput = z.infer<typeof GetActivityPhotoInputSchema>;

const GetActivityPhotoOutputSchema = z.string().url().optional();
export type GetActivityPhotoOutput = z.infer<typeof GetActivityPhotoOutputSchema>;

const getActivityPhotoFlow = ai.defineFlow(
  {
    name: 'getActivityPhotoFlow',
    inputSchema: GetActivityPhotoInputSchema,
    outputSchema: GetActivityPhotoOutputSchema,
  },
  async ({ query }) => {
    // We directly use the logic from the tool here.
    // In a more complex app, the tool could be called, but for this simple case,
    // directly invoking the function is more efficient.
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeholderUrl = `https://picsum.photos/seed/${query.replace(/\s+/g, '-')}/400/400`;

    if (!apiKey) {
      console.warn('GOOGLE_PLACES_API_KEY is not set. Returning placeholder.');
      return placeholderUrl;
    }

    try {
      const findPlaceUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
      findPlaceUrl.searchParams.set('input', query);
      findPlaceUrl.searchParams.set('inputtype', 'textquery');
      findPlaceUrl.searchParams.set('fields', 'photos');
      findPlaceUrl.searchParams.set('key', apiKey);

      const findPlaceResponse = await fetch(findPlaceUrl.toString());
      if (!findPlaceResponse.ok) {
        return placeholderUrl;
      }
      const findPlaceData = await findPlaceResponse.json();
      const photoReference = findPlaceData.candidates?.[0]?.photos?.[0]?.photo_reference;

      if (!photoReference) {
        return placeholderUrl;
      }

      const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
      photoUrl.searchParams.set('maxwidth', '400');
      photoUrl.searchParams.set('photoreference', photoReference);
      photoUrl.searchParams.set('key', apiKey);
      
      return photoUrl.toString();
    } catch (error) {
      return placeholderUrl;
    }
  }
);

export async function getActivityPhoto(
  input: GetActivityPhotoInput
): Promise<GetActivityPhotoOutput> {
  return await getActivityPhotoFlow(input);
}
