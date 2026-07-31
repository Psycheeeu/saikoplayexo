import { Plus } from "lucide-react";

type Props = {
  onBrowse: () => void;
};

export default function EmptyMyList({ onBrowse }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-bg-secondary ring-1 ring-line flex items-center justify-center mb-6">
        <Plus size={26} className="text-text-muted" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2.5">
        My List
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-text-primary mb-2.5">
        Your list is empty
      </h2>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-7">
        Looking for something to watch? Add shows and movies to your list so you
        can easily find them later.
      </p>
      <button
        onClick={onBrowse}
        className="bg-solid text-solid-text px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Browse titles
      </button>
    </div>
  );
}
