
'use client';

import React from 'react';
import type { Itinerary } from '@/lib/types';
import { Compass, MapPin, ImageIcon, Clock, ArrowRight } from 'lucide-react';

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

    return (
      <div
        ref={ref}
        className="w-[375px] bg-background text-foreground p-6 flex flex-col"
        style={{ fontFamily: 'Inter, sans-serif' }}
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
          {itinerary.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 text-sm">
              <div className="w-16 text-right text-muted-foreground flex-shrink-0 text-xs pt-0.5">{activity.time}</div>
              
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                 <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="flex-grow pt-0.5">
                <div className="font-medium text-xs leading-snug break-words whitespace-normal">
                  {activity.location ? (
                    <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>{activity.location}</span>
                    </div>
                  ) : (
                    <span>{activity.description}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6 flex-shrink-0">
          Generated with Geo Mingle
        </p>
      </div>
    );
  }
);

ItineraryShareImage.displayName = 'ItineraryShareImage';
