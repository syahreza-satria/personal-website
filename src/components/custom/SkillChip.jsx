"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { chipFill, chipRollIn, chipRollOut, chipTap, chipTilt, magnetSpring, magnetStrength } from "@/constants/animation";

/**
 * Outline skill pill with a playful hover: it leans toward the cursor (magnetic), fills with accent
 * from the bottom, tilts a little and rolls its label up. Touch devices get a tap squish instead.
 * Reduced motion: no movement, the hover just turns the pill accent (CSS `motion-reduce:`).
 *
 * @param {string} name       skill label (visible once to screen readers; the rolling copy is aria-hidden)
 * @param {number} index      alternates the tilt direction
 * @param {boolean} magnetic  pass useFinePointer() from the parent so 30 chips share one media query
 */
export default function SkillChip({ name, index = 0, magnetic = false }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, magnetSpring);
  const sy = useSpring(y, magnetSpring);
  const playful = !reduce;

  const onPointerMove = (e) => {
    if (!magnetic || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * magnetStrength);
    y.set((e.clientY - (r.top + r.height / 2)) * magnetStrength);
  };
  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.li
      custom={index}
      variants={chipTilt}
      initial="rest"
      animate="rest"
      whileHover={playful ? "hover" : undefined}
      whileTap={playful ? chipTap : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: sx, y: sy }}
      className="relative px-4 py-2.5 rounded-full border-[1.5px] border-ink text-[15px] font-medium cursor-default select-none motion-reduce:hover:bg-accent"
    >
      {/* Accent fill that rises from the bottom */}
      <motion.span aria-hidden="true" variants={chipFill} className="absolute inset-0 rounded-full bg-accent" />
      {/* Label rolls up and an identical copy rolls in from below */}
      <span className="relative block overflow-hidden">
        <motion.span className="block" variants={chipRollOut}>
          {name}
        </motion.span>
        <motion.span aria-hidden="true" className="absolute inset-0 block" variants={chipRollIn}>
          {name}
        </motion.span>
      </span>
    </motion.li>
  );
}
