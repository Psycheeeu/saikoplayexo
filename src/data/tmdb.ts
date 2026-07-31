// TMDB API client – v4 read access token
// Docs: https://developer.themoviedb.org/reference/intro/getting-started

export const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTQwZTg0NWMyMjU4YWZhYzY1MjY0ODAxNDhiNjg3MiIsIm5iZiI6MTc4MzcwMzg4My4yNjQsInN1YiI6IjZhNTEyOTRiYmJlZDQ2NDEzNDY5N2JlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6lowkkboY50mLk9nzM0idwqyFdfCkT8CtJ3E4FQoMpk";

const BASE = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";
export const IMG_W500 = `${IMG_BASE}/w500`;
export const IMG_W780 = `${IMG_BASE}/w780`;
export const IMG_W1280 = `${IMG_BASE}/w1280`;
export const IMG_ORIGINAL = `${IMG_BASE}/original`;

// ---------- Raw response shapes (subset) ----------
export type TmdbListItem = {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  adult?: boolean;
  popularity: number;
  origin_country?: string[];
};

export type TmdbGenre = { id: number; name: string };

export type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: "YouTube" | "Vimeo" | string;
  type: "Trailer" | "Teaser" | "Featurette" | "Behind the Scenes" | string;
  official: boolean;
};

export type TmdbCredit = {
  id: number;
  name: string;
  character?: string;
  job?: string;
};

export type TmdbImage = {
  file_path: string;
  iso_639_1: string | null;
  vote_average: number;
};

export type TmdbEpisode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  runtime: number | null;
};

export type TmdbSeason = {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
};

export type TmdbSeasonDetail = {
  id: number;
  season_number: number;
  name: string;
  episodes: TmdbEpisode[];
};

export type TmdbDetail = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  tagline?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: TmdbGenre[];
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TmdbSeason[];
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbCredit[]; crew: TmdbCredit[] };
  external_ids?: { imdb_id?: string };
  images?: { logos: TmdbImage[] };
};

export type TmdbSearchResponse = {
  page: number;
  results: TmdbListItem[];
  total_results: number;
  total_pages: number;
};

// ---------- Normalized app-wide item ----------
export type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: string;
  genres: string[];
  genre_ids: number[];
  media_type: "movie" | "tv";
  runtime?: string;
  director?: string;
  actors?: string;
  rated?: string;
  country?: string;
  awards?: string;
  trailerKey?: string | null;
  tagline?: string;
  imdbId?: string;
  logoPath?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  /** Full season list from the detail endpoint (per-season episode counts) */
  seasons?: TmdbSeason[];
  /** Playback position picked on the info page (1-based) */
  season?: number;
  episode?: number;
};

// ---------- Genre map ----------
export const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

// ---------- Helpers ----------
const FALLBACK_POSTER = "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450">
      <rect fill="#131316" width="300" height="450"/>
      <rect x="0.5" y="0.5" width="299" height="449" rx="10" fill="none" stroke="rgba(255,255,255,0.08)"/>
      <path d="M142 210v30c0 2.4 2.6 3.9 4.7 2.7l24-15c1.9-1.2 1.9-4.2 0-5.4l-24-15c-2.1-1.2-4.7.3-4.7 2.7z" fill="rgba(255,255,255,0.18)"/>
    </svg>`
  );

const FALLBACK_BACKDROP = "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
      <rect fill="#131316" width="1280" height="720"/>
      <path d="M622 346v28c0 2.4 2.6 3.9 4.7 2.7l24-15c1.9-1.2 1.9-4.2 0-5.4l-24-15c-2.1-1.2-4.7.3-4.7 2.7z" fill="rgba(255,255,255,0.16)"/>
    </svg>`
  );

export const posterUrl = (path: string | null, size: "w500" | "original" = "w500") =>
  path ? `${IMG_BASE}/${size}${path}` : FALLBACK_POSTER;

