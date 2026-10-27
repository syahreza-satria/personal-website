// Shared motion tokens. Import from here instead of hand-tuning springs per component,
// so every transition on the site shares the same feel.

// Easing / timing
export const ease = [0.22, 1, 0.36, 1]; // "easeOutExpo"-like: fast start, soft landing
export const duration = { fast: 0.18, base: 0.3, slow: 0.5 };

// Springs
export const spring = { type: "spring", stiffness: 380, damping: 32 }; // small UI (indicators, pills)

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

// --- Interactive / scroll motion ------------------------------------------------
// Every token below assumes the caller checks useReducedMotion() and skips or simplifies the effect.

// Bouncy pop for small accent marks (hero ×, PageHeader dot)
export const popSpring = { type: "spring", stiffness: 260, damping: 14 };

// SplitReveal: each letter rises out of its own mask. The mask only clips below (it is padded
// for descenders), so the start offset is 135% to keep the letter fully hidden under that padding.
export const splitStagger = 0.03; // seconds between letters
export const splitLetter = {
  hidden: { y: "135%" },
  show: { y: 0, transition: { duration: 0.7, ease } },
};

// Hero ×: slow idle spin, and how far a hover spin should feel springy
export const idleSpin = { duration: 20, ease: "linear", repeat: Infinity }; // one turn per 20s
export const hoverSpin = { type: "spring", stiffness: 140, damping: 16 };

// Scroll reveal (Reveal / RevealItem)
export const revealViewport = { once: true, amount: 0.25 };
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
export const revealFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base } },
};
export const revealStagger = 0.08;

// DrawRule: a divider that draws itself from the left
export const drawLine = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease } },
};

// "View" cursor that trails the pointer over project cards
export const cursorSpring = { stiffness: 500, damping: 40 };

// Card media zoom on hover; put `initial="rest" whileHover="hover"` on the card
export const imageZoom = {
  rest: { scale: 1, transition: { duration: 0.5, ease } },
  hover: { scale: 1.04, transition: { duration: 0.5, ease } },
};

// Cursor-driven letter weight in the hero (variable "wght" axis)
export const weightFollow = { near: 800, far: 500, radius: 220 };

// Skill chips (Home): magnetic pull toward the cursor, accent fill rising from the bottom,
// label rolling up, and a small alternating tilt. Put `initial="rest" whileHover="hover"` on the chip.
export const magnetSpring = { stiffness: 300, damping: 15, mass: 0.4 };
export const magnetStrength = 0.35; // share of the cursor's offset from the chip centre
export const chipHover = { duration: 0.35, ease };
export const chipTilt = {
  rest: { rotate: 0, transition: { type: "spring", stiffness: 300, damping: 12 } },
  hover: (i) => ({ rotate: i % 2 ? 3 : -3, transition: { type: "spring", stiffness: 300, damping: 12 } }),
};
export const chipFill = {
  rest: { clipPath: "inset(100% 0% 0% 0% round 999px)", transition: chipHover },
  hover: { clipPath: "inset(0% 0% 0% 0% round 999px)", transition: chipHover },
};
export const chipRollOut = {
  rest: { y: "0%", transition: chipHover },
  hover: { y: "-110%", transition: chipHover },
};
export const chipRollIn = {
  rest: { y: "110%", transition: chipHover },
  hover: { y: "0%", transition: chipHover },
};
export const chipTap = { scale: 0.92 };

// Mobile menu: circular clip-path from the Menu button; links start at ~60% open
export const menuCircle = { duration: 0.55, ease };
export const menuLinks = {
  hidden: {},
  show: { transition: { delayChildren: menuCircle.duration * 0.6, staggerChildren: 0.06 } },
};
