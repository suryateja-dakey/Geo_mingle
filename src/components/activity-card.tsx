'use client';

import type { Activity } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';

export function ActivityCard({ activity }: { activity: Activity }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-4 gap-4">
          <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <GripVertical />
          </div>
          <div className="flex-grow">
            <p className="font-medium">{activity.description}</p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
          {activity.isCustom ? (
            <Badge variant="outline">Custom</Badge>
          ) : (
            <Badge variant="secondary">AI</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
