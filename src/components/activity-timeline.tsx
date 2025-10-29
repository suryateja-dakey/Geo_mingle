'use client';

import type { Activity } from '@/lib/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ActivityCard } from './activity-card';

interface ActivityTimelineProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  removeActivity: (id: string) => void;
  city: string | null;
  onActivityClick: (activity: Activity) => void;
}

export function ActivityTimeline({ activities, setActivities, removeActivity, city, onActivityClick }: ActivityTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activities} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} onRemove={removeActivity} city={city} onClick={onActivityClick} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
