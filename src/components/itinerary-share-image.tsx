
'use client';

import React from 'react';
import type { Itinerary } from '@/lib/types';
import { Compass, MapPin, Clock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface ItineraryShareImageProps {
  itinerary: Itinerary;
  city: string | null;
  timeDetails: {
    startTime: string | null;
    endTime: string | null;
    duration: string | null;
  } | null;
}

export const ItineraryShareImage = React.forwardRef<HTMLDivElement, ItineraryShareImageProps>(
  ({ itinerary, city, timeDetails }, ref) => {

    const shareTitle = city ? `Your one day Trip in ${city}` : itinerary.title;

    const getMealBadgeColor = (mealType: string) => {
        switch (mealType) {
        case 'breakfast':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'lunch':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'dinner':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
        default:
            return '';
        }
    };
    
    const doodleBackground = `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' stroke='%239C92AC' stroke-opacity='0.1' stroke-width='1.5'%3E%3Cpath d='M10 10 C20 20, 40 20, 50 10'/%3E %3C!-- Wave --%3E%3Cpath d='M60 10 L65 20 L70 10' /%3E %3C!-- Mountain --%3E%3Cpath d='M80 15 A5 5 0 1 0 80 25 A5 5 0 1 0 80 15'/%3E %3C!-- Sun --%3E%3Cpath d='M100 10 L110 20 M110 10 L100 20' /%3E %3C!-- Plane --%3E%3Cpath d='M10 30 L50 30 L55 25 L50 20 L10 20 L5 25 Z' /%3E %3C!-- Train cart --%3E%3Cpath d='M60 40 L80 40 L80 50 L60 50 Z' /%3E%3Ccircle cx='65' cy='55' r='2'/%3E%3Ccircle cx='75' cy='55' r='2'/%3E %3C!-- Car --%3E%3Cpath d='M90 40 L110 40 L115 50 L85 50 Z' /%3E %3C!-- Ship --%3E%3Cpath d='M10 60 L20 70 L30 60'/%3E %3C!-- Tent --%3E%3Cpath d='M40 60 C50 50, 60 50, 70 60'/%3E %3C!-- Parachute --%3E%3Cpath d='M80 60 L85 70 L90 60' /%3E %3C!-- Balloon --%3E%3Cpath d='M100 65 A5 5 0 1 1 110 65 L105 75 Z'/%3E %3C!-- Hot air balloon --%3E%3Cpath d='M10 80 L30 80'/%3E %3C!-- Road --%3E%3Cpath d='M40 80 L45 90 L50 80 L55 90 L60 80'/%3E %3C!-- Waves --%3E%3Cpath d='M70 85 h10 v-5 h-10 Z' /%3E %3C!-- Bicycle --%3E%3Ccircle cx='72' cy='90' r='2' /%3E%3Ccircle cx='80' cy='90' r='2' /%3E%3Cpath d='M74 90 L78 85 L82 90' /%3E%3Cpath d='M90 80 L110 100 M90 100 L110 80'/%3E %3C!-- Compass --%3E%3Cpath d='M10 100 L30 110'/%3E%3Cpath d='M40 110 C50 100, 60 120, 70 110'/%3E%3Cpath d='M85 105 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' /%3E%3C/g%3E%3C/svg%3E")`;


    return (
      <div
        ref={ref}
        className="w-[375px] bg-background text-foreground p-6 flex flex-col"
        style={{ fontFamily: 'Inter, sans-serif', backgroundImage: doodleBackground, backgroundColor: 'hsl(var(--background))' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Compass className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Geo Mingle</span>
        </div>
        
        <h2 className="text-xl font-bold tracking-tight mb-1">{shareTitle}</h2>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
            {timeDetails?.startTime && timeDetails?.endTime && (
                <div className='flex items-center gap-1.5'>
                    <span>{timeDetails.startTime}</span>
                    <ArrowRight className='h-3 w-3' />
                    <span>{timeDetails.endTime}</span>
                </div>
            )}
            {timeDetails?.duration && (
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{timeDetails.duration} total</span>
                </div>
            )}
        </div>

        {itinerary.prompt && (
          <p className="text-xs text-muted-foreground italic mb-4">"{itinerary.prompt}"</p>
        )}

        <div className="space-y-3 overflow-y-auto flex-grow">
          {itinerary.activities.map((activity) => {
            const mealMatch = activity.description.match(/breakfast|lunch|dinner/i);
            const mealType = mealMatch ? mealMatch[0].toLowerCase() : null;

            return (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="w-16 text-right text-muted-foreground flex-shrink-0 text-xs pt-0.5">{activity.time}</div>
                    
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        {mealType ? (
                            <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                        ) : (
                            <MapPin className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex-grow pt-0.5">
                        <div className="font-medium text-xs leading-snug break-words whitespace-normal mb-1.5">
                            {activity.location ? (
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <span>{activity.location}</span>
                                </div>
                            ) : (
                                <span>{activity.description}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {mealType && (
                                <Badge variant="outline" className={cn('capitalize text-xs p-1 h-auto', getMealBadgeColor(mealType))}>
                                    {mealType}
                                </Badge>
                            )}
                            {activity.isCustom && (
                                <Badge variant="outline" className="text-xs p-1 h-auto">Custom</Badge>
                            )}
                        </div>
                    </div>
                </div>
            )
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6 flex-shrink-0">
          Generated with Geo Mingle
        </p>
      </div>
    );
  }
);

ItineraryShareImage.displayName = 'ItineraryShareImage';
