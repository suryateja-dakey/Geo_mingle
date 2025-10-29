'use client';

import type { Activity } from '@/lib/types';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, X, MapPin, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function ActivityCard({ activity, onRemove, city, onClick }: { activity: Activity, onRemove: (id: string) => void, city: string | null, onClick: (activity: Activity) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const LocationLink = ({ location, city }: { location?: string, city: string | null }) => {
    if (!location || !city) return null;

    const query = encodeURIComponent(`${location}, ${city}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    return (
      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2" onClick={(e) => e.stopPropagation()}>
        <MapPin className="h-4 w-4" />
        {location}
      </a>
    );
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(activity)}>
        <CardContent className="flex items-start p-4 gap-4">
          <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 -ml-2 text-muted-foreground hover:text-foreground pt-1">
            <GripVertical />
          </div>
          
          <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
            {activity.imageUrl ? (
                <Image
                    src={activity.imageUrl}
                    alt={activity.description}
                    width={96}
                    height={96}
                    className="object-cover"
                    data-ai-hint={activity.imageHint}
                />
            ) : (
                activity.location ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )
            )}
          </div>

          <div className="flex-grow">
            <p className="font-medium">{activity.description}</p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
            {activity.location && (
              <LocationLink location={activity.location} city={city} />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-2">
              {activity.isCustom ? (
                <Badge variant="outline">Custom</Badge>
              ) : (
                <Badge variant="secondary">AI</Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(activity.id);
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove activity</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
