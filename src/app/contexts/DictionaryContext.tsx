'use client';

import { createContext, useContext } from 'react';
import type { Dictionary } from '@/lib/getDictionary';

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  children,
  dictionary
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary musí být použit uvnitř DictionaryProvider');
  }
  return context;
}