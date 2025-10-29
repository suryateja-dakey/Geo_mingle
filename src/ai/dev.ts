import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-itinerary.ts';
import '@/ai/flows/summarize-activity-details.ts';
import '@/ai/tools/get-place-photo.ts';
