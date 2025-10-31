import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, differenceInMinutes, format } from 'date-fns';
import type { Activity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateItineraryTimeDetails(activities: Activity[]): { duration: string | null; startTime: string | null; endTime: string | null } {
  if (activities.length === 0) {
    return { duration: null, startTime: null, endTime: null };
  }

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const dateTimes = activities
    .map(activity => {
      try {
        return parse(activity.time, 'h:mm a', new Date(todayString));
      } catch (e) {
        return null;
      }
    })
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

  if (dateTimes.length === 0) {
    return { duration: null, startTime: null, endTime: null };
  }

  const minTime = new Date(Math.min(...dateTimes.map(d => d.getTime())));
  const maxTime = new Date(Math.max(...dateTimes.map(d => d.getTime())));

  const diff = differenceInMinutes(maxTime, minTime);
  
  let duration: string | null = null;
  if (diff > 0) {
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
    duration = result;
  }

  return {
    startTime: format(minTime, 'h:mm a'),
    endTime: format(maxTime, 'h:mm a'),
    duration,
  };
}
