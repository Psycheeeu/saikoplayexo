import { Play, Plus, Check, Info, Star } from "lucide-react";
import type { MediaItem } from "../data/tmdb";
import { IMG_ORIGINAL } from "../data/tmdb";

type Props = {
  item: MediaItem | null;
  loading?: boolean;
  inList: boolean;
  onPlay: (item: MediaItem) => void;
  onInfo: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
};

export default function Hero({ item, loading, inList, onPlay, onInfo, onToggleList }: Props) {
  if (loading || !item) {
    return (
      <div className="relative h-[70vh] md:h-[85vh] bg-bg-primary">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      </div>
    );
  }

  const title = item.title;
  const year = item.year;
  const overview = item.overview?.slice(0, 280) + (item.overview && item.overview.length > 280 ? "..." : "");
  const logoSrc = item.logoPath ? `${IMG_ORIGINAL}${item.logoPath}` : null;

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={item.backdrop}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient overlay */}
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-side-gradient absolute inset-0" />

      {/* Light theme subtle bottom wash for extra text safety */}
      {/* Content — original layout (mobile/tablet locked):
          bottom-anchored, hero starts at page top beneath the transparent nav */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 pb-20 md:pb-24">
        <div className="max-w-2xl space-y-4 lg:space-y-5 animate-fade-up">
          {/* Eyebrow — desktop only, keeps mobile/tablet structure untouched */}
          <p className="hidden lg:block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary dark:text-text-secondary hero-text-secondary">
            {item.media_type === "tv" ? "Series" : "Film"}
          </p>

          {/* Logo or title */}
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={title}
              className="max-w-[280px] md:max-w-[400px] max-h-[120px] lg:max-h-[110px] object-contain [html[data-theme=light]_&]:drop-shadow-[0_1px_1px_rgba(252,252,250,0.5)]"
            />
          ) : (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-[1.04] hero-text-primary">
              {title}
            </h1>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-y-1.5 text-sm lg:text-[13px] text-text-secondary tnum hero-text-secondary">
            {item.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-500" fill="currentColor" />
                <span className="text-text-primary font-medium tnum hero-text-primary">
                  {item.rating.toFixed(1)}
                </span>
              </span>
            )}
            {year && <span>{year}</span>}
            {year && item.runtime && <span className="text-text-muted">·</span>}
            {item.runtime && <span>{item.runtime}</span>}
            {item.genres && item.genres.length > 0 && (
              <span className="hidden lg:inline-flex items-center gap-3">
                <span className="text-text-muted">·</span>
                <span>{item.genres.slice(0, 3).join(", ")}</span>
              </span>
            )}
          </div>

          {/* Overview */}
          {overview && (
            <p className="text-text-secondary text-sm md:text-base lg:text-[15px] leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl hero-text-secondary">
              {overview}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-2.5 pt-2 lg:pt-1.5">
            <button
              onClick={() => onPlay(item)}
              className="px-6 py-3 lg:px-5 lg:py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all bg-solid text-solid-text [html[data-theme=light]_&]:bg-[#1a1a1c] [html[data-theme=light]_&]:text-white [html[data-theme=light]_&]:hover:bg-[#111113]"
            >
              <Play size={17} fill="currentColor" />
              Play
            </button>
            <button
              onClick={() => onInfo(item)}
              className="bg-veil ring-1 ring-line px-6 py-3 lg:px-5 lg:py-2.5 rounded-lg font-medium text-sm text-text-primary flex items-center gap-2 hover:bg-veil-strong hover:ring-line-strong transition-all [html[data-theme=light]_&]:hero-surface"
            >
              <Info size={16} />
              More info
            </button>
            <button
              onClick={() => onToggleList(item)}
              className="w-11 h-11 lg:w-10 lg:h-10 bg-veil ring-1 ring-line rounded-full lg:rounded-lg flex items-center justify-center text-text-primary hover:bg-veil-strong hover:ring-line-strong transition-all [html[data-theme=light]_&]:hero-surface"
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              title={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? <Check size={17} className="text-accent" /> : <Plus size={17} className="[html[data-theme=light]_&]:text-text-primary" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
