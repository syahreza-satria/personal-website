"use client";

import { useEffect, useRef, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { useLanguage } from "@/hooks/useLanguage";

const WEEKS = 53; // one year of columns
const BLOCK_MARGIN = 4;
const MIN_BLOCK = 11; // below this the grid scrolls sideways instead of shrinking further
const MAX_BLOCK = 18;

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Paper (no activity) → light accent → accent → ink for the busiest days
const theme = { light: ["#efefec", "#ffc9b4", "#ff9466", "#ff5a1f", "#111111"] };

// Last 12 months of contributions. Block size follows the card width so the grid fills it on
// desktop; on narrow screens it keeps a readable minimum and scrolls, starting at today.
const GithubCalendar = ({ username = "syahreza-satria" }) => {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [blockSize, setBlockSize] = useState(MIN_BLOCK);
  const scrollRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setMounted(true);
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  // Fit the blocks to the available width
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const fit = Math.floor(entry.contentRect.width / WEEKS) - BLOCK_MARGIN;
      setBlockSize(Math.max(MIN_BLOCK, Math.min(MAX_BLOCK, fit)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When the grid overflows, keep it scrolled to the right edge (today). The data arrives after a
  // fetch, so react to the grid's size changing rather than to a timer.
  useEffect(() => {
    const scroller = scrollRef.current;
    const grid = gridRef.current;
    if (!scroller || !grid) return;
    const observer = new ResizeObserver(() => {
      scroller.scrollLeft = scroller.scrollWidth;
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [mounted]);

  const labels = {
    totalCount: t("{{count}} contributions in the last year"),
    legend: { less: t("Less"), more: t("More") },
    ...(lang === "id" && { months: MONTHS_ID }),
  };

  return (
    <div className="w-full rounded-panel bg-surface p-5 sm:p-8">
      <div ref={scrollRef} className="overflow-x-auto w-full scrollbar-hide">
        {mounted ? (
          <div ref={gridRef} className="w-fit">
            <GitHubCalendar
              username={username}
              theme={theme}
              colorScheme="light"
              blockSize={blockSize}
              blockMargin={BLOCK_MARGIN}
              blockRadius={3}
              fontSize={14}
              labels={labels}
              style={{ color: "#4a4a46" }}
            />
          </div>
        ) : (
          <div className="h-[170px] w-full flex items-center justify-center text-muted text-sm">{t("Loading GitHub contributions...")}</div>
        )}
      </div>
    </div>
  );
};

export default GithubCalendar;
