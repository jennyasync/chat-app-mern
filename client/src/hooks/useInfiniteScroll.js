import { useEffect, useRef } from 'react';

export function useInfiniteScroll(onLoadMore, { hasMore = true, rootMargin = '200px' } = {}) {
  const sentinelRef = useRef(null);
  // Stops the same intersection from calling onLoadMore again while a fetch is still running.
  const loadingRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || loadingRef.current) return;

        loadingRef.current = true;
        try {
          await onLoadMore();
        } finally {
          loadingRef.current = false;
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, rootMargin]);

  return sentinelRef;
}
