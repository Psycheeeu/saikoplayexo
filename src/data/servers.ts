// Streaming embed servers.
import type { MediaItem } from "./tmdb";

export type Server = {
  name: string;
  getUrl: (item: MediaItem, season?: number, episode?: number) => string;
};

export const SERVERS: Server[] = [
  {
    name: "Server 1",
    getUrl: (item, s = 1, e = 1) =>
      item.media_type === "tv"
        ? `https://psycheflixtv.qzz.io/tv/${item.id}/${s}/${e}`
        : `https://psycheflixtv.qzz.io/movie/${item.id}`,
  },
];

// The default (single) streaming source — loaded automatically, no user input needed
export const DEFAULT_SERVER = SERVERS[0];

// Helper to build a YouTube trailer URL (used as fallback / "watch trailer" mode)
export function youtubeTrailerUrl(trailerKey?: string | null, title?: string, year?: string) {
  if (trailerKey) {
    return `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`;
  }
  const q = `${title || ""} ${year || ""} official trailer`.trim();
  return `https://www.youtube-nocookie.com/embed/?listType=search&list=${encodeURIComponent(q)}`;
}
