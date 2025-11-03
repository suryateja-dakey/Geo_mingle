'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface Suggestion {
  place_id: number;
  display_name: string;
}

interface AutocompleteInputProps {
  value: string | null;
  onChange: (value: string) => void;
  loading?: boolean;
  className?: string;
}

export function AutocompleteInput({ value, onChange, loading, className }: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isListOpen, setListOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const debouncedSearchTerm = useDebounce(inputValue, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 1) {
      setIsFetching(true);
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedSearchTerm}&featuretype=city&limit=5`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'GeoMingle/1.0 (https://geo-mingle.vercel.app)',
              },
            }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
          }
          const data: Suggestion[] = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error(error);
          setSuggestions([]);
        } finally {
          setIsFetching(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  const handleSelect = (suggestion: Suggestion) => {
    const cityName = suggestion.display_name.split(',')[0];
    setInputValue(cityName);
    onChange(cityName);
    setListOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isListOpen) {
      setListOpen(true);
    }
  };

  if (loading) {
    return <Skeleton className="h-8 w-32" />;
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setListOpen(true)}
        placeholder="Enter a city..."
        className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {isListOpen && (inputValue.length > 1) && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          <Command>
            <CommandList>
              {isFetching ? (
                <div className="p-2">Searching...</div>
              ) : (
                <>
                  <CommandEmpty>{suggestions.length === 0 && debouncedSearchTerm ? 'No results found.' : ''}</CommandEmpty>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.place_id}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      {suggestion.display_name}
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
