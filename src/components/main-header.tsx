
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
      <div className="container flex h-auto min-h-16 flex-col items-center justify-between py-2 md:flex-row md:py-0">
        <a href="/" className="flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Geo Mingle</span>
        </a>
        <div className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border p-1 md:mt-0 md:w-auto md:justify-end">
          <div className="flex flex-1 items-center gap-2 rounded-md bg-transparent px-2 text-sm text-muted-foreground md:flex-initial">
            <MapPin className="h-4 w-4" />
            <AutocompleteInput
              value={city}
              onChange={onCityChange}
              loading={loading}
              className="w-full flex-1"
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
