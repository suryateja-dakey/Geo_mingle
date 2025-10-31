'use client';

import Lottie from "lottie-react";
import animationData from '@/lib/lottie-animation.json';

export function GeneratingLoader() {
  // The Lottie library can sometimes have issues with how Next.js handles JSON imports.
  // Directly passing the imported object can cause issues.
  // A simple workaround is to stringify and parse it, which ensures it's a plain object.
  const animation = JSON.parse(JSON.stringify(animationData));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48">
            <Lottie animationData={animation} loop={true} />
        </div>
        <p className="text-lg font-medium text-foreground -mt-4">Crafting your itinerary...</p>
        <p className="text-sm text-muted-foreground">This may take a few moments.</p>
      </div>
    </div>
  );
}
