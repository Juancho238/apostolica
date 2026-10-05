import { useEffect, useState } from 'react';
import type { Collection, ContentMap } from '../lib/contentApi';
import { getContent } from '../lib/contentApi';

export function usePublicContent<K extends Collection>(
  collection: K,
  fallback: ContentMap[K][],
) {
  const [items, setItems] = useState<ContentMap[K][]>(fallback);

  useEffect(() => {
    let active = true;
    getContent(collection)
      .then((stored) => {
        if (active && stored.length > 0) setItems(stored);
      })
      .catch((error) => console.error(`Unable to load ${collection}:`, error));
    return () => {
      active = false;
    };
  }, [collection]);

  return items;
}
