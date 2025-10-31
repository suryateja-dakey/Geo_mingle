
'use client';

import React, { useState, ReactNode } from 'react';
import { CityContext } from './use-city';

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<string | null>(null);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}
