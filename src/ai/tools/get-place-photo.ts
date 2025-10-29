'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPlacePhotoUrlInputSchema = z.object({
  query: z.string().describe('The search query for the place (e.g., "Charminar, Hyderabad").'),
});

const GetPlacePhotoUrlOutputSchema = z.string().url().optional().describe('The URL of a photo of the place, or undefined if not found.');

export const getPlacePhotoUrlTool = ai.defineTool(
  {
    name: 'getPlacePhotoUrl',
    description: 'Returns a Google Places photo URL for a given query.',
    input: {schema: GetPlacePhotoUrlInputSchema},
    output: {schema: GetPlacePhotoUrlOutputSchema},
  },
  async ({query}) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_PLACES_API_KEY is not set. Returning placeholder.');
      return `https://picsum.photos/seed/${query.replace(/\s+/g, '-')}/400/400`;
    }

    try {
      // 1. Find Place ID from text query
      const findPlaceUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
      findPlaceUrl.searchParams.set('input', query);
      findPlaceUrl.searchParams.set('inputtype', 'textquery');
      findPlaceUrl.searchParams.set('fields', 'photos');
      findPlaceUrl.searchParams.set('key', apiKey);

      const findPlaceResponse = await fetch(findPlaceUrl.toString());
      if (!findPlaceResponse.ok) {
        console.error('Error finding place:', await findPlaceResponse.text());
        return `https://picsum.photos/seed/${query.replace(/\s+/g, '-')}/400/400`;
      }
      const findPlaceData = await findPlaceResponse.json();

      const photoReference = findPlaceData.candidates?.[0]?.photos?.[0]?.photo_reference;

      if (!photoReference) {
        console.log(`No photo found for query: "${query}". Returning placeholder.`);
        return `https://picsum.photos/seed/${query.replace(/\s+/g, '-')}/400/400`;
      }

      // 2. Get Photo URL from reference
      const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
      photoUrl.searchParams.set('maxwidth', '400');
      photoUrl.searchParams.set('photoreference', photoReference);
      photoUrl.searchParams.set('key', apiKey);
      
      return photoUrl.toString();

    } catch (error) {
      console.error('Error in getPlacePhotoUrl tool:', error);
      return `https://picsum.photos/seed/${query.replace(/\s+/g, '-')}/400/400`;
    }
  }
);
