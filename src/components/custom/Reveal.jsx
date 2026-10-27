"use client";

import { createElement } from "react";
import { motion } from "framer-motion";
import { revealStagger, revealUp, revealViewport } from "@/constants/animation";

// motion.* components per tag, resolved once at module level
const tags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  dl: motion.dl,
  p: motion.p,
  h2: motion.h2,
  span: motion.span,
};

const container = (delay, stagger) => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: stagger } },
});

/**
 * Rises in (y 24 → 0, fade) the first time it scrolls into view.
 * With `stagger`, it only orchestrates: its RevealItem children rise one after another instead.
 * Under prefers-reduced-motion the MotionProvider config drops the movement, leaving a fade.
 *
 * Don't wrap something that already enters with the page's parent/child stagger.
 */
export default function Reveal({ as = "div", delay = 0, stagger, children, ...props }) {
  const variants = stagger
    ? container(delay, stagger === true ? revealStagger : stagger)
    : { ...revealUp, show: { ...revealUp.show, transition: { ...revealUp.show.transition, delay } } };

  return createElement(
    tags[as] ?? motion.div,
    { initial: "hidden", whileInView: "show", viewport: revealViewport, variants, ...props },
    children
  );
}

// A row inside <Reveal stagger>; inherits the parent's in-view trigger.
export function RevealItem({ as = "div", children, ...props }) {
  return createElement(tags[as] ?? motion.div, { variants: revealUp, ...props }, children);
}
