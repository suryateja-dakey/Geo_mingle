
'use client';

import { createContext, useContext, useState } from 'react';

interface CityContextType {
  city: string | null;
  setCity: (city: string | null) => void;
}

export const CityContext = createContext<CityContextType | undefined>(undefined);

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
