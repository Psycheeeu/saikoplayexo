import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaItem } from "../data/tmdb";
import Card from "./Card";

export type RowFilter = {
  options: { id: number; name: string }[];
  label: string;
  load: (id: number) => Promise<MediaItem[]>;
};

type Props = {
  title: string;
  items: MediaItem[];
  loading?: boolean;
  error?: string;
  isLarge?: boolean;
  myListIds: number[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
  filter?: RowFilter;
};

export default function Row({
  title,
  items,
  loading,
  error,
  isLarge,
  myListIds,
  onSelect,
  onPlay,
  onToggleList,
  filter,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<number>(
    () => filter?.options[0]?.id ?? 0
  );
  const [filterItems, setFilterItems] = useState<MediaItem[] | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleFilterChange = async (id: number) => {
    if (!filter) return;
    setSelectedFilter(id);
    setFilterLoading(true);
    try {
      const results = await filter.load(id);
      setFilterItems(results);
    } catch {
      setFilterItems([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const displayItems = filterItems ?? items;
  const isLoading = loading || filterLoading;

  const skeletonWidth = isLarge ? "w-[170px] md:w-[210px]" : "w-[150px] md:w-[190px]";
  const skeletonHeight = isLarge ? "h-[250px] md:h-[310px]" : "h-[220px] md:h-[280px]";

  const filterSelectClass =
    "appearance-none bg-bg-secondary ring-1 ring-line rounded-lg pl-3 pr-8 py-1.5 text-[12.5px] font-medium text-text-primary hover:ring-line-strong transition-all cursor-pointer bg-no-repeat max-w-[132px] sm:max-w-none";
  const chevronStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d6d77' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundPosition: "right 0.65rem center",
  } as const;

  return (
    <section className="group/row relative">
      {/* Section header — filter menu sits beside the scroll buttons */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-12 mb-3.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-text-primary truncate">
          {title}
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          {filter && (
            <div className="order-2">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(Number(e.target.value))}
                className={filterSelectClass}
                style={chevronStyle}
                aria-label={`Filter ${title} by ${filter.label}`}
              >
                {filter.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isLoading && !error && displayItems.length > 0 && (
            <div className="order-1 hidden md:flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => scroll("left")}
                className="w-7 h-7 rounded-md ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all"
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-7 h-7 rounded-md ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all"
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden px-4 md:px-12 pt-2 pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`${skeletonWidth} ${skeletonHeight} shrink-0 rounded-lg skeleton`}
            />
          ))}
        </div>
      ) : error ? (
        <p className="px-4 md:px-12 py-8 text-sm text-text-muted">
          Couldn’t load this row. {error}
        </p>
      ) : displayItems.length === 0 ? (
        <p className="px-4 md:px-12 py-8 text-sm text-text-muted">Nothing here yet.</p>
      ) : (
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto px-4 md:px-12 pt-2 pb-4 hide-scrollbar scroll-smooth"
        >
          {displayItems.map((item, index) => (
            <Card
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              isLarge={isLarge}
              inList={myListIds.includes(item.id)}
              onClick={() => onSelect(item)}
              onPlay={onPlay}
              onToggleList={onToggleList}
            />
          ))}
        </div>
      )}
    </section>
  );
}
