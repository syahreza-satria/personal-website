"use client";

import { motion, useReducedMotion } from "framer-motion";
import SplitReveal, { splitDuration } from "./SplitReveal";
import DrawRule from "./DrawRule";
import Reveal from "./Reveal";
import { popSpring } from "@/constants/animation";

// Uniform page opener: giant display title (letter reveal) ending in an accent dot that pops in,
// a short intro, and a 2px ink rule that draws itself. `title` must be a translated string.
// `children` renders beside the intro (e.g. an admin "Add" button).
export default function PageHeader({ title, intro, children }) {
  const reduce = useReducedMotion();
  const titleEnd = 0.1 + splitDuration(title);

  return (
    <section className="pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <h1 className="font-display font-extrabold text-[clamp(56px,11vw,160px)] leading-[0.86] tracking-[-0.05em] break-words min-w-0">
          <SplitReveal text={title} delay={0.1} />
          <motion.span
            aria-hidden="true"
            className="inline-block text-accent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { ...popSpring, delay: titleEnd - 0.15 }}
          >
            .
          </motion.span>
        </h1>
        {(intro || children) && (
          <Reveal delay={titleEnd - 0.3} className="flex flex-col items-start gap-4 max-w-[440px]">
            {intro && <p className="text-lg leading-normal">{intro}</p>}
            {children}
          </Reveal>
        )}
      </div>
      <DrawRule inView={false} delay={titleEnd - 0.2} />
    </section>
  );
}
