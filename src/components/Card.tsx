import { useState } from "react";
import { Plus, Check, Star } from "lucide-react";
import type { MediaItem } from "../data/tmdb";

type Props = {
  item: MediaItem;
  index: number;
  isLarge?: boolean;
  inList: boolean;
  onClick: () => void;
  onPlay: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
};

export default function Card({
  item,
  index: _index,
  isLarge,
  inList,
  onClick,
  onPlay,
  onToggleList,
}: Props) {
  const [hover, setHover] = useState(false);

  const title = item.title;
  const year = item.year && item.year !== "—" ? item.year : null;
  const rating = item.rating > 0 ? item.rating.toFixed(1) : null;

  const width = isLarge ? "w-[170px] md:w-[210px]" : "w-[150px] md:w-[190px]";
  const height = isLarge ? "h-[250px] md:h-[310px]" : "h-[220px] md:h-[280px]";

  return (
    <div
      className={`relative ${width} shrink-0 transition-transform duration-300 ease-out ${
        hover ? "z-10 scale-[1.045]" : "z-0 scale-100"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`${width} ${height} relative rounded-lg overflow-hidden cursor-pointer bg-bg-secondary ring-1 ring-line transition-[box-shadow,ring-color] duration-300 ${
          hover ? "shadow-lift ring-line-strong" : "shadow-card"
        }`}
        onClick={onClick}
      >
        <img
          src={item.poster}
          alt={title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            hover ? "scale-[1.04]" : "scale-100"
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0.3";
          }}
        />

        {/* Bottom gradient + persistent meta */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pointer-events-none">
          <p className="text-white font-medium text-[13px] leading-snug mb-0.5 line-clamp-2">
            {title}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary tnum">
            {rating && (
              <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                <Star size={10} fill="currentColor" />
                {rating}
              </span>
            )}
            {rating && year && <span className="text-white/25">·</span>}
            {year && <span>{year}</span>}
          </div>
        </div>

        {/* Hover actions */}
        <div
          className={`absolute inset-x-0 top-0 p-2 flex justify-end pointer-events-none transition-opacity duration-200 ${
            hover ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleList(item);
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-line-strong flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            aria-label={inList ? "Remove from My List" : "Add to My List"}
            title={inList ? "Remove from My List" : "Add to My List"}
          >
            {inList ? <Check size={14} className="text-accent" /> : <Plus size={14} />}
          </button>
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            hover ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="pointer-events-auto w-11 h-11 bg-solid text-solid-text rounded-full flex items-center justify-center shadow-lift hover:scale-105 active:scale-95 transition-transform"
            aria-label={`Play ${title}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 4.8v14.4c0 1.1 1.2 1.8 2.2 1.2l11-7.2c.9-.6.9-1.9 0-2.4l-11-7.2C8.2 3 7 3.7 7 4.8z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
