'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, restoreSaved } from '@/store';

const STORAGE_KEY = 'crafttable:saved-workshops';

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(value)) store.dispatch(restoreSaved(value.filter((id): id is string => typeof id === 'string')));
    } catch {
      // Saving is optional; a blocked or corrupted storage area must not prevent browsing.
    }
    return store.subscribe(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().savedWorkshops.ids)); }
      catch { /* Browsing and registrations remain available without local storage. */ }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
