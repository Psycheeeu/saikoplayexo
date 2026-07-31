// Shared select styling used by filter menus across rows, player, and pages.
export const selectClass =
  "appearance-none bg-bg-secondary ring-1 ring-line rounded-lg pl-3 pr-8 py-2 text-[12.5px] font-medium text-text-primary hover:ring-line-strong transition-all cursor-pointer bg-no-repeat";

export const selectChevronStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d6d77' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundPosition: "right 0.65rem center",
} as const;
