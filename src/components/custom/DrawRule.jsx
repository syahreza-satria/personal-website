"use client";

import { motion, useReducedMotion } from "framer-motion";
import { drawLine, revealViewport } from "@/constants/animation";

/**
 * Ink divider that draws itself from the left when it scrolls into view.
 * Replaces `border-t-2 border-ink` style rules; it is decorative (aria-hidden).
 *
 * @param {"2" | "1.5"} weight  line thickness in px
 * @param {number} delay        seconds
 * @param {boolean} inView      false = animate on mount instead of on scroll (e.g. above the fold)
 */
export default function DrawRule({ weight = "2", delay = 0, inView = true, className = "" }) {
  const reduce = useReducedMotion();
  const variants = {
    hidden: drawLine.hidden,
    show: { ...drawLine.show, transition: reduce ? { duration: 0 } : { ...drawLine.show.transition, delay } },
  };
  const trigger = inView ? { whileInView: "show", viewport: revealViewport } : { animate: "show" };

  return (
    <motion.div
      aria-hidden="true"
      variants={variants}
      initial="hidden"
      {...trigger}
      className={`w-full bg-ink origin-left ${weight === "1.5" ? "h-[1.5px]" : "h-0.5"} ${className}`}
    />
  );
}
