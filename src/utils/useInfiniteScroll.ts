import { useState, useEffect, useRef, useCallback, type RefObject } from "react";

type Result = {
  items: unknown[];
  initialLoading: boolean;
  loadingMore: boolean;
  error: string;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Unique key for the item at index i (used by grids when movie/TV ids collide) */
  itemKey: (item: unknown, index: number) => string;
};

/**
 * Generic paged loader with IntersectionObserver-driven infinite scroll.
 * `fetchPage(page, key)` must return the next batch; an empty batch ends paging.
 * Changing `key` fully resets the list (used for dropdown switches).
 */
export function useInfiniteScroll(
  key: string,
  fetchPage: (page: number, key: string) => Promise<unknown[]>
): Result {
  const [items, setItems] = useState<unknown[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // (Re)start loading whenever the key changes
  useEffect(() => {
    loadingRef.current = false;
    pageRef.current = 1;
    setItems([]);
    setError("");
    setHasMore(true);
    setLoadingMore(false);
    setInitialLoading(true);

    let cancelled = false;
    (async () => {
      try {
        const batch = await fetchRef.current(1, key);
        if (cancelled) return;
        setItems(batch);
        setHasMore(batch.length > 0);
        pageRef.current = 2;
      } catch {
        if (!cancelled) setError("Failed to load");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || initialLoading || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const page = pageRef.current;
    fetchRef
      .current(page, key)
      .then((batch) => {
        setItems((prev) => [...prev, ...batch]);
        if (batch.length === 0) setHasMore(false);
        pageRef.current = page + 1;
      })
      .catch(() => setError("Failed to load"))
      .finally(() => {
        loadingRef.current = false;
        setLoadingMore(false);
      });
  }, [key, hasMore, initialLoading]);

  // Observe the sentinel and pull the next page when it enters view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "500px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const itemKey = useCallback((item: unknown, index: number) => {
    const rec = item as {
      media_type?: string;
      provider?: string;
      title?: string;
      id?: number;
    };
    return `${rec.media_type ?? "m"}-${rec.provider ?? ""}-${rec.id ?? "x"}-${
      rec.title ?? ""
    }-${index}`;
  }, []);

  return { items, initialLoading, loadingMore, error, hasMore, sentinelRef, itemKey };
}
