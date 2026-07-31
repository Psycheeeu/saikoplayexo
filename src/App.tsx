import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar, { type ViewKey } from "./components/Navbar";
import Hero from "./components/Hero";
import Row, { type RowFilter } from "./components/Row";
import Card from "./components/Card";
import Modal from "./components/Modal";
import PlayerModal from "./components/PlayerModal";
import Footer from "./components/Footer";
import EmptyMyList from "./components/EmptyMyList";
import MVZone from "./pages/MVZone";
import Donate from "./pages/Donate";
import {
  MoviesPage,
  TvShowsPage,
  GenresPage,
  ProvidersPage,
} from "./pages/Browse";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import type { MediaItem, RowDef } from "./data/tmdb";
import {
  ROWS,
  GENRES,
  PROVIDERS,
  fetchDetail,
  fetchByGenreAll,
  fetchByProvider,
  searchMulti,
  loadMyList,
  saveMyList,
} from "./data/tmdb";

type Toast = {
  id: number;
  message: string;
  type: "success" | "info" | "error";
};

type VisibleRow = {
  id: string;
  title: string;
  items: MediaItem[];
  loading?: boolean;
  error?: string;
  isLarge?: boolean;
  filter?: RowFilter;
};

function App() {
  const [view, setView] = useState<ViewKey>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mvSearchQuery, setMvSearchQuery] = useState("");

  // Data state
  const [heroEnhanced, setHeroEnhanced] = useState<MediaItem | null>(null);
  const [rows, setRows] = useState<Record<string, MediaItem[]>>({});
  const [rowsLoading, setRowsLoading] = useState<Record<string, boolean>>(
    Object.fromEntries(ROWS.map((r) => [r.id, true]))
  );
  const [rowsError, setRowsError] = useState<Record<string, string>>({});

  // UI state
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState<MediaItem | null>(null);

  // My List
  const [myList, setMyList] = useState<MediaItem[]>(() => loadMyList());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist My List
  useEffect(() => {
    saveMyList(myList);
  }, [myList]);

  // Toast helpers
  const pushToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Fetch all rows in parallel
  useEffect(() => {
    let cancelled = false;
    ROWS.forEach(async (row: RowDef) => {
      if (!row.loader) return;
      try {
        const items = await row.loader();
        if (cancelled) return;
        const filtered = row.filter
          ? items.filter((i) =>
              row.filter === "tv" ? i.media_type === "tv" : i.media_type === "movie"
            )
          : items;
        setRows((prev) => ({ ...prev, [row.id]: filtered.length ? filtered : items }));
        setRowsLoading((prev) => ({ ...prev, [row.id]: false }));
        setRowsError((prev) => ({ ...prev, [row.id]: "" }));
      } catch (err) {
        console.error(`Row ${row.id} failed:`, err);
        if (!cancelled) {
          setRowsLoading((prev) => ({ ...prev, [row.id]: false }));
          setRowsError((prev) => ({ ...prev, [row.id]: "Failed to load" }));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // My List actions
  const myListIds = myList.map((m) => m.id);

  const toggleMyList = useCallback(
    (item: MediaItem) => {
      setMyList((prev) => {
        const exists = prev.find((m) => m.id === item.id);
        if (exists) {
          pushToast(`Removed “${item.title}” from My List`, "info");
          return prev.filter((m) => m.id !== item.id);
        } else {
          pushToast(`Added “${item.title}” to My List`, "success");
          return [item, ...prev];
        }
      });
    },
    [pushToast]
  );

  // Navigation
  const navigate = useCallback((v: ViewKey) => {
    setView(v);
    setSearchQuery("");
    setSearchResults([]);
    setMvSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Search
  const doSearch = useCallback(
    async (query: string) => {
      const q = query.trim();

      if (view === "mvzone") {
        setMvSearchQuery(q);
        return;
      }

      if (!q) return;
      setSearchQuery(q);
      setSearchLoading(true);
      setView("search");
      try {
        const results = await searchMulti(q);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [view]
  );

  // Play item
  const playItem = useCallback(async (item: MediaItem) => {
    const needsDetail = !item.trailerKey || !item.imdbId || !item.overview;
    if (!needsDetail) {
      setPlaying(item);
      return;
    }
    try {
      const full = await fetchDetail(item.media_type, item.id);
      if (full) {
        setPlaying({ ...item, ...full });
      } else {
        setPlaying(item);
      }
    } catch (err) {
      console.error("Failed to fetch item detail:", err);
      setPlaying(item);
    }
  }, []);

  // Open detail modal
  const openDetail = useCallback((item: MediaItem) => {
    setSelected(item);
  }, []);

  // Handle selecting related item
  const handleSelectRelated = useCallback((item: MediaItem) => {
    setSelected(item);
  }, []);

  // Shared props for full-catalog grid pages
  const gridProps = { myListIds, onSelect: openDetail, onPlay: playItem, onToggleList: toggleMyList };

  // Compute visible rows based on view
  const visibleRows: VisibleRow[] = (() => {
    const rowById = (id: string, title?: string) => ({
      id,
      title: title || (ROWS.find((r) => r.id === id)?.title ?? id),
      items: rows[id] || [],
      loading: rowsLoading[id],
      error: rowsError[id],
    });

    if (view === "home") {
      return [
        { ...rowById("home-top10-tv", "Top 10 series today"), items: (rows["home-top10-tv"] || []).slice(0, 10), isLarge: true },
        { ...rowById("home-top10-movies", "Top 10 movies today"), items: (rows["home-top10-movies"] || []).slice(0, 10), isLarge: true },
        rowById("home-top-picks", "Today's Top Picks"),
        rowById("home-top-rated", "Top Rated"),
        rowById("home-kids", "For Kids"),
        rowById("home-anime", "Anime"),
        rowById("home-asian-dramas", "Asian Dramas"),
        {
          ...rowById("home-browse-genre", "Browse by Genre"),
          filter: {
            options: GENRES,
            label: "genre",
            load: (id: number) => fetchByGenreAll(id),
          },
        },
        {
          ...rowById("home-providers", "Browse by Provider"),
          filter: {
            options: PROVIDERS,
            label: "provider",
            load: (id: number) => fetchByProvider(id),
          },
        },
      ];
    }

    if (view === "movies") {
      return [
        rowById("movie-trending", "Trending"),
        rowById("movie-popular", "Popular"),
        rowById("movie-top-rated", "Top Rated"),
        rowById("movie-now-playing", "Now Playing"),
      ];
    }
    if (view === "tvshows") {
      return [
        rowById("tv-trending", "Trending"),
        rowById("tv-popular", "Popular"),
        rowById("tv-top-rated", "Top Rated"),
        rowById("tv-on-air", "On The Air"),
      ];
    }
    if (view === "new") {
      const all = Object.values(rows).flat();
      const sorted = [...all]
        .filter((i) => i.year && !isNaN(parseInt(i.year)))
        .sort((a, b) => parseInt(b.year) - parseInt(a.year));
      const seen = new Set<number>();
      const deduped = sorted.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
      return [
        {
          id: "new-all",
          title: "New Releases",
          items: deduped,
          loading: Object.values(rowsLoading).some(Boolean),
          error: "",
        },
      ];
    }
    if (view === "mylist") {
      return [
        {
          id: "my-list",
          title: "My List",
          items: myList,
          loading: false,
          error: "",
        },
      ];
    }
    return [];
  })();

  // ── Featured hero ─────────────────────────────────────────────────
  // One random title per page, picked once when its pool is ready —
  // never re-rolled by unrelated rows arriving afterwards.
  const pickRandomHero = (pool: MediaItem[], type?: "movie" | "tv") => {
    const typed = type ? pool.filter((i) => i.media_type === type) : pool;
    const candidates = typed.filter((i) => i.backdrop).slice(0, 10);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const homePoolReady = (rows["home-top-picks"] || []).length > 0;
  const moviePoolReady = (rows["movie-trending"] || []).length > 0;
  const tvPoolReady = (rows["tv-trending"] || []).length > 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const homeHero = useMemo(
    () => (homePoolReady ? pickRandomHero(rows["home-top-picks"] || []) : null),
    [homePoolReady]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const movieHero = useMemo(
    () => (moviePoolReady ? pickRandomHero(rows["movie-trending"] || [], "movie") : null),
    [moviePoolReady]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tvHeroPick = useMemo(
    () => (tvPoolReady ? pickRandomHero(rows["tv-trending"] || [], "tv") : null),
    [tvPoolReady]
  );

  const featuredHero =
    view === "movies" ? movieHero : view === "tvshows" ? tvHeroPick : homeHero;

  // Pick hero based on view
  const activeHero = (() => {
    if (view === "mylist") return myList[0] || null;
    if (view === "new") {
      const all = Object.values(rows).flat();
      const sorted = [...all]
        .filter((i) => i.year && !isNaN(parseInt(i.year)))
        .sort((a, b) => parseInt(b.year) - parseInt(a.year));
      return sorted[0] || null;
    }
    return featuredHero;
  })();

  // Enrich active hero with full TMDB detail
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!activeHero) {
        setHeroEnhanced(null);
        return;
      }
      if (activeHero.logoPath) {
        setHeroEnhanced(activeHero);
        return;
      }
      const detailed = await fetchDetail(activeHero.media_type, activeHero.id);
      if (!cancelled) {
        setHeroEnhanced(detailed ? { ...activeHero, ...detailed } : activeHero);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHero?.id, activeHero?.media_type]);

  // Rendered hero — always the current page's pick, never a stale title.
  // Falls back to the un-enriched item while the detail request runs,
  // so there is no fallback content and no visible title swap.
  const displayedHero = activeHero
    ? !heroEnhanced || heroEnhanced.id !== activeHero.id
      ? activeHero
      : heroEnhanced
    : null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar currentView={view} onNavigate={navigate} onSearch={doSearch} />

      {view === "mvzone" ? (
        <MVZone searchQuery={mvSearchQuery} />
      ) : view === "allmovies" ? (
        <MoviesPage {...gridProps} />
      ) : view === "alltv" ? (
        <TvShowsPage {...gridProps} />
      ) : view === "allgenres" ? (
        <GenresPage {...gridProps} />
      ) : view === "allproviders" ? (
        <ProvidersPage {...gridProps} />
      ) : view === "donate" ? (
        <Donate />
      ) : view === "contact" ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-16">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary mb-2.5">
            Contact us
          </h2>
          <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
            This page is coming soon. In the meantime, you can reach out through
            the contact details on our Donate page.
          </p>
        </div>
      ) : view === "search" ? (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-12">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
              Search
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              Results for “{searchQuery}”
            </h2>
          </div>
          {searchLoading ? (
            <div className="flex items-center justify-center py-24">
              <span className="w-6 h-6 rounded-full border-2 border-line border-t-text-secondary animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-text-secondary text-sm py-16 text-center">
              No results found. Try a different title or keyword.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
              {searchResults.map((item, idx) => (
                <Card
                  key={item.id}
                  item={item}
                  index={idx}
                  inList={myListIds.includes(item.id)}
                  onClick={() => openDetail(item)}
                  onPlay={playItem}
                  onToggleList={toggleMyList}
                />
              ))}
            </div>
          )}
        </div>
      ) : view === "mylist" && myList.length === 0 ? (
        <EmptyMyList onBrowse={() => navigate("home")} />
      ) : (
        <>
          <Hero
            item={displayedHero}
            loading={!activeHero}
            inList={displayedHero ? myListIds.includes(displayedHero.id) : false}
            onPlay={playItem}
            onInfo={openDetail}
            onToggleList={toggleMyList}
          />

          <div className="-mt-20 relative z-[1] pt-8 space-y-10">
            {visibleRows.map((row) => (
              <Row
                key={row.id}
                title={row.title}
                items={row.items}
                loading={row.loading}
                error={row.error}
                isLarge={"isLarge" in row ? row.isLarge : false}
                myListIds={myListIds}
                onSelect={openDetail}
                onPlay={playItem}
                onToggleList={toggleMyList}
                filter={row.filter}
              />
            ))}
          </div>
        </>
      )}

      <Footer onNavigate={navigate} />

      {/* Detail modal */}
      <Modal
        item={selected}
        inList={selected ? myListIds.includes(selected.id) : false}
        onClose={() => setSelected(null)}
        onPlay={playItem}
        onToggleList={toggleMyList}
        onSelectRelated={handleSelectRelated}
      />

      {/* Player modal */}
      <PlayerModal item={playing} onClose={() => setPlaying(null)} />

      {/* Toasts */}
      <div className="fixed bottom-6 inset-x-0 z-[110] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 bg-bg-secondary ring-1 ring-line rounded-lg pl-3.5 pr-2 py-2.5 shadow-lift animate-scale-in max-w-md"
          >
            {toast.type === "success" ? (
              <Check size={14} className="text-accent shrink-0" />
            ) : toast.type === "info" ? (
              <Info size={14} className="text-text-muted shrink-0" />
            ) : (
              <TriangleAlert size={14} className="text-red-400 shrink-0" />
            )}
            <p className="text-[13px] text-text-primary line-clamp-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-md text-text-muted hover:text-text-primary transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
