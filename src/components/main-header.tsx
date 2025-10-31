'use client';

import { Compass, MapPin, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { AutocompleteInput } from './autocomplete-input';
import { useCity } from '@/hooks/use-city';
import { useEffect } from 'react';

interface MainHeaderProps {
    city: string | null;
    loading: boolean;
    onCityChange: (city: string) => void;
}

export function MainHeader({ city, loading, onCityChange }: MainHeaderProps) {
  const { setTheme } = useTheme();
  const { setCity: setGlobalCity } = useCity();

  // Keep global city state in sync with local state
  useEffect(() => {
    setGlobalCity(city);
  }, [city, setGlobalCity]);

  // Use a local state for theme to avoid re-rendering the whole context
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="w-1/3">
            {/* Empty div to balance the flex layout */}
        </div>
        <div className="w-1/3 flex justify-center">
            <a href="/" className="flex items-center gap-3">
              <Compass className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Geo Mingle</span>
            </a>
        </div>
        <div className="w-1/3 flex justify-end items-center gap-4">
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
