import { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Plus,
  Check,
  Clock,
  Tv,
  Users,
  Clapperboard,
  Globe,
  ChevronDown,
  ListVideo,
  Star,
} from "lucide-react";
import type { MediaItem, TmdbEpisode } from "../data/tmdb";
import {
  IMG_W500,
  fetchDetail,
  fetchRecommendations,
  fetchSeasonEpisodes,
} from "../data/tmdb";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollLock";

type Props = {
  item: MediaItem | null;
  inList: boolean;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
  onSelectRelated: (item: MediaItem) => void;
};

const formatEpRuntime = (mins: number) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

export default function Modal({
  item,
  inList,
  onClose,
  onPlay,
  onToggleList,
  onSelectRelated,
}: Props) {
  const [display, setDisplay] = useState<MediaItem | null>(item);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [more, setMore] = useState<MediaItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const seasonMenuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!item) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      // Let the player modal consume Escape first when it's open on top
      if (e.key === "Escape" && !document.querySelector(".player-modal-root")) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  // Close the season menu on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (seasonMenuRef.current && !seasonMenuRef.current.contains(e.target as Node)) {
        setSeasonMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Load full detail + recommendations whenever a new item is opened
  useEffect(() => {
    if (!item) return;
    let cancelled = false;

    setDisplay(item);
    setMore([]);
    setEpisodes([]);
    setSelectedSeason(1);
    setSeasonMenuOpen(false);
    panelRef.current?.scrollTo({ top: 0 });

    const run = async () => {
      setLoadingDetail(true);
      const detail = await fetchDetail(item.media_type, item.id);
      if (cancelled) return;
      if (detail) setDisplay({ ...item, ...detail });
      setLoadingDetail(false);

      const recs = await fetchRecommendations(item.media_type, item.id);
      if (!cancelled) setMore(recs.slice(0, 12));
    };
    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.media_type]);

  const isTv = display?.media_type === "tv";
  const numSeasons = display?.numberOfSeasons ?? 0;

  // Load episodes when the season changes (TV only)
  useEffect(() => {
    if (!display || !isTv || numSeasons <= 0) return;
    let cancelled = false;
    const run = async () => {
      setLoadingEpisodes(true);
      const eps = await fetchSeasonEpisodes(display.id, selectedSeason);
      if (!cancelled) {
        setEpisodes(eps);
        setLoadingEpisodes(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [display, isTv, numSeasons, selectedSeason]);

  if (!item || !display) return null;

  const title = display.title;
  const year = display.year && display.year !== "—" ? display.year : null;
  const genres = display.genres || [];
  const tagline = display.tagline;
  const overview = display.overview;

  return (
    <div
      className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-auto my-[4vh] w-[calc(100%-2rem)] max-w-3xl max-h-[92vh] overflow-y-auto search-scroll rounded-2xl bg-bg-secondary ring-1 ring-line shadow-modal animate-scale-in"
      >
        {/* ── Header backdrop ── */}
        <div className="relative aspect-[16/9] max-h-[420px] w-full bg-bg-tertiary overflow-hidden">
          <img
            src={display.backdrop}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/25 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-line-strong flex items-center justify-center text-white hover:bg-black/75 transition-colors"
            aria-label="Close details"
          >
            <X size={17} />
          </button>

          {/* Title block */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-4">
            <h2 className="text-2xl md:text-[32px] font-bold text-text-primary tracking-tight leading-tight">
              {title}
            </h2>

            {/* Metadata chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium tnum">
              {display.rating > 0 && (
                <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md ring-1 ring-amber-500/20">
                  <Star size={11} fill="currentColor" />
                  {display.rating.toFixed(1)}
                </span>
              )}
              {year && (
                <span className="bg-veil ring-1 ring-line text-text-secondary px-2 py-1 rounded-md">
                  {year}
                </span>
              )}
              {display.rated && (
                <span className="bg-veil ring-1 ring-line text-text-secondary px-2 py-1 rounded-md">
                  {display.rated}
                </span>
              )}
              {display.runtime && (
                <span className="flex items-center gap-1 bg-veil ring-1 ring-line text-text-secondary px-2 py-1 rounded-md">
                  <Clock size={11} />
                  {display.runtime}
                </span>
              )}
              {isTv && numSeasons > 0 && (
                <span className="flex items-center gap-1 bg-veil ring-1 ring-line text-text-secondary px-2 py-1 rounded-md">
                  <Tv size={11} />
                  {numSeasons} Season{numSeasons !== 1 ? "s" : ""}
                </span>
              )}
              <span className="bg-veil ring-1 ring-line text-text-secondary px-2 py-1 rounded-md uppercase tracking-wide text-[10.5px]">
                {isTv ? "Series" : "Film"}
              </span>
            </div>

            {/* Genre pills */}
            {genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre}
                    className="text-[11px] font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => onPlay(display)}
                className="bg-solid text-solid-text px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Play size={17} fill="currentColor" />
                Play
              </button>
              <button
                onClick={() => onToggleList(display)}
                className="w-10 h-10 rounded-lg bg-veil ring-1 ring-line flex items-center justify-center text-text-primary hover:bg-veil-strong hover:ring-line-strong transition-all"
                aria-label={inList ? "Remove from My List" : "Add to My List"}
                title={inList ? "Remove from My List" : "Add to My List"}
              >
                {inList ? <Check size={17} className="text-accent" /> : <Plus size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 md:p-8 space-y-8">
          {loadingDetail ? (
            <div className="space-y-3">
              <div className="h-4 w-1/3 rounded skeleton" />
              <div className="h-3.5 w-full rounded skeleton" />
              <div className="h-3.5 w-11/12 rounded skeleton" />
              <div className="h-3.5 w-2/3 rounded skeleton" />
            </div>
          ) : (
            <>
              {/* About */}
              <div className="space-y-3">
                {tagline && (
                  <p className="text-accent text-[15px] italic">“{tagline}”</p>
                )}
                {overview ? (
                  <p className="text-text-secondary text-[15px] leading-relaxed">
                    {overview}
                  </p>
                ) : (
                  <p className="text-text-muted italic text-sm">
                    No description available yet.
                  </p>
                )}
              </div>

              {/* Metadata grid */}
              {(display.actors || display.director || display.country || isTv) && (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-line pt-6">
                  {display.actors && (
                    <div>
                      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted mb-1.5">
                        <Users size={12} />
                        Cast
                      </dt>
                      <dd className="text-text-primary leading-relaxed">{display.actors}</dd>
                    </div>
                  )}
                  {display.director && (
                    <div>
                      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted mb-1.5">
                        <Clapperboard size={12} />
                        Director
                      </dt>
                      <dd className="text-text-primary">{display.director}</dd>
                    </div>
                  )}
                  {display.country && (
                    <div>
                      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted mb-1.5">
                        <Globe size={12} />
                        Country
                      </dt>
                      <dd className="text-text-primary">{display.country}</dd>
                    </div>
                  )}
                  {isTv && (
                    <div>
                      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted mb-1.5">
                        <Tv size={12} />
                        Series info
                      </dt>
                      <dd className="text-text-primary tnum">
                        {numSeasons > 0
                          ? `${numSeasons} Season${numSeasons !== 1 ? "s" : ""}`
                          : "TV Series"}
                        {display.numberOfEpisodes
                          ? ` · ${display.numberOfEpisodes} Episodes`
                          : ""}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {/* ── TV season & episode browser ── */}
              {isTv && numSeasons > 0 && (
                <div className="space-y-4 border-t border-line pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text-primary">
                      <ListVideo size={16} className="text-text-muted" />
                      Episodes
                    </h3>

                    {/* Season dropdown */}
                    <div ref={seasonMenuRef} className="relative">
                      <button
                        onClick={() => setSeasonMenuOpen((o) => !o)}
                        className="flex items-center gap-2 bg-bg-tertiary ring-1 ring-line rounded-lg px-3 py-2 text-[13px] font-medium text-text-primary hover:ring-line-strong transition-all"
                      >
                        Season {selectedSeason}
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            seasonMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {seasonMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-40 max-h-64 overflow-y-auto search-scroll bg-bg-tertiary ring-1 ring-line rounded-lg shadow-lift z-10 animate-scale-in">
                          {Array.from({ length: numSeasons }, (_, i) => i + 1).map((n) => (
                            <button
                              key={n}
                              onClick={() => {
                                setSelectedSeason(n);
                                setSeasonMenuOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                                n === selectedSeason
                                  ? "text-text-primary bg-veil font-medium"
                                  : "text-text-secondary hover:text-text-primary hover:bg-veil"
                              }`}
                            >
                              Season {n}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Episode list */}
                  {loadingEpisodes ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-40 md:w-48 aspect-video rounded-lg skeleton shrink-0" />
                          <div className="flex-1 space-y-2 py-2">
                            <div className="h-3.5 w-1/2 rounded skeleton" />
                            <div className="h-3 w-full rounded skeleton" />
                            <div className="h-3 w-2/3 rounded skeleton" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : episodes.length === 0 ? (
                    <p className="text-text-muted text-sm py-6 text-center">
                      No episodes available for this season.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 search-scroll">
                      {episodes.map((ep) => {
                        const stillSrc = ep.still_path ? `${IMG_W500}${ep.still_path}` : null;

                        return (
                          <div
                            key={ep.id}
                            onClick={() =>
                              onPlay({
                                ...display,
                                season: selectedSeason,
                                episode: ep.episode_number,
                              })
                            }
                            className="flex gap-3.5 p-2 rounded-xl hover:bg-veil transition-colors cursor-pointer group"
                          >
                            {/* Thumbnail */}
                            <div className="w-36 md:w-44 shrink-0 relative aspect-video bg-bg-tertiary rounded-lg overflow-hidden ring-1 ring-line">
                              {stillSrc ? (
                                <img
                                  src={stillSrc}
                                  alt={ep.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                  <Tv size={18} />
                                </div>
                              )}
                              {/* Play overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="w-8 h-8 bg-solid text-solid-text rounded-full flex items-center justify-center">
                                  <Play size={13} fill="currentColor" className="ml-0.5" />
                                </span>
                              </div>
                              {/* Episode number badge */}
                              <span className="absolute top-1.5 left-1.5 bg-black/65 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded tnum">
                                E{ep.episode_number}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 py-1.5 pr-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <h4 className="text-[13.5px] font-medium text-text-primary line-clamp-1">
                                  <span className="text-text-muted tnum mr-1.5">
                                    {ep.episode_number}.
                                  </span>
                                  {ep.name}
                                </h4>
                                {ep.runtime != null && (
                                  <span className="text-[11px] text-text-muted shrink-0 mt-0.5 tnum">
                                    {formatEpRuntime(ep.runtime)}
                                  </span>
                                )}
                              </div>
                              {ep.overview ? (
                                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                  {ep.overview}
                                </p>
                              ) : (
                                <p className="text-xs text-text-muted italic">No description.</p>
                              )}
                              {ep.air_date && (
                                <p className="text-[10.5px] text-text-muted mt-1.5 tnum">
                                  {ep.air_date}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── More Like This ── */}
          {!loadingDetail && more.length > 0 && (
            <div className="border-t border-line pt-6">
              <h3 className="text-[15px] font-semibold text-text-primary mb-4">
                More like this
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {more.map((m) => {
                  const mRating = m.rating > 0 ? m.rating.toFixed(1) : null;
                  const mYear = m.year && m.year !== "—" ? m.year : "";
                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectRelated(m)}
                      className="rounded-lg overflow-hidden bg-bg-tertiary ring-1 ring-line hover:ring-line-strong hover:shadow-lift transition-all cursor-pointer group"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <img
                          src={m.poster}
                          alt={m.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          {mRating && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400/90 mb-0.5 tnum">
                              <Star size={8} fill="currentColor" />
                              {mRating}
                            </span>
                          )}
                          <p className="text-[11px] font-medium text-white line-clamp-2 leading-snug">
                            {m.title}
                          </p>
                          {mYear && (
                            <p className="text-[10px] text-text-muted mt-0.5 tnum">{mYear}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
