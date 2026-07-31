import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import type { MusicVideo } from "../data/musicVideos";
import { getYoutubeEmbedUrl, getYoutubeWatchUrl } from "../data/musicVideos";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollLock";

type Props = {
  mv: MusicVideo | null;
  onClose: () => void;
};

export default function MVPlayerModal({ mv, onClose }: Props) {
  useEffect(() => {
    if (!mv) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [mv, onClose]);

  if (!mv) return null;

  return (
    <div
      className="player-modal-root fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-8 py-3.5 border-b border-line bg-bg-primary/80 backdrop-blur-xl">
        <div className="min-w-0">
          <h2 className="text-text-primary font-semibold text-[15px] tracking-tight truncate">
            {mv.title}
          </h2>
          <p className="text-text-muted text-xs truncate">{mv.artist}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getYoutubeWatchUrl(mv.id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="h-9 px-3.5 rounded-lg ring-1 ring-line flex items-center gap-1.5 text-[12.5px] font-medium text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">YouTube</span>
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg ring-1 ring-line flex items-center justify-center text-text-secondary hover:text-text-primary hover:ring-line-strong transition-all"
            aria-label="Close player"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Player */}
      <div
        className="flex-1 flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-5xl md:max-w-3xl lg:max-w-[min(100%,calc((100vh-170px)*1.7778))] aspect-video rounded-lg overflow-hidden ring-1 ring-line bg-black">
          <iframe
            src={getYoutubeEmbedUrl(mv.id)}
            title={mv.title}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
