'use client';

import type { Activity, Itinerary } from '@/lib/types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { ActivityTimeline } from './activity-timeline';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Clock } from 'lucide-react';
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
import { calculateItineraryDuration } from '@/lib/utils';
import { useMemo } from 'react';

interface ItineraryCardProps {
  itinerary: Itinerary;
  setItineraries: React.Dispatch<React.SetStateAction<Itinerary[]>>;
  removeItinerary: (id: string) => void;
  removeActivity: (activityId: string, itineraryId: string) => void;
  updateActivityTime: (activityId: string, itineraryId: string, newTime: string) => void;
  city: string | null;
  onActivityClick: (activity: Activity) => void;
}

export function ItineraryCard({ itinerary, setItineraries, removeItinerary, removeActivity, updateActivityTime, city, onActivityClick }: ItineraryCardProps) {
  const { setNodeRef } = useDroppable({ id: itinerary.id });

  const duration = useMemo(() => calculateItineraryDuration(itinerary.activities), [itinerary.activities]);

  const handleSetActivities = (itineraryId: string, newActivities: Activity[]) => {
    setItineraries(prev =>
      prev.map(it =>
        it.id === itineraryId ? { ...it, activities: newActivities } : it
      )
    );
  };

  const isAiSuggestion = itinerary.id.startsWith('ai-itinerary');

  // Render the card only if it has activities
  if (itinerary.activities.length === 0 && itinerary.id !== 'default-itinerary') {
    return null;
  }

  return (
    <SortableContext items={itinerary.activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
      <Card className="w-full" ref={setNodeRef}>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className='flex-1'>
              <div className="flex items-center gap-4">
                <CardTitle>{itinerary.title}</CardTitle>
                {duration && (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{duration} total</span>
                  </div>
                )}
              </div>
              {itinerary.prompt ? (
                  <CardDescription className="italic mt-1">"{itinerary.prompt}"</CardDescription>
              ) : isAiSuggestion ? (
                  <CardDescription>A set of AI-generated activities.</CardDescription>
              ) : null}
          </div>
          {isAiSuggestion && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className='ml-4'>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <span className="sr-only">Remove Itinerary</span>
                </Button>
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
