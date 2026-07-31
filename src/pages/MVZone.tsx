import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { allMVs, type MusicVideo } from "../data/musicVideos";
import MVCard from "../components/MVCard";
import MVPlayerModal from "../components/MVPlayerModal";

const PER_PAGE = 25; // 5 columns × 5 rows

const HERO_BG =
  "https://static.wikia.nocookie.net/kpop/images/e/e3/MEOVV_Bite_Now_group_concept_photo_1.png/revision/latest/scale-to-width-down/1000?cb=20260514163652";
const HERO_LOGO = "https://i.imgur.com/zUjrJHo.png";
const HERO_DESC =
  'MEOVV is a South Korean girl group formed and managed by THEBLACKLABEL. The group consists of five members: Sooin, Gawon, Anna, Narin, and Ella. They debuted on September 6, 2024, with the release of their digital single "MEOW".';

// Cap text at N whole sentences — never cut mid-sentence; ellipsize after the last one kept
function truncateSentences(text: string, maxSentences: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+(?:["')\]]+)?\s*/g);
  if (!sentences || sentences.length <= maxSentences) return text;
  const kept = sentences.slice(0, maxSentences).join("").trim();
  return kept.replace(/[.!?]+$/, "") + "…";
}

const HERO_DESC_SHORT = truncateSentences(HERO_DESC, 5);

type Props = {
  searchQuery: string;
};

export default function MVZone({ searchQuery }: Props) {
  const [playing, setPlaying] = useState<MusicVideo | null>(null);
  const [page, setPage] = useState(1);

  // Ascending order (array order) + search filter
  const sorted = useMemo(() => {
    if (!searchQuery.trim()) return allMVs;
    const q = searchQuery.toLowerCase();
    return allMVs.filter(
      (mv) =>
        mv.title.toLowerCase().includes(q) ||
        mv.artist.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = sorted.slice(start, start + PER_PAGE);

  const goTo = useCallback((p: number) => {
    setPage(p);
    // scroll to just below the hero
    const grid = document.getElementById("mv-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // ── Block-based pagination ─────────────────────────────────────────
  // 10 numbered pages per block on desktop (≥1024px), 5 on tablet/mobile
  const [blockSize, setBlockSize] = useState(10);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setBlockSize(mq.matches ? 10 : 5);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const blockStart = Math.floor((safePage - 1) / blockSize) * blockSize + 1;
  const blockEnd = Math.min(blockStart + blockSize - 1, totalPages);
  const blockPages = useMemo(
    () =>
      Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i),
    [blockStart, blockEnd]
  );

  return (
    <div className="min-h-screen">
      {/* ───── Hero Banner ───── */}
      <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt="kpopfeaturedbanner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient overlays */}
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-side-gradient absolute inset-0" />

        {/* Content — original layout (mobile/tablet locked) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 pb-20 md:pb-24">
          <div className="max-w-2xl space-y-4 lg:space-y-5 animate-fade-up">
            {/* Eyebrow — desktop only */}
            <p className="hidden lg:block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              MV Zone
            </p>

            {/* Logo */}
            <img
              src={HERO_LOGO}
              alt="kpopfeaturedlogo"
              className="max-w-[220px] md:max-w-[320px] max-h-[100px] object-contain"
            />

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-y-1.5 text-sm lg:text-[13px] text-text-secondary tnum">
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-[11px] font-semibold">
                K-Pop
              </span>
              <span>2024</span>
              <span className="text-text-muted">·</span>
              <span>5 Members</span>
              <span className="text-text-muted">·</span>
              <span>THEBLACKLABEL</span>
            </div>

            {/* Description — max 5 sentences, sentence-safe truncation */}
            <p className="text-text-secondary text-sm md:text-base lg:text-[15px] leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl">
              {HERO_DESC_SHORT}
            </p>
          </div>
        </div>
      </div>

      {/* ───── Content below hero ───── */}
      <div className="-mt-20 relative z-[1] px-4 md:px-12 pb-12 pt-8 scroll-mt-20" id="mv-grid">
        {/* Section label */}
        <div className="flex items-center gap-2.5 mb-6">
          <LayoutGrid size={16} className="text-text-muted" />
          <h2 className="text-[15px] font-semibold tracking-tight text-text-primary">
            {searchQuery.trim() ? `Results for “${searchQuery}”` : "All Videos"}
          </h2>
          <span className="text-text-muted text-[13px] tnum">({sorted.length})</span>
        </div>

        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-secondary ring-1 ring-line flex items-center justify-center mb-5">
              <Search size={22} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">
              No music videos found for “{searchQuery}”
            </p>
          </div>
        ) : (
          <>
            {/* 5-column grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {pageItems.map((mv) => (
                <MVCard key={mv.id} mv={mv} onClick={() => setPlaying(mv)} />
              ))}
            </div>

            {/* Pagination — << < [pages] > >> block navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12">
                {/* Previous block (<<) */}
                <button
                  disabled={blockStart <= 1}
                  onClick={() => goTo(Math.max(1, blockStart - blockSize))}
                  className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Previous page block"
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Previous page (<) */}
                <button
                  disabled={safePage <= 1}
                  onClick={() => goTo(safePage - 1)}
                  className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Numbered pages of the current block */}
                {blockPages.map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all tnum ${
                      p === safePage
                        ? "bg-solid text-solid-text"
                        : "ring-1 ring-line text-text-secondary hover:text-text-primary hover:ring-line-strong"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next page (>) */}
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => goTo(safePage + 1)}
                  className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Next block (>>) */}
                <button
                  disabled={blockEnd >= totalPages}
                  onClick={() => goTo(Math.min(totalPages, blockEnd + 1))}
                  className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Next page block"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <MVPlayerModal mv={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
