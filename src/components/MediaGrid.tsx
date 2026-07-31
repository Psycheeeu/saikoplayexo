import type { MediaItem } from "../data/tmdb";
import Card from "./Card";
import { useInfiniteScroll } from "../utils/useInfiniteScroll";

type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
  /** Changes to this key reset and reload the list */
  scrollKey: string;
  fetchPage: (page: number, key: string) => Promise<unknown[]>;
  /** Optional inline control (e.g. genre/provider dropdown) in the header */
  control?: React.ReactNode;
  myListIds: number[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
};

export default function MediaGrid({
  title,
  eyebrow,
  description,
  scrollKey,
  fetchPage,
  control,
  myListIds,
  onSelect,
  onPlay,
  onToggleList,
}: Props) {
  const { items, initialLoading, loadingMore, error, hasMore, sentinelRef, itemKey } =
    useInfiniteScroll(scrollKey, fetchPage);

  const media = items as MediaItem[];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-12">
      {/* Page header — optional dropdown control pinned to the right */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8 mt-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-secondary mt-1.5">{description}</p>
          )}
        </div>
        {control && <div className="shrink-0">{control}</div>}
      </div>

      {error ? (
        <p className="text-text-secondary text-sm py-16 text-center">
          Couldn’t load this page. {error}
        </p>
      ) : initialLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-full aspect-[2/3] rounded-lg skeleton" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <p className="text-text-secondary text-sm py-16 text-center">
          Nothing here yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
            {media.map((item, idx) => (
              <Card
                key={itemKey(item, idx)}
                item={item}
                index={idx}
                inList={myListIds.includes(item.id)}
                onClick={() => onSelect(item)}
                onPlay={onPlay}
                onToggleList={onToggleList}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {loadingMore && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full aspect-[2/3] rounded-lg skeleton" />
              ))}
            </div>
          )}

          {!hasMore && media.length > 0 && (
            <p className="text-center text-xs text-text-muted mt-12">
              You’ve reached the end of the catalog.
            </p>
          )}
        </>
      )}
    </div>
  );
}
