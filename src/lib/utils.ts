import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, differenceInMinutes, getHours, getMinutes } from 'date-fns';
import type { Activity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calculateItineraryDuration(activities: Activity[]): string | null {
  if (activities.length < 2) {
    return null;
  }

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const dateTimes = activities
    .map(activity => {
      try {
        // Use a base date of today to handle time parsing correctly.
        // The regex ensures we handle formats like "9:00 AM" or "10:30PM"
        return parse(activity.time, 'h:mm a', new Date(todayString));
      } catch (e) {
        return null;
      }
    })
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

  if (dateTimes.length < 2) {
    return null;
  }

  const minTime = new Date(Math.min(...dateTimes.map(d => d.getTime())));
  const maxTime = new Date(Math.max(...dateTimes.map(d => d.getTime())));

  const diff = differenceInMinutes(maxTime, minTime);
  
  if (diff <= 0) {
    return null;
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0) {
    if (result) result += ' ';
    result += `${minutes}m`;
  }

  return result || null;
}
