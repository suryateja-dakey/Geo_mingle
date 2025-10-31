'use client';

import React from 'react';
import type { Itinerary } from '@/lib/types';
import { Compass, MapPin } from 'lucide-react';
import Image from 'next/image';

interface ItineraryShareImageProps {
  itinerary: Itinerary;
}

export const ItineraryShareImage = React.forwardRef<HTMLDivElement, ItineraryShareImageProps>(
  ({ itinerary }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-background text-foreground p-6 font-body"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Compass className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Geo Mingle</span>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mb-1">{itinerary.title}</h2>
        {itinerary.prompt && (
          <p className="text-sm text-muted-foreground italic mb-4">"{itinerary.prompt}"</p>
        )}

        <div className="space-y-4">
          {itinerary.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 text-sm">
              <div className="w-20 text-right text-muted-foreground flex-shrink-0">{activity.time}</div>
              <div className="flex-grow">
                <p className="font-medium">{activity.description}</p>
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

        <p className="text-xs text-center text-muted-foreground mt-6">
          Generated with Geo Mingle
        </p>
      </div>
    );
  }
);

ItineraryShareImage.displayName = 'ItineraryShareImage';
