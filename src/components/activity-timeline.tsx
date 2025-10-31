'use client';

import type { Activity } from '@/lib/types';
import { ActivityCard } from './activity-card';

interface ActivityTimelineProps {
  activities: Activity[];
  itineraryId: string;
  removeActivity: (activityId: string, itineraryId: string) => void;
  city: string | null;
  onActivityClick: (activity: Activity) => void;
}

export function ActivityTimeline({ activities, itineraryId, removeActivity, city, onActivityClick }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
        <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
                Drag and drop events here.
            </p>
        </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} onRemove={() => removeActivity(activity.id, itineraryId)} city={city} onClick={onActivityClick} />
      ))}
    </div>
  );
}
