'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPlacePhotoUrlInputSchema = z.object({
  query: z.string().optional().describe('The search query for the place (e.g., "Charminar, Hyderabad").'),
});

const GetPlacePhotoUrlOutputSchema = z.string().url().optional().describe('The URL of a photo of the place, or a placeholder if not found.');

export const getPlacePhotoUrlTool = ai.defineTool(
  {
    name: 'getPlacePhotoUrl',
    description: 'Returns a Google Places photo URL for a given query.',
    input: {schema: GetPlacePhotoUrlInputSchema},
    output: {schema: GetPlacePhotoUrlOutputSchema},
  },
  async ({query}) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeholderUrl = `https://picsum.photos/seed/${query ? query.replace(/\s+/g, '-') : 'placeholder'}/400/400`;

    if (!apiKey) {
      console.warn('GOOGLE_PLACES_API_KEY is not set. Returning placeholder.');
      return placeholderUrl;
    }
    
    if (!query) {
      return placeholderUrl;
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
        return placeholderUrl;
      }
      const findPlaceData = await findPlaceResponse.json();

      const photoReference = findPlaceData.candidates?.[0]?.photos?.[0]?.photo_reference;

      if (!photoReference) {
        console.log(`No photo found for query: "${query}". Returning placeholder.`);
        return placeholderUrl;
      }

      // 2. Get Photo URL from reference
      const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
      photoUrl.searchParams.set('maxwidth', '400');
      photoUrl.searchParams.set('photoreference', photoReference);
      photoUrl.searchParams.set('key', apiKey);
      
      return photoUrl.toString();

    } catch (error) {
      console.error('Error in getPlacePhotoUrl tool:', error);
      return placeholderUrl;
    }
  }
);
