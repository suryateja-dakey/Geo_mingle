'use client';

import { useState, useEffect } from 'react';

type LocationState = {
  city: string | null;
  loading: boolean;
  error: string | null;
};

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    city: 'Detecting location...',
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    
    if (!navigator.geolocation) {
      if(isMounted) {
        setLocation({
          city: 'New York', // Fallback city
          loading: false,
          error: 'Geolocation is not supported by your browser.',
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMounted) return;
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch location data.');
          }
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown location';
          if(isMounted) setLocation({ city, loading: false, error: null });
        } catch (error) {
          if(isMounted) {
            setLocation({
              city: 'New York', // Fallback city
              loading: false,
              error: 'Could not determine city name.',
            });
          }
        }
      },
      () => {
        if(isMounted) {
          setLocation({
            city: 'New York', // Fallback city
            loading: false,
            error: 'Permission to access location was denied.',
          });
        }
      }
    );
    
    return () => {
      isMounted = false;
    }
  }, []);

  return location;
}
