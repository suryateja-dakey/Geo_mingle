'use client';

import { useLocation } from '@/hooks/use-location';
import { Compass, MapPin, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { Skeleton } from './ui/skeleton';

export function MainHeader() {
  const { theme, setTheme } = useTheme();
  const { city, loading } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <a href="/" className="mr-4 flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Geo Mingle</span>
        </a>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {loading ? <Skeleton className="h-4 w-24" /> : <span>{city}</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
