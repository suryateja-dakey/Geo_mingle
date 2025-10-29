'use client';

import { useState, useEffect } from 'react';
import type { Activity } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { generateInitialItinerary } from '@/ai/flows/generate-initial-itinerary';
import { useToast } from '@/hooks/use-toast';

import { MainHeader } from '@/components/main-header';
import { ActivityTimeline } from '@/components/activity-timeline';
import { AddActivityDialog } from '@/components/add-activity-dialog';
import { AiSuggestionSheet } from '@/components/ai-suggestion-sheet';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Telescope } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isAiSheetOpen, setAiSheetOpen] = useState(false);
  
  const { city } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('roamright-activities');
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error("Failed to parse activities from localStorage", error);
      setActivities([]);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('roamright-activities', JSON.stringify(activities));
    }
  }, [activities, isMounted]);

  const addActivity = (activity: Omit<Activity, 'id' | 'isCustom'>) => {
    setActivities(prev => [...prev, { ...activity, id: crypto.randomUUID(), isCustom: true }]);
    setAddDialogOpen(false);
  };

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const handleGenerateItinerary = async (prompt: string) => {
    if (!city || city === 'Detecting location...') {
      toast({
        variant: 'destructive',
        title: 'Location not found',
        description: 'Please wait for location detection or enable permissions.',
      });
      return;
    }

    try {
      const result = await generateInitialItinerary({ city, prompt });
      
      const newActivities: Activity[] = result.activities.map(activity => ({
        ...activity,
        id: crypto.randomUUID(),
        isCustom: false,
      }));

      setActivities(prev => [...prev, ...newActivities]);
      setAiSheetOpen(false);
      toast({
        title: 'Itinerary generated!',
        description: `Added ${newActivities.length} new activities to your timeline.`,
      });
    } catch (error) {
      console.error('AI generation failed', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate itinerary. Please try again.',
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </header>
        <main className="flex-1">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Your Daily Itinerary</h1>
            {activities.length > 0 ? (
              <ActivityTimeline activities={activities} setActivities={setActivities} removeActivity={removeActivity} city={city} />
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
                <Telescope className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Your Day Awaits</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your timeline is a blank canvas. Add an event or let our AI craft your journey.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button size="lg" className="rounded-full shadow-lg" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-5 w-5" /> Add Event
        </Button>
        <Button size="lg" variant="secondary" className="rounded-full shadow-lg" onClick={() => setAiSheetOpen(true)}>
            <Bot className="mr-2 h-5 w-5" /> AI Suggestion
        </Button>
      </div>

      <AddActivityDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAddActivity={addActivity} />
      <AiSuggestionSheet open={isAiSheetOpen} onOpenChange={setAiSheetOpen} onGenerate={handleGenerateItinerary} />
    </>
  );
}
