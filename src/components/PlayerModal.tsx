import { useEffect, useState } from "react";
import { X, MonitorPlay, Clapperboard } from "lucide-react";
import type { MediaItem, TmdbSeason } from "../data/tmdb";
import { fetchDetail } from "../data/tmdb";
import { DEFAULT_SERVER, youtubeTrailerUrl } from "../data/servers";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollLock";

type Props = {
  item: MediaItem | null;
  onClose: () => void;
};

type Mode = "stream" | "trailer";

export default function PlayerModal({ item, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("stream");
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonsData, setSeasonsData] = useState<TmdbSeason[] | null>(null);

  // Reset playback state whenever a new title is opened —
  // seed from the season/episode picked on the info page, if any
  useEffect(() => {
    if (item) {
      setMode("stream");
      setSeason(item.season ?? 1);
      setEpisode(item.episode ?? 1);
      setSeasonsData(item.seasons ?? null);
    }
  }, [item]);

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!item) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  const isTv = item?.media_type === "tv";

  // ── Data-driven seasons & episodes ─────────────────────────────────
  // Seasons come embedded with the detail payload; fetch them if missing
  useEffect(() => {
    if (!item || !isTv) return;
    if (item.seasons && item.seasons.length > 0) return;
    let cancelled = false;
    fetchDetail(item.media_type, item.id).then((full) => {
      if (!cancelled && full?.seasons) setSeasonsData(full.seasons);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.media_type, isTv]);

  // Real seasons only (skip the season 0 "Specials" bucket)
  const seasonList = (seasonsData || [])
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);
  const seasonNumbers =
    seasonList.length > 0
      ? seasonList.map((s) => s.season_number)
      : Array.from(
          { length: Math.max(1, item?.numberOfSeasons || 1) },
          (_, i) => i + 1
        );

  const activeSeason = seasonList.find((s) => s.season_number === season);
  // Exact episode count for the selected season — never a fixed number
  const episodeCount = Math.max(
    1,
    activeSeason
      ? activeSeason.episode_count
      : season === 1
        ? item?.numberOfEpisodes || 1
        : 1
  );

  // Keep the selection valid whenever the underlying data changes
  useEffect(() => {
    if (seasonNumbers.length > 0 && !seasonNumbers.includes(season)) {
      setSeason(seasonNumbers[0]);
      setEpisode(1);
      return;
    }
    if (episode > episodeCount) setEpisode(episodeCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeCount, seasonNumbers.join(","), season, episode]);

  if (!item) return null;

  // Single streaming source — loaded automatically, no selection needed
  const src =
    mode === "trailer"
      ? youtubeTrailerUrl(item.trailerKey, item.title, item.year)
      : DEFAULT_SERVER.getUrl(item, season, episode);

  const selectClass =
    "appearance-none bg-bg-secondary ring-1 ring-line rounded-lg pl-3 pr-8 py-2 text-[12.5px] font-medium text-text-primary hover:ring-line-strong transition-all cursor-pointer bg-no-repeat";
  const chevronStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d6d77' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundPosition: "right 0.65rem center",
  } as const;

  return (
    <div className="player-modal-root fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3.5 border-b border-line bg-bg-primary/80 backdrop-blur-xl">
        <div className="min-w-0">
          <h2 className="text-text-primary font-semibold text-[15px] tracking-tight truncate">
            {item.title}
          </h2>
          <p className="text-text-muted text-xs tnum">
            {isTv && mode === "stream"
              ? `S${season} · E${episode}`
              : item.year || (isTv ? "Series" : "Film")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-bg-secondary ring-1 ring-line rounded-lg p-0.5">
            <button
              onClick={() => setMode("stream")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                mode === "stream"
                  ? "bg-bg-tertiary text-text-primary ring-1 ring-line-strong"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <MonitorPlay size={14} />
              <span className="hidden sm:inline">Stream</span>
            </button>
            <button
              onClick={() => setMode("trailer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                mode === "trailer"
                  ? "bg-bg-tertiary text-text-primary ring-1 ring-line-strong"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Clapperboard size={14} />
              <span className="hidden sm:inline">Trailer</span>
            </button>
          </div>

          {/* TV episode selector */}
          {isTv && mode === "stream" && (
            <div className="flex items-center gap-2">
              <select
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className={selectClass}
                style={chevronStyle}
                aria-label="Season"
              >
                {seasonNumbers.map((n) => (
                  <option key={n} value={n}>
                    S{n}
                  </option>
                ))}
              </select>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className={selectClass}
                style={chevronStyle}
                aria-label="Episode"
              >
                {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    E{n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all"
            aria-label="Close player"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Player ── */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-black">
        <div
          className="w-full max-w-6xl md:max-w-3xl lg:max-w-[min(100%,calc((100vh-170px)*1.7778))] aspect-video bg-black rounded-lg overflow-hidden ring-1 ring-line"
        >
          <iframe
            key={src}
            src={src}
            title={item.title}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}
