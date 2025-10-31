'use client';

import { Loader2 } from 'lucide-react';

export function GeneratingLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Crafting your itinerary...</p>
        <p className="text-sm text-muted-foreground">This may take a few moments.</p>
      </div>
    </div>
  );
}
