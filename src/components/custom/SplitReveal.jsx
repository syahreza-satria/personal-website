"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { splitLetter, splitStagger } from "@/constants/animation";

/**
 * Letter-by-letter reveal: each letter rises out of its own mask (clipped at the bottom edge only).
 * Words are kept whole (each word is a nowrap inline-block), so wrapping never splits one.
 *
 * Accessibility: the full text sits in an sr-only span and every letter span is aria-hidden.
 * (aria-label on a plain <span> is ignored by many screen readers, so a hidden text copy is used.)
 *
 * Letters carry `data-split-letter` so a parent can find them (e.g. the hero weight effect).
 *
 * @param {string} text        already translated, e.g. t("Code")
 * @param {number} delay       seconds before the first letter starts
 * @param {number} stagger     seconds between letters
 * @param {string} className   applied to the wrapper span
 */
export default function SplitReveal({ text, delay = 0, stagger = splitStagger, className = "" }) {
  const reduce = useReducedMotion();
  // Variant-level transitions win over the `transition` prop, so the per-letter delay lives in the variant
  const letterVariants = (i) => ({
    hidden: splitLetter.hidden,
    show: {
      ...splitLetter.show,
      transition: reduce ? { duration: 0 } : { ...splitLetter.show.transition, delay: delay + i * stagger },
    },
  });
  const words = String(text).split(" ");
  let index = 0;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((letter) => {
                const i = index++;
                return (
                  // The mask clips only its bottom edge (clip-path inset with negative top/sides), so tight
                  // tracking and leading never crop ascenders or the sides of a glyph. The bottom padding
                  // (cancelled by a negative margin) leaves room for descenders.
                  <span
                    key={i}
                    className="inline-block align-top pb-[0.25em] -mb-[0.25em] [clip-path:inset(-1em_-1em_0_-1em)]"
                  >
                    <motion.span
                      data-split-letter=""
                      className="inline-block"
                      variants={letterVariants(i)}
                      initial="hidden"
                      animate="show"
                    >
                      {letter}
                    </motion.span>
                  </span>
                );
              })}
            </span>
            {/* The space sits between word boxes so the line can wrap there */}
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

// Seconds until a SplitReveal of `text` is (almost) finished; use to chain the next element.
export const splitDuration = (text, stagger = splitStagger) =>
  String(text).replace(/ /g, "").length * stagger + splitLetter.show.transition.duration;
