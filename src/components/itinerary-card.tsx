'use client';

import type { Activity, Itinerary } from '@/lib/types';
import { ActivityTimeline } from './activity-timeline';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
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

interface ItineraryCardProps {
  itinerary: Itinerary;
  setItineraries: React.Dispatch<React.SetStateAction<Itinerary[]>>;
  removeItinerary: (id: string) => void;
  removeActivity: (activityId: string, itineraryId: string) => void;
  city: string | null;
  onActivityClick: (activity: Activity) => void;
}

export function ItineraryCard({ itinerary, setItineraries, removeItinerary, removeActivity, city, onActivityClick }: ItineraryCardProps) {

  const handleSetActivities = (itineraryId: string, newActivities: Activity[]) => {
    setItineraries(prev =>
      prev.map(it =>
        it.id === itineraryId ? { ...it, activities: newActivities } : it
      )
    );
  };

  const isAiSuggestion = itinerary.id.startsWith('ai-itinerary');

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className='flex-1'>
            <CardTitle>{itinerary.title}</CardTitle>
            {itinerary.prompt ? (
                <CardDescription className="italic mt-1">"{itinerary.prompt}"</CardDescription>
            ) : isAiSuggestion && (
                <CardDescription>A set of AI-generated activities.</CardDescription>
            )}
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
          setActivities={handleSetActivities}
          removeActivity={removeActivity}
          city={city}
          onActivityClick={onActivityClick}
        />
      </CardContent>
    </Card>
  );
}
