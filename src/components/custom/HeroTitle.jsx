"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SplitReveal, { splitDuration } from "./SplitReveal";
import DrawRule from "./DrawRule";
import { useFinePointer } from "@/hooks/useFinePointer";
import { useCursorWeight } from "@/hooks/useCursorWeight";
import { hoverSpin, idleSpin, popSpring } from "@/constants/animation";

// Home hero: "Code × Creative." with letter reveals, a spinning accent ×, a rule that draws
// itself once the title is in, and (mouse only) letter weight that follows the cursor.
// `line1` / `line2` are translated strings; `children` is the intro row under the rule.
export default function HeroTitle({ line1, line2, children }) {
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const titleRef = useRef(null);
  const [spins, setSpins] = useState(0);

  useCursorWeight(titleRef, finePointer && !reduce, `${line1}|${line2}`);

  const start = 0.1;
  const line1End = start + splitDuration(line1);
  // Line two starts as line one is landing; the rule draws once the title is in
  const line2Start = start + splitDuration(line1) * 0.75;
  const titleEnd = line2Start + splitDuration(line2);

  return (
    <>
      <h1
        ref={titleRef}
        className="font-display font-extrabold text-[clamp(64px,14vw,200px)] leading-[0.86] tracking-[-0.05em]"
      >
        <SplitReveal text={line1} delay={start} />
        {/* Outer: pop in. Middle: one fast turn per hover. Inner: slow idle turn. */}
        <motion.span
          aria-hidden="true"
          className="inline-block text-accent"
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={reduce ? { duration: 0 } : { ...popSpring, delay: line1End - 0.2 }}
        >
          <motion.span
            className="inline-block"
            animate={{ rotate: spins * 360 }}
            transition={hoverSpin}
            onHoverStart={() => finePointer && !reduce && setSpins((n) => n + 1)}
          >
            <motion.span
              className="inline-block"
              animate={reduce ? { rotate: 0 } : { rotate: 360 }}
              transition={reduce ? { duration: 0 } : idleSpin}
            >
              ×
            </motion.span>
          </motion.span>
        </motion.span>
        <br />
        <SplitReveal text={line2} delay={line2Start} />
      </h1>

      <div className="flex flex-col gap-6">
        <DrawRule inView={false} delay={titleEnd - 0.15} />
        {children}
      </div>
    </>
  );
}

// Seconds after mount when the hero title and rule have finished; use to time what follows.
export const heroIntroDelay = (line1, line2) =>
  0.1 + splitDuration(line1) * 0.75 + splitDuration(line2) + 0.3;
