'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-itinerary.ts';
import '@/ai/flows/get-activity-photo.ts';
