

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
import { Bot, Plus, Telescope, Linkedin, Mail, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ItineraryCard } from '@/components/itinerary-card';
import { Separator } from '@/components/ui/separator';
import { ShareItineraryDialog } from '@/components/share-itinerary-dialog';
import { CityProvider } from '@/hooks/use-city-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

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
        setItineraries([{ id: 'default-itinerary', title: "My Custom Plan", activities: [] }]);
      }
    } catch (error) {
      console.error("Failed to parse itineraries from localStorage", error);
      setItineraries([{ id: 'default-itinerary', title: "My Custom Plan", activities: [] }]);
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
          title: "My Custom Plan",
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
        title: `Your One Day Plan in ${currentCity}`,
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

  const handleQuickPlan = () => {
    handleGenerateItinerary("A balanced and interesting day with 3 to 5 activities.");
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
            <h1 className="text-3xl font-bold tracking-tight mb-8">Today's Plan</h1>
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
                    Plan your perfect day. Add events manually or use our AI to create a personalized itinerary. Click the magic wand to get started!
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleQuickPlan} disabled={isGenerating}>
                      <Zap className="mr-2 h-4 w-4" />
                      Quick Plan
                    </Button>
                  </div>
                </div>
              )}
            </DndContext>
          </div>
        </main>

        <footer className="py-6 mt-auto bg-background/50">
          <div className="container flex flex-col items-center justify-center text-sm text-muted-foreground">
            <p>Developed by Suryateja Dakey &copy; {new Date().getFullYear()}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
              <a href="https://www.linkedin.com/in/suryateja-dakey/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                LinkedIn
              </a>
              <a href="https://wa.me/918328166464" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M19.782 14.507c-.381-.192-2.24-1.104-2.588-1.23-.348-.124-.6-.192-.853.125-.252.316-.978 1.229-1.2 1.481-.222.253-.444.282-.825.09-1.578-.783-2.8-1.48-3.883-2.771-1.01-1.21-1.623-2.316-1.874-2.923-.252-.607-.024-.91.204-1.168.205-.239.444-.627.666-.939.222-.312.296-.525.444-.88.148-.354.074-.656-.037-.85-.11-.192-.852-2.046-1.168-2.802-.308-.73-.625-.63-.852-.642-.21-.012-.444-.012-.666-.012-.222 0-.592.083-.907.41-.315.328-1.2.978-1.2 2.38 0 1.402 1.23 2.76 1.402 2.964.173.204 2.422 3.82 5.86 5.176 3.44 1.356 3.44 1.012 4.052.948.612-.064 1.838-.752 2.1-1.459.261-.707.261-1.31.185-1.437-.074-.125-.296-.193-.678-.386zM12.002.431C5.372.431 0 5.802 0 12.432c0 2.29.608 4.47 1.714 6.34L.055 23.568l4.982-1.658a11.943 11.943 0 0 0 6.965 1.94h.001c6.63 0 12-5.37 12-12.001C24.002 5.802 18.632.431 12.002.431z"/></svg>
                WhatsApp
              </a>
              <a href="mailto:suryateja.dakey@gmail.com" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none">
                    <path d="M2.5 4.5h19A1.5 1.5 0 0 1 23 6v12a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 18V6a1.5 1.5 0 0 1 1.5-1.5z" fill="#D44638"/>
                    <path d="M5.503 7.625c.34-.334.82-.472 1.252-.39.405.076.78.33 1.08.694l3.12 3.649c.2.23.47.36.75.36s.55-.13.75-.36l3.12-3.649a1.5 1.5 0 0 1 2.332 1.934l-3.616 4.228c-.28.328-.68.514-1.1.514s-.82-.186-1.1-.514L3.171 9.56a1.5 1.5 0 0 1 2.332-1.934z" fill="#fff"/>
                  </g>
                </svg>
                Email
              </a>
            </div>
          </div>
        </footer>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setAiSheetOpen(true)}
                disabled={isGenerating}
                className={cn(
                  'rounded-full shadow-lg h-14 animate-pulse',
                  isMobile ? 'w-14' : 'px-6'
                )}
              >
                <Bot className={cn('h-7 w-7', !isMobile && 'mr-2')} />
                {!isMobile && 'Plan with AI'}
                <span className="sr-only">Suggest a plan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Suggest a plan</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={isMobile ? 'icon' : 'default'}
                variant="secondary"
                className={cn(
                  'rounded-full shadow-lg h-14',
                  isMobile ? 'w-14' : 'px-6'
                )}
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className={cn('h-7 w-7', !isMobile && 'mr-2')} />
                {!isMobile && 'Add Event'}
                <span className="sr-only">Add Event</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Event</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
