"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Slim top progress bar. It starts when an internal link is clicked, trickles toward 90%,
// and completes when the route actually changes. Navigation itself is never delayed or
// intercepted, so links feel instant; the page body fades in via app/template.js.
const PageTransitionLoader = () => {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickle = useRef(null);
  const safety = useRef(null);
  const hideTimer = useRef(null);
  const lastPath = useRef(pathname);

  const clearTimers = () => {
    clearInterval(trickle.current);
    clearTimeout(safety.current);
    clearTimeout(hideTimer.current);
  };

  // Start on internal link clicks
  useEffect(() => {
    const onClick = (e) => {
      const anchor = e.target.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href.startsWith("//") ||
        anchor.getAttribute("target") === "_blank" ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      // Same page or in-page hash: nothing to load
      if (href.split("#")[0] === window.location.pathname || href.startsWith("#")) return;

      clearTimers();
      setVisible(true);
      setProgress(12);
      trickle.current = setInterval(() => {
        setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
      }, 120);
      // Never leave the bar hanging if navigation fails
      safety.current = setTimeout(() => {
        clearTimers();
        setVisible(false);
        setProgress(0);
      }, 8000);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Complete when the route changed
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    clearTimers();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
  }, [pathname]);

  useEffect(() => clearTimers, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
    >
      <div
        className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? "none" : "width 250ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
};

export default PageTransitionLoader;
