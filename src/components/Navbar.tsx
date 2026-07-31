import { useEffect, useRef, useState } from "react";
import {
  Home,
  Tv,
  Film,
  Sparkles,
  Music,
  Heart,
  Search,
  X,
  UserRound,
  Sun,
  Moon,
} from "lucide-react";

export type ViewKey =
  | "home"
  | "movies"
  | "tvshows"
  | "new"
  | "mvzone"
  | "mylist"
  | "search"
  | "allmovies"
  | "alltv"
  | "allgenres"
  | "allproviders"
  | "donate"
  | "contact";

type Props = {
  currentView: ViewKey;
  onNavigate: (v: ViewKey) => void;
  onSearch: (q: string) => void;
};

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-[-0.02em] leading-none select-none whitespace-nowrap ${className}`}
    >
      <span className="text-text-primary transition-colors duration-300">saiko</span>
      <span className="text-accent transition-colors duration-300">play</span>
    </span>
  );
}

const THEME_KEY = "saikoplay-theme";
const AVATAR_KEY = "saikoplay-avatar";

type AvatarOption = { type: "icon" | "image"; value: string; label: string };

// Built-in avatar gallery — the site default icon comes first
const AVATARS: AvatarOption[] = [
  { type: "icon", value: "default", label: "Default avatar" },
  { type: "image", value: "https://i.pinimg.com/736x/2d/5c/ff/2d5cff5d9c00e18dc49937d61ebc7bad.jpg", label: "Avatar 1" },
  { type: "image", value: "https://i.pinimg.com/736x/92/85/4e/92854e6df252af1326bf41160fd36394.jpg", label: "Avatar 2" },
  { type: "image", value: "https://i.pinimg.com/736x/69/38/89/6938893842f2d17efd9059d166502f9d.jpg", label: "Avatar 3" },
  { type: "image", value: "https://i.pinimg.com/736x/7f/af/52/7faf52ca63656c641a66dfb0b6b8269a.jpg", label: "Avatar 4" },
  { type: "image", value: "https://i.pinimg.com/736x/9b/84/eb/9b84ebf4f1e1febcb654aceed7dd0746.jpg", label: "Avatar 5" },
  { type: "image", value: "https://i.pinimg.com/736x/2a/dc/0c/2adc0c51dd6638ebc9ec55433c176a01.jpg", label: "Avatar 6" },
  { type: "image", value: "https://i.pinimg.com/736x/80/47/d9/8047d924370e8b509495277c865e0071.jpg", label: "Avatar 7" },
  { type: "image", value: "https://i.pinimg.com/736x/46/6e/50/466e5070ac3acd8c1d9b0bf94dea68eb.jpg", label: "Avatar 8" },
  { type: "image", value: "https://i.pinimg.com/736x/b5/f6/b4/b5f6b4e9d24805b4ca0811802b6d5d25.jpg", label: "Avatar 9" },
  { type: "image", value: "https://i.pinimg.com/736x/08/dd/39/08dd390dba32014b6830ca7abcca381e.jpg", label: "Avatar 10" },
  { type: "image", value: "https://i.pinimg.com/736x/f8/ff/04/f8ff04287ef81267ea468013d683bfbc.jpg", label: "Avatar 11" },
];

function readAvatar(): string | null {
  try {
    const v = localStorage.getItem(AVATAR_KEY);
    return v && AVATARS.some((a) => a.type === "image" && a.value === v) ? v : null;
  } catch {
    return null;
  }
}

export default function Navbar({ currentView, onNavigate, onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme — persisted across sessions
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // storage unavailable — ignore
    }
  }, [theme]);

  // Avatar — persisted across sessions (null = site default icon)
  const [avatar, setAvatar] = useState<string | null>(readAvatar);

  useEffect(() => {
    try {
      if (avatar) localStorage.setItem(AVATAR_KEY, avatar);
      else localStorage.removeItem(AVATAR_KEY);
    } catch {
      // storage unavailable — ignore
    }
  }, [avatar]);

  // Solidify header once the hero scrolls under it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Closing the search always resets the query for a fresh start
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      closeSearch();
    }
  };

  const navItems: { key: ViewKey; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Home", icon: <Home size={16} /> },
    { key: "tvshows", label: "TV Shows", icon: <Tv size={16} /> },
    { key: "movies", label: "Movies", icon: <Film size={16} /> },
    { key: "new", label: "New", icon: <Sparkles size={16} /> },
    { key: "mvzone", label: "MV Zone", icon: <Music size={16} /> },
    { key: "mylist", label: "My List", icon: <Heart size={16} /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? "bg-bg-primary/85 backdrop-blur-xl shadow-nav" : "nav-top-scrim"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-12">
        {/* Wordmark + primary nav */}
        <div className="flex items-center gap-9">
          <button
            onClick={() => onNavigate("home")}
            className="group py-1 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]"
            aria-label="SaikoPlay home"
          >
            <Wordmark className="text-lg md:text-[21px] transition-all duration-200 group-hover:tracking-[-0.01em]" />
          </button>

          {/* Desktop navigation — hidden on small screens */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ key, label }) => {
              const active = currentView === key;
              return (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-200 ${
                    active
                      ? "text-text-primary bg-veil dark:bg-veil [html[data-theme=light]_&]:text-[#2b2b2e]"
                      : "text-text-secondary hover:text-text-primary hover:bg-veil [html[data-theme=light]_&]:text-[#6e6e75] [html[data-theme=light]_&]:hover:text-[#2b2b2e]"
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-accent [html[data-theme=light]_&]:bg-[#499a13]/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 bg-bg-secondary ring-1 ring-line-strong rounded-lg pl-3 pr-2 py-1.5 w-52 sm:w-64 animate-fade-in"
            >
              <Search size={15} className="text-text-muted shrink-0" />
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                placeholder="Titles, people, genres…"
                className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="p-1 rounded-md text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-veil transition-colors [html[data-theme=light]_&]:text-[#6e6e75] [html[data-theme=light]_&]:hover:text-[#2b2b2e]"
              aria-label="Search"
            >
              <Search size={17} />
            </button>
          )}

          {/* Profile avatar — always visible, opens menu (nav on small screens) */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ring-1 transition-all ${
                menuOpen
                  ? "bg-bg-tertiary ring-line-strong text-text-primary"
                  : "bg-bg-secondary ring-line text-text-secondary hover:text-text-primary hover:ring-line-strong"
              }`}
              aria-label="Menu"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound size={15} />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-56 bg-bg-secondary ring-1 ring-line rounded-xl overflow-hidden shadow-lift animate-scale-in">
                {/* Nav items — only show on smaller screens where desktop nav is hidden */}
                <div className="lg:hidden py-1.5">
                  {navItems.map(({ key, label, icon }) => {
                    const active = currentView === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onNavigate(key);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                          active
                            ? "text-text-primary bg-veil"
                            : "text-text-secondary hover:text-text-primary hover:bg-veil"
                        }`}
                      >
                        <span className={active ? "text-accent" : "text-text-muted"}>
                          {icon}
                        </span>
                        {label}
                        {active && (
                          <span className="ml-auto w-1 h-1 rounded-full bg-accent" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Personalization — avatar gallery */}
                <div className="px-3 py-2.5 border-t border-line lg:border-t-0">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-muted px-1 pb-2">
                    Personalization
                  </p>
                  <div className="grid grid-cols-4 gap-2 px-0.5">
                    {AVATARS.map((option) => {
                      const selected =
                        option.type === "icon" ? avatar === null : avatar === option.value;
                      return (
                        <button
                          key={option.label}
                          onClick={() =>
                            setAvatar(option.type === "icon" ? null : option.value)
                          }
                          title={option.label}
                          aria-label={`Use ${option.label}`}
                          aria-pressed={selected}
                          className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-bg-tertiary transition-all duration-150 ${
                            selected
                              ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-secondary"
                              : "ring-1 ring-line hover:ring-line-strong hover:scale-[1.05]"
                          }`}
                        >
                          {option.type === "icon" ? (
                            <UserRound size={16} className="text-text-muted" />
                          ) : (
                            <img
                              src={option.value}
                              alt={option.label}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Appearance — segmented theme control, always mirrors active theme */}
                <div className="px-3 py-2.5 border-t border-line lg:border-t-0 flex items-center gap-3">
                  <span className="text-[13px] text-text-secondary">Theme</span>
                  <div
                    role="group"
                    aria-label="Color theme"
                    className="ml-auto flex items-center bg-bg-tertiary ring-1 ring-line rounded-lg p-0.5"
                  >
                    <button
                      onClick={() => setTheme("light")}
                      aria-pressed={theme === "light"}
                      aria-label="Light mode"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-bg-secondary text-text-primary ring-1 ring-line-strong shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      <Sun size={13} />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      aria-pressed={theme === "dark"}
                      aria-label="Dark mode"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-bg-secondary text-text-primary ring-1 ring-line-strong shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      <Moon size={13} />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Profile footer */}
                <div className="px-4 py-3 border-t border-line">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Everything, <span className="text-text-secondary">every time, everywhere.</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
