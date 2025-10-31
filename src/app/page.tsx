'use client';

import { useState, useEffect, Fragment } from 'react';
import type { Activity, Itinerary } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { generateInitialItinerary } from '@/ai/flows/generate-initial-itinerary';
import { getActivityPhoto } from '@/ai/flows/get-activity-photo';
import { useToast } from '@/hooks/use-toast';

import { MainHeader } from '@/components/main-header';
import { AddActivityDialog } from '@/components/add-activity-dialog';
import { AiSuggestionSheet } from '@/components/ai-suggestion-sheet';
import { ActivityDetailDialog } from '@/components/activity-detail-dialog';
import { GeneratingLoader } from '@/components/generating-loader';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Telescope } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ItineraryCard } from '@/components/itinerary-card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isAiSheetOpen, setAiSheetOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { city: detectedCity, loading: locationLoading } = useLocation();
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedItineraries = localStorage.getItem('geomingle-itineraries');
      if (storedItineraries) {
        setItineraries(JSON.parse(storedItineraries));
      } else {
        // Initialize with a default itinerary if none exists
        setItineraries([{ id: 'default-itinerary', title: "My Custom Events", activities: [] }]);
      }
    } catch (error) {
      console.error("Failed to parse itineraries from localStorage", error);
      setItineraries([{ id: 'default-itinerary', title: "My Custom Events", activities: [] }]);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('geomingle-itineraries', JSON.stringify(itineraries));
    }
  }, [itineraries, isMounted]);

  useEffect(() => {
    if (detectedCity) {
      setCurrentCity(detectedCity);
    }
  }, [detectedCity]);

  const addActivity = (activity: Omit<Activity, 'id' | 'isCustom' | 'itineraryId'>) => {
    const newActivity: Activity = { 
      ...activity, 
      id: crypto.randomUUID(), 
      isCustom: true,
      itineraryId: 'default-itinerary'
    };

    setItineraries(prev => {
      const defaultItineraryExists = prev.some(it => it.id === 'default-itinerary');

      if (defaultItineraryExists) {
        return prev.map(it => 
          it.id === 'default-itinerary' 
            ? { ...it, activities: [...it.activities, newActivity] }
            : it
        );
      } else {
        // This case handles if the default itinerary was somehow deleted.
        const newDefaultItinerary: Itinerary = {
          id: 'default-itinerary',
          title: "My Custom Events",
          activities: [newActivity]
        };
        return [...prev, newDefaultItinerary];
      }
    });

    setAddDialogOpen(false);
  };

  const removeActivity = (activityId: string, itineraryId: string) => {
    setItineraries(prev => prev.map(it => 
      it.id === itineraryId 
        ? { ...it, activities: it.activities.filter(act => act.id !== activityId) }
        : it
    ));
  };

  const removeItinerary = (itineraryId: string) => {
    setItineraries(prev => prev.filter(it => it.id !== itineraryId));
  }
  
  const fetchImageForActivity = async (activityId: string, itineraryId: string, query: string) => {
    try {
      const imageUrl = await getActivityPhoto({ query });
      if (imageUrl) {
        setItineraries(prev =>
          prev.map(itinerary => 
            itinerary.id === itineraryId
              ? { ...itinerary, activities: itinerary.activities.map(act => act.id === activityId ? { ...act, imageUrl } : act) }
              : itinerary
          )
        );
      }
    } catch (error) {
      console.error(`Failed to fetch image for ${query}:`, error);
    }
  };


  const handleGenerateItinerary = async (prompt: string) => {
    if (!currentCity || locationLoading) {
      toast({
        variant: 'destructive',
        title: 'Location not found',
        description: 'Please wait for location detection or enter a location.',
      });
      return;
    }

    setAiSheetOpen(false);
    setIsGenerating(true);

    try {
      const result = await generateInitialItinerary({ city: currentCity, prompt });
      
      const itineraryId = `ai-itinerary-${crypto.randomUUID()}`;
      const newActivities: Activity[] = result.activities.map(activity => ({
        ...activity,
        id: crypto.randomUUID(),
        isCustom: false,
        itineraryId,
      }));

      const newItinerary: Itinerary = {
        id: itineraryId,
        title: `AI Suggestions for ${currentCity}`,
        activities: newActivities,
        prompt: prompt,
      };

      setItineraries(prev => [...prev, newItinerary]);
      
      toast({
        title: 'Itinerary generated!',
        description: `Added ${newActivities.length} new activities. Fetching images...`,
      });

      // Progressively fetch images
      newActivities.forEach(activity => {
        if (activity.location && currentCity) {
          fetchImageForActivity(activity.id, itineraryId, `${activity.location}, ${currentCity}`);
        }
      });

    } catch (error) {
      console.error('AI generation failed', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate itinerary. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.imageUrl) {
      setSelectedActivity(activity);
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

  const visibleItineraries = itineraries.filter(it => it.activities.length > 0);
  const hasContent = visibleItineraries.length > 0;

  return (
    <>
      {isGenerating && <GeneratingLoader />}
      <div className="flex flex-col min-h-screen">
        <MainHeader 
          city={currentCity}
          onCityChange={setCurrentCity}
          loading={locationLoading}
        />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Your today's plan</h1>
            {hasContent ? (
              <div className="space-y-8">
                {visibleItineraries.map((itinerary, index) => (
                  <Fragment key={itinerary.id}>
                    <ItineraryCard 
                      itinerary={itinerary} 
                      setItineraries={setItineraries} 
                      removeItinerary={removeItinerary}
                      removeActivity={removeActivity}
                      city={currentCity} 
                      onActivityClick={handleActivityClick} 
                    />
                    {index < visibleItineraries.length - 1 && <Separator className="my-8" />}
                  </Fragment>
                ))}
              </div>
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
        <Button size="lg" variant="secondary" className="rounded-full shadow-lg" onClick={() => setAiSheetOpen(true)} disabled={isGenerating}>
            <Bot className="mr-2 h-5 w-5" /> AI Suggestion
        </Button>
      </div>

      <AddActivityDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAddActivity={addActivity} />
      <AiSuggestionSheet open={isAiSheetOpen} onOpenChange={setAiSheetOpen} onGenerate={handleGenerateItinerary} isGenerating={isGenerating} />
      <ActivityDetailDialog 
        activity={selectedActivity} 
        open={!!selectedActivity} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedActivity(null);
          }
        }}
        city={currentCity}
      />
    </>
  );
}

    