export const backdropUrl = (path: string | null, size: "w1280" | "original" = "w1280") =>
  path ? `${IMG_BASE}/${size}${path}` : FALLBACK_BACKDROP;

const displayTitle = (item: TmdbListItem | TmdbDetail) =>
  item.title || item.name || "Untitled";

const year = (item: TmdbListItem | TmdbDetail) => {
  const d = item.release_date || item.first_air_date;
  return d ? d.slice(0, 4) : "";
};

const genresFromIds = (ids: number[] | undefined) =>
  (ids || []).map((id) => GENRE_MAP[id]).filter(Boolean) as string[];

const runtimeStr = (item: TmdbDetail) => {
  if (item.runtime) return `${item.runtime}m`;
  if (item.episode_run_time && item.episode_run_time.length)
    return `${item.episode_run_time[0]}m / ep`;
  return undefined;
};

const pickTrailer = (videos: TmdbVideo[] | undefined): string | null => {
  if (!videos) return null;
  const official = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  );
  if (official) return official.key;
  const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer");
  if (trailer) return trailer.key;
  const teaser = videos.find((v) => v.site === "YouTube" && v.type === "Teaser");
  if (teaser) return teaser.key;
  const any = videos.find((v) => v.site === "YouTube");
  return any ? any.key : null;
};

const pickLogo = (logos: TmdbImage[] | undefined): string | undefined => {
  if (!logos || logos.length === 0) return undefined;
  const sorted = [...logos].sort((a, b) => b.vote_average - a.vote_average);
  const english = sorted.find((l) => l.iso_639_1 === "en");
  if (english) return english.file_path;
  const neutral = sorted.find((l) => l.iso_639_1 === null);
  if (neutral) return neutral.file_path;
  return sorted[0]?.file_path;
};

// ---------- Normalizers ----------
const detectMediaType = (r: TmdbListItem): "movie" | "tv" => {
  if (r.media_type === "tv") return "tv";
  if (r.media_type === "movie") return "movie";
  if (r.name && !r.title && r.first_air_date) return "tv";
  if (r.release_date && !r.first_air_date) return "movie";
  if (r.first_air_date && !r.release_date) return "tv";
  return "movie";
};

export function normalizeListItem(
  r: TmdbListItem,
  fallbackMediaType?: "movie" | "tv"
): MediaItem | null {
  if (r.media_type === "person") return null;
  if (!r.poster_path) return null;

  const detectedType = detectMediaType(r);
  const mediaType = fallbackMediaType ?? detectedType;

  return {
    id: r.id,
    title: displayTitle(r),
    overview: r.overview || "",
    poster: posterUrl(r.poster_path),
    backdrop: r.backdrop_path ? backdropUrl(r.backdrop_path) : posterUrl(r.poster_path),
    rating: r.vote_average,
    year: year(r),
    genres: genresFromIds(r.genre_ids),
    genre_ids: r.genre_ids || [],
    media_type: mediaType,
    rated: r.adult ? "18+" : undefined,
  };
}

export function normalizeDetail(r: TmdbDetail): MediaItem {
  const cast = r.credits?.cast?.slice(0, 5).map((c) => c.name).join(", ");
  const director = r.credits?.crew?.find((c) => c.job === "Director")?.name;

  return {
    id: r.id,
    title: displayTitle(r),
    overview: r.overview || "",
    poster: posterUrl(r.poster_path),
    backdrop: backdropUrl(r.backdrop_path),
    rating: r.vote_average,
    year: year(r),
    genres: r.genres.map((g) => g.name),
    genre_ids: r.genres.map((g) => g.id),
    media_type: "name" in r && r.name && !r.title ? "tv" : "movie",
    runtime: runtimeStr(r),
    director,
    actors: cast,
    trailerKey: pickTrailer(r.videos?.results),
    tagline: r.tagline,
    imdbId: r.external_ids?.imdb_id || undefined,
    logoPath: pickLogo(r.images?.logos),
    numberOfSeasons: r.number_of_seasons,
    numberOfEpisodes: r.number_of_episodes,
    seasons: r.seasons,
  };
}

