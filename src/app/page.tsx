
'use client';

import { useState, useEffect, Fragment } from 'react';
import type { Activity, Itinerary } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { generateInitialItinerary } from '@/ai/flows/generate-initial-itinerary';
import { getActivityPhoto } from '@/ai/flows/get-activity-photo';
import { useToast } from '@/hooks/use-toast';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { MainHeader } from '@/components/main-header';
import { AddActivityDialog } from '@/components/add-activity-dialog';
import { AiSuggestionSheet } from '@/components/ai-suggestion-sheet';
import { ActivityDetailDialog } from '@/components/activity-detail-dialog';
import { GeneratingLoader } from '@/components/generating-loader';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Telescope, Linkedin, Mail, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ItineraryCard } from '@/components/itinerary-card';
import { Separator } from '@/components/ui/separator';
import { ShareItineraryDialog } from '@/components/share-itinerary-dialog';
import { CityProvider } from '@/hooks/use-city-provider';

function HomePageContent() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isAiSheetOpen, setAiSheetOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryToShare, setItineraryToShare] = useState<Itinerary | null>(null);
  
  const { city: detectedCity, loading: locationLoading } = useLocation();
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  
  const updateActivityTime = (activityId: string, itineraryId: string, newTime: string) => {
    setItineraries(prev =>
      prev.map(itinerary =>
        itinerary.id === itineraryId
          ? {
              ...itinerary,
              activities: itinerary.activities.map(act =>
                act.id === activityId ? { ...act, time: newTime } : act
              ),
            }
          : itinerary
      )
    );
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
  
    const activeId = String(active.id);
    const overId = String(over.id);
  
    const activeItinerary = itineraries.find(it => it.activities.some(act => act.id === activeId));
    
    // Find if 'over' is an itinerary card or an activity card
    let overItinerary = itineraries.find(it => it.id === overId);
    if (!overItinerary) {
      overItinerary = itineraries.find(it => it.activities.some(act => act.id === overId));
    }
  
    if (!activeItinerary || !overItinerary) return;

    // Scenario 1: Reordering within the same itinerary
    if (activeItinerary.id === overItinerary.id) {
        const activities = activeItinerary.activities;
        const oldIndex = activities.findIndex((item) => item.id === activeId);
        const newIndex = activities.findIndex((item) => item.id === overId);

        if (oldIndex !== newIndex) {
            const newActivities = arrayMove(activities, oldIndex, newIndex);
            setItineraries(prev => prev.map(it => it.id === activeItinerary.id ? { ...it, activities: newActivities } : it));
        }
    } else {
    // Scenario 2: Moving to a different itinerary
        const activeActivities = activeItinerary.activities;
        const overActivities = overItinerary.activities;
        
        const activeIndex = activeActivities.findIndex(act => act.id === activeId);
        const overIndex = overActivities.findIndex(act => act.id === overId);

        const [movedActivity] = activeActivities.splice(activeIndex, 1);
        movedActivity.itineraryId = overItinerary.id;

        // If dropping on an activity, place it there. If dropping on the list, place at the end.
        const newOverIndex = overIndex !== -1 ? overIndex : overActivities.length;
        overActivities.splice(newOverIndex, 0, movedActivity);

        setItineraries(prev => prev.map(it => {
            if (it.id === activeItinerary.id) return { ...it, activities: activeActivities };
            if (it.id === overItinerary.id) return { ...it, activities: overActivities };
            return it;
        }));
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

  const hasContent = itineraries.some(it => it.activities.length > 0);

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {hasContent ? (
                <div className="space-y-8">
                  {itineraries.map((itinerary, index) => (
                    <Fragment key={itinerary.id}>
                      <ItineraryCard 
                        itinerary={itinerary} 
                        setItineraries={setItineraries} 
                        removeItinerary={removeItinerary}
                        removeActivity={removeActivity}
                        updateActivityTime={updateActivityTime}
                        onShare={() => setItineraryToShare(itinerary)}
                        onActivityClick={handleActivityClick} 
                      />
                      {index < itineraries.length - 1 && itineraries[index + 1]?.activities.length > 0 && itinerary.activities.length > 0 && <Separator className="my-8" />}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
                  <Telescope className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Welcome to Geo Mingle!</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    This is your AI-powered travel itinerary planner. Get started by adding a custom event, or let our AI create a personalized itinerary for you. Just describe your ideal day and we&apos;ll handle the rest!
                  </p>
                </div>
              )}
            </DndContext>
          </div>
        </main>

        <footer className="py-6 mt-auto bg-background/50">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Developed by Suryateja Dakey &copy; {new Date().getFullYear()}</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <a href="https://www.linkedin.com/in/suryateja-dakey/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a href="https://wa.me/918328166464" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.13 4.14 4.24-1.11a9.78 9.78 0 0 0 4.67 1.13h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.48 15.9c-.28.42-.99.79-1.37.84-.38.05-1.02.05-1.57-.17-.55-.22-1.32-.49-2.3-1.08-1.42-.87-2.37-1.99-2.61-2.92-.12-.47-.03-1.02.23-1.39.22-.3.47-.45.67-.45.2 0 .36.01.49.02.13.01.27.02.4.3.18.27.29.62.29.62s.11.3.01.55c-.1.25-.13.28-.26.41-.13.13-.23.23-.33.33-.08.08-.16.16-.06.26.09.11.45.69 1.13 1.33.91.85 1.57 1.16 2.12 1.31.11.03.3.06.41-.03.11-.09.41-.5.54-.67s.24-.26.41-.16c.17.1.55.26.55.26s.28.18.31.28c.03.1.04.28-.01.53z" /></svg>
                WhatsApp
              </a>
              <a href="mailto:suryateja.dakey@gmail.com" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a href="mailto:suryateja.dakey@gmail.com?subject=Resume Request" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <Download className="h-4 w-4" />
                Download Resume
              </a>
            </div>
          </div>
        </footer>
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
      <ShareItineraryDialog 
        itinerary={itineraryToShare}
        open={!!itineraryToShare}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setItineraryToShare(null);
          }
        }}
      />
    </>
  );
}


export default function Home() {
  return (
    <CityProvider>
      <HomePageContent />
    </CityProvider>
  )
}

    

    