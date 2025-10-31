
'use client';

import React from 'react';
import type { Itinerary } from '@/lib/types';
import { Compass, MapPin, ImageIcon } from 'lucide-react';

interface ItineraryShareImageProps {
  itinerary: Itinerary;
}

export const ItineraryShareImage = React.forwardRef<HTMLDivElement, ItineraryShareImageProps>(
  ({ itinerary }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[375px] h-[667px] bg-background text-foreground p-6 font-body flex flex-col"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Compass className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Geo Mingle</span>
        </div>
        
        <h2 className="text-xl font-bold tracking-tight mb-1">{itinerary.title}</h2>
        {itinerary.prompt && (
          <p className="text-xs text-muted-foreground italic mb-4">"{itinerary.prompt}"</p>
        )}

        <div className="space-y-3 overflow-y-auto flex-grow">
          {itinerary.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 text-sm">
              <div className="w-16 text-right text-muted-foreground flex-shrink-0 text-xs pt-0.5">{activity.time}</div>
              
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {activity.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                          src={activity.imageUrl}
                          alt={activity.description}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous" 
                      />
                  ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
              </div>

              <div className="flex-grow">
                <p className="font-medium text-sm leading-snug">{activity.description}</p>
                {activity.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>{activity.location}</span>
                  </div>
                )}
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