// ---------- API client ----------
const cache = new Map<string, unknown>();

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T | null> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") clean[k] = String(v);
  }
  const url = `${BASE}${path}?${new URLSearchParams(clean).toString()}`;
  const key = url;

  if (cache.has(key)) return cache.get(key) as T;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as T;
    cache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

// ---------- Public API ----------
export async function fetchTrending(
  type: "all" | "movie" | "tv" = "all",
  window: "day" | "week" = "week"
): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/trending/${type}/${window}`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchPopular(
  type: "movie" | "tv" = "movie",
  page = 1
): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/${type}/popular`, { page });
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, type))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchTopRated(type: "movie" | "tv" = "movie"): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/${type}/top_rated`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, type))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchUpcoming(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/movie/upcoming`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, "movie"))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchNowPlaying(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/movie/now_playing`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, "movie"))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchOnTheAir(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/tv/on_the_air`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, "tv"))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchByGenre(
  type: "movie" | "tv",
  genreId: number,
  page = 1
): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/discover/${type}`, {
    with_genres: genreId,
    sort_by: "popularity.desc",
    page,
  });
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, type))
    .filter((x): x is MediaItem => x !== null);
}

// Fetch a genre row containing both movies and TV shows
export async function fetchByGenreAll(
  genreId: number,
  page = 1
): Promise<MediaItem[]> {
  const [movies, shows] = await Promise.all([
    fetchByGenre("movie", genreId, page),
    fetchByGenre("tv", genreId, page),
  ]);
  return [...movies.slice(0, 10), ...shows.slice(0, 10)];
}

// Map provider name onto items so duplicate IDs across movie/TV are distinguishable
const withProvider = (items: MediaItem[], providerName: string): MediaItem[] =>
  providerName ? items.map((i) => ({ ...i, provider: providerName })) : items;

// Fetch titles available on a specific streaming provider (movies + TV, US region)
export async function fetchByProvider(
  providerId: number,
  page = 1
): Promise<MediaItem[]> {
  const params = {
    with_watch_providers: providerId,
    watch_region: "US",
    sort_by: "popularity.desc",
    page,
  };
  const [movies, shows] = await Promise.all([
    tmdbFetch<TmdbSearchResponse>(`/discover/movie`, params),
    tmdbFetch<TmdbSearchResponse>(`/discover/tv`, params),
  ]);
  const toItems = (data: TmdbSearchResponse | null, type: "movie" | "tv") =>
    (data?.results || [])
      .map((r) => normalizeListItem(r, type))
      .filter((x): x is MediaItem => x !== null);
  return [...toItems(movies, "movie").slice(0, 10), ...toItems(shows, "tv").slice(0, 10)];
}

// ── Infinite-scroll page fetchers (movies + TV merged, interleaved) ──

const normalizeResults = (
  data: TmdbSearchResponse | null,
  type: "movie" | "tv"
): MediaItem[] =>
  (data?.results || [])
    .map((r) => normalizeListItem(r, type))
    .filter((x): x is MediaItem => x !== null);

async function discoverBothPage(
  params: Record<string, string | number | undefined>,
  page: number
): Promise<MediaItem[]> {
  const [movies, shows] = await Promise.all([
    discover("movie", { ...params, page }),
    discover("tv", { ...params, page }),
  ]);
  const movieItems = normalizeResults(movies, "movie");
  const tvItems = normalizeResults(shows, "tv");
  const items: MediaItem[] = [];
  const max = Math.max(movieItems.length, tvItems.length);
  for (let i = 0; i < max; i++) {
    if (i < movieItems.length) items.push(movieItems[i]);
    if (i < tvItems.length) items.push(tvItems[i]);
  }
  return items;
}

export async function fetchPopularMoviesPage(page = 1): Promise<MediaItem[]> {
  return normalizeResults(
    await tmdbFetch<TmdbSearchResponse>(`/movie/popular`, { page }),
    "movie"
  );
}

export async function fetchPopularTvPage(page = 1): Promise<MediaItem[]> {
  return normalizeResults(
    await tmdbFetch<TmdbSearchResponse>(`/tv/popular`, { page }),
    "tv"
  );
}

async function discover(
  type: "movie" | "tv",
  params: Record<string, string | number | undefined>
): Promise<TmdbSearchResponse | null> {
  return tmdbFetch<TmdbSearchResponse>(`/discover/${type}`, params);
}

export async function fetchByGenreAllPage(
  genreId: number,
  page: number,
  type: "all" | "movie" | "tv" = "all"
): Promise<MediaItem[]> {
  if (type === "movie") {
    return normalizeResults(
      await discover("movie", {
        with_genres: genreId,
        sort_by: "popularity.desc",
        page,
      }),
      "movie"
    );
  }
  if (type === "tv") {
    return normalizeResults(
      await discover("tv", {
        with_genres: genreId,
        sort_by: "popularity.desc",
        page,
      }),
      "tv"
    );
  }
  return discoverBothPage(
    { with_genres: genreId, sort_by: "popularity.desc" },
    page
  );
}

export async function fetchByProviderPage(
  providerId: number,
  providerName: string,
  page: number
): Promise<MediaItem[]> {
  const items = await discoverBothPage(
    {
      with_watch_providers: providerId,
      watch_region: "US",
      sort_by: "popularity.desc",
    },
    page
  );
  return withProvider(items, providerName);
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<TmdbSearchResponse>(`/search/multi`, {
    query,
    include_adult: "false",
  });
  if (!data) return [];
  return data.results
    .filter((r) => r.poster_path)
    .map((r) => normalizeListItem(r))
    .filter((x): x is MediaItem => x !== null);
}

export async function fetchDetail(
  type: "movie" | "tv",
  id: number
): Promise<MediaItem | null> {
  const data = await tmdbFetch<TmdbDetail>(`/${type}/${id}`, {
    append_to_response: "videos,credits,external_ids,images",
    include_image_language: "en,null",
  });
  if (!data) return null;
  return normalizeDetail(data);
}

export async function fetchSeasonEpisodes(
  tvId: number,
  seasonNumber: number
): Promise<TmdbEpisode[]> {
  const data = await tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
  if (!data) return [];
  return data.episodes || [];
}

export async function fetchRecommendations(
  type: "movie" | "tv",
  id: number
): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(`/${type}/${id}/recommendations`);
  if (!data) return [];
  return data.results
    .map((r) => normalizeListItem(r, type))
    .filter((x): x is MediaItem => x !== null);
}

// ---------- Row definitions ----------
export const G = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  DRAMA: 18,
  SCIFI: 878,
  THRILLER: 53,
  ANIMATION: 16,
  DOCUMENTARY: 99,
  ROMANCE: 10749,
  CRIME: 80,
  FANTASY: 14,
  FAMILY: 10751,
  MYSTERY: 9648,
};

// Streaming providers supported by the Providers browser (TMDb watch provider IDs)
export const PROVIDERS: { id: number; name: string }[] = [
  { id: 8, name: "Netflix" },
  { id: 9, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 1899, name: "HBO Max" },
  { id: 350, name: "Apple TV" },
  { id: 15, name: "Hulu" },
  { id: 2303, name: "Paramount+" },
  { id: 387, name: "Peacock" },
  { id: 43, name: "Starz" },
  { id: 526, name: "AMC+" },
];

// Genres available in the Browse by Genre menu
export const GENRES: { id: number; name: string }[] = [
  { id: G.ACTION, name: "Action" },
  { id: G.COMEDY, name: "Comedy" },
  { id: G.DRAMA, name: "Drama" },
  { id: G.SCIFI, name: "Sci-Fi" },
  { id: G.THRILLER, name: "Thriller" },
  { id: G.HORROR, name: "Horror" },
  { id: G.ANIMATION, name: "Animation" },
  { id: G.DOCUMENTARY, name: "Documentary" },
  { id: G.ROMANCE, name: "Romance" },
  { id: G.CRIME, name: "Crime" },
  { id: G.FANTASY, name: "Fantasy" },
  { id: G.FAMILY, name: "Family" },
  { id: G.MYSTERY, name: "Mystery" },
];

export type RowDef = {
  id: string;
  title: string;
  isLarge?: boolean;
  filter?: "all" | "movie" | "tv";
  loader?: () => Promise<MediaItem[]>;
};

export const ROWS: RowDef[] = [
  {
    id: "home-top10-tv",
    title: "Top 10 series today",
    loader: () => fetchTrending("tv", "day"),
  },
  {
    id: "home-top10-movies",
    title: "Top 10 movies today",
    loader: () => fetchTrending("movie", "day"),
  },
  {
    id: "home-top-picks",
    title: "Today's Top Picks",
    loader: () => fetchTrending("all", "week"),
  },
  {
    id: "home-top-rated",
    title: "Top Rated",
    loader: async () => {
      const [m, t] = await Promise.all([fetchTopRated("movie"), fetchTopRated("tv")]);
      return [...m.slice(0, 10), ...t.slice(0, 10)];
    },
  },
  {
    id: "home-kids",
    title: "For Kids",
    loader: async () => {
      const [family, animation] = await Promise.all([
        fetchByGenre("movie", G.FAMILY),
        fetchByGenre("movie", G.ANIMATION),
      ]);
      return [...family, ...animation];
    },
  },
  {
    id: "home-anime",
    title: "Anime",
    loader: async () => {
      const [tvAnime, movieAnime] = await Promise.all([
        fetchByGenre("tv", G.ANIMATION),
        fetchByGenre("movie", G.ANIMATION),
      ]);
      return [...tvAnime, ...movieAnime];
    },
  },
  {
    id: "home-acclaimed",
    title: "Critically Acclaimed",
    loader: () => fetchTopRated("movie"),
  },
  {
    id: "home-browse-genre",
    title: "Browse by Genre",
    loader: () => fetchByGenreAll(G.ACTION),
  },
  {
    id: "home-providers",
    title: "Browse by Provider",
    loader: () => fetchByProvider(8),
  },
  {
    id: "tv-trending",
    title: "Trending",
    filter: "tv",
    loader: () => fetchTrending("tv", "week"),
  },
  {
    id: "tv-popular",
    title: "Popular",
    filter: "tv",
    loader: () => fetchPopular("tv"),
  },
  {
    id: "tv-top-rated",
    title: "Top Rated",
    filter: "tv",
    loader: () => fetchTopRated("tv"),
  },
  {
    id: "tv-on-air",
    title: "On The Air",
    filter: "tv",
    loader: () => fetchOnTheAir(),
  },
  {
    id: "movie-trending",
    title: "Trending",
    filter: "movie",
    loader: () => fetchTrending("movie", "week"),
  },
  {
    id: "movie-popular",
    title: "Popular",
    filter: "movie",
    loader: () => fetchPopular("movie"),
  },
  {
    id: "movie-top-rated",
    title: "Top Rated",
    filter: "movie",
    loader: () => fetchTopRated("movie"),
  },
  {
    id: "movie-now-playing",
    title: "Now Playing",
    filter: "movie",
    loader: () => fetchNowPlaying(),
  },
];

// ---------- My List persistence ----------
const MY_LIST_KEY = "saikoplay-mylist-v2";

export function loadMyList(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MY_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return [];
  }
}

export function saveMyList(list: MediaItem[]) {
  try {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
