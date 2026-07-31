import { Wordmark, type ViewKey } from "./Navbar";

type Props = {
  onNavigate: (v: ViewKey) => void;
};

export default function Footer({ onNavigate }: Props) {
  const links: { label: string; view: ViewKey }[] = [
    { label: "TV Shows", view: "alltv" },
    { label: "Movies", view: "allmovies" },
    { label: "Genres", view: "allgenres" },
    { label: "Providers", view: "allproviders" },
    { label: "Donate", view: "donate" },
    { label: "Contact Us", view: "contact" },
  ];

  return (
    <footer className="border-t border-line text-text-muted text-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8">
        <div className="mb-6">
          <Wordmark className="text-xl" />
        </div>

        <nav className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mb-6 max-w-2xl">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.view)}
              className="text-[13px] text-left text-text-muted hover:text-text-primary transition-colors w-fit"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="pt-5 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs">© 2026 SaikoPlay. All rights reserved.</p>
          <p className="text-xs">
            Watch everything in real time — every time, everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
