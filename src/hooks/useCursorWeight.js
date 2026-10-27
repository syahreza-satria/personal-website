"use client";

import { useEffect } from "react";
import { weightFollow } from "@/constants/animation";

/**
 * Letters under `ref` (elements with `data-split-letter`) get a variable-font "wght" that follows
 * the cursor: `near` weight right under it, fading to `far` beyond `radius` px.
 * Works through refs and requestAnimationFrame only (no React state per frame).
 * Letter centres are measured once and again on resize/scroll; leaving the window restores the CSS weight.
 * `watch` (e.g. the translated text) re-runs the setup when the letters themselves change.
 */
export function useCursorWeight(ref, enabled, watch, { near, far, radius } = weightFollow) {
  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root) return;

    let letters = [];
    let pointer = null; // { x, y } in viewport coords
    let frame = 0;

    const measure = () => {
      letters = [...root.querySelectorAll("[data-split-letter]")].map((el) => {
        // Measure the untransformed mask, not the letter (it may still be rising in)
        const r = (el.parentElement ?? el).getBoundingClientRect();
        return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const paint = () => {
      frame = 0;
      for (const l of letters) {
        if (!pointer) {
          l.el.style.fontVariationSettings = "";
          continue;
        }
        const d = Math.hypot(pointer.x - l.x, pointer.y - l.y);
        const t = Math.min(d / radius, 1);
        l.el.style.fontVariationSettings = `"wght" ${Math.round(near - (near - far) * t)}`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };
    const onLayout = () => {
      measure();
      schedule();
    };

    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout);
      for (const l of letters) l.el.style.fontVariationSettings = "";
    };
  }, [ref, enabled, watch, near, far, radius]);
}
