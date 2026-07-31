import { Play } from "lucide-react";
import type { MusicVideo } from "../data/musicVideos";

type Props = {
  mv: MusicVideo;
  onClick: () => void;
};

export default function MVCard({ mv, onClick }: Props) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-secondary ring-1 ring-line shadow-card group-hover:ring-line-strong group-hover:shadow-lift transition-all duration-300">
        <img
          src={mv.thumbnail}
          alt={mv.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${mv.id}/hqdefault.jpg`;
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="w-11 h-11 bg-solid text-solid-text rounded-full flex items-center justify-center shadow-lift group-hover:scale-100 scale-90 transition-transform duration-200">
            <Play size={17} fill="currentColor" className="ml-0.5" />
          </span>
        </div>

        {/* Duration badge */}
        {mv.duration && (
          <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10.5px] font-medium text-white tnum">
            {mv.duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <p className="font-medium text-[13px] text-text-primary line-clamp-1 transition-colors">
          {mv.title}
        </p>
        <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{mv.artist}</p>
      </div>
    </div>
  );
}
