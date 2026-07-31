import { useState, useMemo } from "react";
import type { MediaItem } from "../data/tmdb";
import {
  GENRES,
  PROVIDERS,
  G,
  fetchPopularMoviesPage,
  fetchPopularTvPage,
  fetchByGenreAllPage,
  fetchByProviderPage,
} from "../data/tmdb";
import MediaGrid from "../components/MediaGrid";
import { selectClass, selectChevronStyle } from "../utils/ui";

type PageProps = {
  myListIds: number[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
};

function FilterSelect({
  value,
  options,
  label,
  onChange,
}: {
  value: number;
  options: { id: number; name: string }[];
  label: string;
  onChange: (id: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${selectClass} max-w-[150px] sm:max-w-none`}
      style={selectChevronStyle}
      aria-label={`Select ${label}`}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

export function MoviesPage(props: PageProps) {
  return (
    <MediaGrid
      title="Movies"
      eyebrow="Browse"
      description="Every movie, endlessly scrollable."
      scrollKey="all-movies"
      fetchPage={(page) => fetchPopularMoviesPage(page)}
      {...props}
    />
  );
}

export function TvShowsPage(props: PageProps) {
  return (
    <MediaGrid
      title="TV Shows"
      eyebrow="Browse"
      description="Every series, endlessly scrollable."
      scrollKey="all-tv"
      fetchPage={(page) => fetchPopularTvPage(page)}
      {...props}
    />
  );
}

export function GenresPage(props: PageProps) {
  const [genre, setGenre] = useState<number>(G.ACTION);
  const genreName = useMemo(
    () => GENRES.find((g) => g.id === genre)?.name ?? "Genre",
    [genre]
  );
  return (
    <MediaGrid
      title="Genres"
      eyebrow="Browse"
      description={`Movies and series in ${genreName}.`}
      scrollKey={`genre-${genre}`}
      fetchPage={(page, key) => fetchByGenreAllPage(Number(key.slice(6)), page)}
      control={
        <FilterSelect
          value={genre}
          options={GENRES}
          label="genre"
          onChange={setGenre}
        />
      }
      {...props}
    />
  );
}

export function ProvidersPage(props: PageProps) {
  const [provider, setProvider] = useState<number>(PROVIDERS[0].id);
  const providerName = useMemo(
    () => PROVIDERS.find((p) => p.id === provider)?.name ?? "Provider",
    [provider]
  );
  return (
    <MediaGrid
      title="Providers"
      eyebrow="Browse"
      description={`Movies and series streaming on ${providerName}.`}
      scrollKey={`provider-${provider}`}
      fetchPage={(page, key) =>
        fetchByProviderPage(Number(key.slice(9)), providerName, page)
      }
      control={
        <FilterSelect
          value={provider}
          options={PROVIDERS}
          label="provider"
          onChange={setProvider}
        />
      }
      {...props}
    />
  );
}
