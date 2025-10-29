'use client';

import type { Activity } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';

interface ActivityDetailDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: string | null;
}

export function ActivityDetailDialog({ activity, open, onOpenChange, city }: ActivityDetailDialogProps) {
  if (!activity) {
    return null;
  }

  const LocationLink = ({ location, city }: { location?: string; city: string | null }) => {
    if (!location || !city) return <p className="text-muted-foreground">{activity.description}</p>;

    const query = encodeURIComponent(`${location}, ${city}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    return (
      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
        <MapPin className="h-4 w-4" />
        {location}
      </a>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{activity.location || activity.description}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 pt-2">
             <LocationLink location={activity.location} city={city} />
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {activity.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={activity.imageUrl}
                alt={activity.description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{activity.time}</span>
          </div>
          <p className="text-base">{activity.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
