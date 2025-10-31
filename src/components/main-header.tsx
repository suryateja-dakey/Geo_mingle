'use client';

import { Compass, MapPin, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { AutocompleteInput } from './autocomplete-input';

interface MainHeaderProps {
    city: string | null;
    loading: boolean;
    onCityChange: (city: string) => void;
}

export function MainHeader({ city, loading, onCityChange }: MainHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg backdrop-saturate-150">
      <div className="container flex h-16 items-center">
        <a href="/" className="mr-4 flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Geo Mingle</span>
        </a>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[200px]">
            <MapPin className="h-4 w-4" />
            <AutocompleteInput
              value={city}
              onChange={onCityChange}
              loading={loading}
              className="w-full"
            />
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
