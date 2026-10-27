"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "@/hooks/useFinePointer";
import { useLanguage } from "@/hooks/useLanguage";
import { cursorSpring, popSpring } from "@/constants/animation";

const SELECTOR = '[data-cursor="view"]';

// Accent "View →" disc that trails the pointer and grows in over any element marked
// data-cursor="view" (project cards). Mounted once in layout.js. Mouse/trackpad only,
// and not rendered at all with reduced motion. Decorative: the cards themselves are the links.
export default function CursorFollower() {
  const finePointer = useFinePointer();
  const reduce = useReducedMotion();
  if (!finePointer || reduce) return null;
  return <Follower />;
}

function Follower() {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, cursorSpring);
  const sy = useSpring(y, cursorSpring);

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    // Delegated: one pair of listeners for every card on every page
    const onOver = (e) => {
      if (e.target instanceof Element && e.target.closest(SELECTOR)) setActive(true);
    };
    const onOut = (e) => {
      const next = e.relatedTarget;
      if (!(next instanceof Element) || !next.closest(SELECTOR)) setActive(false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      className="pointer-events-none fixed left-0 top-0 z-[9998]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: active ? 1 : 0 }}
        transition={popSpring}
        className="flex size-[88px] items-center justify-center gap-1 rounded-full bg-accent text-ink text-[15px] font-semibold"
      >
        {t("View")} <span>→</span>
      </motion.div>
    </motion.div>
  );
}
