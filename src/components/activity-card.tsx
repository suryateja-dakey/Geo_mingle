'use client';

import { useState, useRef, useEffect } from 'react';
import type { Activity } from '@/lib/types';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, X, MapPin, ImageIcon, UtensilsCrossed } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export function ActivityCard({ activity, onRemove, onTimeChange, city, onClick }: { activity: Activity, onRemove: () => void, onTimeChange: (newTime: string) => void, city: string | null, onClick: (activity: Activity) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id });
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(activity.time);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    setTimeValue(activity.time);
  }, [activity.time]);

  useEffect(() => {
    if (isEditingTime && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [isEditingTime]);

  const handleTimeSave = () => {
    const timeMatch = timeValue.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
    if (timeMatch) {
      const formattedTime = `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3].toUpperCase()}`;
      if (formattedTime !== activity.time) {
        onTimeChange(formattedTime);
      }
    } else {
      // Revert if format is incorrect
      setTimeValue(activity.time);
    }
    setIsEditingTime(false);
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeSave();
    } else if (e.key === 'Escape') {
      setIsEditingTime(false);
      setTimeValue(activity.time);
    }
  };
  
  const mealMatch = activity.description.match(/breakfast|lunch|dinner/i);
  const mealType = mealMatch ? mealMatch[0] : null;

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
      <Card onClick={() => onClick(activity)} className="transition-all overflow-hidden hover:shadow-md hover:border-primary/50">
        {mealType && (
          <div 
            className={cn(
                "absolute top-2 -right-11 rotate-45 text-xs text-center text-white py-1 w-32 shadow-md",
                mealType.toLowerCase() === 'breakfast' && 'bg-blue-500',
                mealType.toLowerCase() === 'lunch' && 'bg-green-500',
                mealType.toLowerCase() === 'dinner' && 'bg-purple-600'
            )}
          >
            {mealType}
          </div>
        )}
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
                    mealType ? (
                        <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                    ) : (
                        <Skeleton className="w-full h-full" />
                    )
                ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )
            )}
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-2">
              {mealType && <UtensilsCrossed className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <p className="font-medium line-clamp-2">{activity.description}</p>
            </div>
            {isEditingTime ? (
              <Input
                ref={timeInputRef}
                type="text"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                onBlur={handleTimeSave}
                onKeyDown={handleTimeKeyDown}
                className="h-7 mt-1 text-sm text-muted-foreground w-28"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p 
                className="text-sm text-muted-foreground cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTime(true);
                }}
              >
                {activity.time}
              </p>
            )}
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
                  onRemove();
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
