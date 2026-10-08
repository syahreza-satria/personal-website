// Shared motion tokens. Import from here instead of hand-tuning springs per component,
// so every transition on the site shares the same feel.

// Easing / timing
export const ease = [0.22, 1, 0.36, 1]; // "easeOutExpo"-like: fast start, soft landing
export const duration = { fast: 0.18, base: 0.3, slow: 0.5 };

// Springs
export const spring = { type: "spring", stiffness: 380, damping: 32 }; // small UI (indicators, pills)
export const softSpring = { type: "spring", stiffness: 220, damping: 26 }; // larger surfaces

// Staggered entrance: put `parent` on the container and `child` on each direct child.
const parent = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { delayChildren: 0.04, staggerChildren: 0.08 },
  },
};

const child = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease },
  },
};

// Modals / lightboxes
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.base, ease },
};

export const modalPanel = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 8 },
  transition: { duration: duration.base, ease },
};

// Grid/list items that enter and leave (filters, add/remove)
export const listItem = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: duration.base, ease },
};

export { parent, child };
