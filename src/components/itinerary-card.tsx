
'use client';

import type { Activity, Itinerary } from '@/lib/types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { ActivityTimeline } from './activity-timeline';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Clock, ArrowRight, Share2, Map } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { calculateItineraryTimeDetails } from '@/lib/utils';
import { useMemo } from 'react';
import { useCity } from '@/hooks/use-city';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ItineraryCardProps {
  itinerary: Itinerary;
  setItineraries: React.Dispatch<React.SetStateAction<Itinerary[]>>;
  removeItinerary: (id: string) => void;
  removeActivity: (activityId: string, itineraryId: string) => void;
  updateActivityTime: (activityId: string, itineraryId: string, newTime: string) => void;
  onShare: (itinerary: Itinerary) => void;
  onActivityClick: (activity: Activity) => void;
}

export function ItineraryCard({ itinerary, setItineraries, removeItinerary, removeActivity, updateActivityTime, onShare, onActivityClick }: ItineraryCardProps) {
  const { setNodeRef } = useDroppable({ id: itinerary.id });
  const { city } = useCity();

  const timeDetails = useMemo(() => calculateItineraryTimeDetails(itinerary.activities), [itinerary.activities]);
  
  const isAiSuggestion = itinerary.id.startsWith('ai-itinerary');

  const locations = useMemo(() => 
    itinerary.activities
      .map(act => act.location)
      .filter((loc): loc is string => !!loc), 
    [itinerary.activities]
  );
  
  const directionsUrl = useMemo(() => {
    if (locations.length < 2 || !city) return null;

    const baseUrl = 'https://www.google.com/maps/dir/?api=1';
    const origin = `&origin=${encodeURIComponent(`${locations[0]}, ${city}`)}`;
    const destination = `&destination=${encodeURIComponent(`${locations[locations.length - 1]}, ${city}`)}`;
    
    const waypoints = locations.length > 2 
      ? `&waypoints=${locations.slice(1, -1).map(loc => encodeURIComponent(`${loc}, ${city}`)).join('|')}`
      : '';
      
    return `${baseUrl}${origin}${destination}${waypoints}`;
  }, [locations, city]);

  // Render the card only if it has activities
  if (itinerary.activities.length === 0 && itinerary.id !== 'default-itinerary') {
    return null;
  }

  return (
    <SortableContext items={itinerary.activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
      <Card className="w-full" ref={setNodeRef}>
        <CardHeader>
          <div className='flex flex-col items-start justify-between gap-2 sm:flex-row'>
            <div className='flex-1'>
                <CardTitle>{itinerary.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm font-medium text-muted-foreground">
                  {timeDetails.startTime && timeDetails.endTime && (
                    <div className='flex items-center gap-2'>
                      <span>{timeDetails.startTime}</span>
                      <ArrowRight className='h-4 w-4' />
                      <span>{timeDetails.endTime}</span>
                    </div>
                  )}
                  {timeDetails.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{timeDetails.duration} total</span>
                    </div>
                  )}
                </div>
                {itinerary.prompt ? (
                    <CardDescription className="italic mt-2">"{itinerary.prompt}"</CardDescription>
                ) : isAiSuggestion ? (
                    <CardDescription className='mt-1'>A set of AI-generated activities.</CardDescription>
                ) : null}
            </div>
            <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
              <TooltipProvider>
                {directionsUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="icon">
                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                          <Map className="h-5 w-5" />
                          <span className="sr-only">Get Directions</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Route on Map</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onShare(itinerary)}>
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Share Itinerary</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Itinerary</p>
                  </TooltipContent>
                </Tooltip>
                {isAiSuggestion && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Remove Itinerary</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Itinerary</p>
                        </TooltipContent>
                      </Tooltip>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this entire itinerary stack and all of its activities. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeItinerary(itinerary.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityTimeline
            activities={itinerary.activities}
            itineraryId={itinerary.id}
            removeActivity={removeActivity}
            updateActivityTime={updateActivityTime}
            city={city}
            onActivityClick={onActivityClick}
          />
        </CardContent>
      </Card>
    </SortableContext>
  );
}
