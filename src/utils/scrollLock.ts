// Reference-counted body scroll lock.
// Nested modals (detail modal → player, etc.) each acquire a lock;
// the document scrollbar is only restored once EVERY lock is released,
// and always restored when the last one goes away.

let lockCount = 0;
let savedOverflow = "";

export function lockBodyScroll() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    savedOverflow = "";
  }
}
