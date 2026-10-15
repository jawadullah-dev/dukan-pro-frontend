'use client';

import { useEffect, useState } from 'react';

export function useDebouncedSearch(initialValue = '', delay = 250) {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, delay);
    return () => clearTimeout(timer);
  }, [search, delay]);

  return [search, debouncedSearch, setSearch] as const;
}
