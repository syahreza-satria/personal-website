"use client";

import { useEffect, useRef, useState } from "react";
import SpotlightCard from "../SpotlightCard";

import { GitHubCalendar } from "react-github-calendar";

// Only the most recent months are shown, so the latest activity is always visible.
const RECENT_MONTHS = 6;

const keepRecent = (contributions) => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RECENT_MONTHS);
  return contributions.filter((day) => new Date(day.date) >= cutoff);
};

const GithubCalendar = ({ username = "syahreza-satria" }) => {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setMounted(true);
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  // On narrow screens the graph can overflow; start at the right edge (today).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !mounted) return;
    const t = setTimeout(() => {
      el.scrollLeft = el.scrollWidth;
    }, 300);
    return () => clearTimeout(t);
  }, [mounted]);

  const customTheme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#27272a", "#064e3b", "#047857", "#10b981", "#34d399"],
  };

  return (
    <SpotlightCard
      className="custom-spotlight-card w-full relative group"
      spotlightColor="rgba(16, 185, 129, 0.2)"
    >
      <div ref={scrollRef} className="overflow-x-auto w-full scrollbar-hide py-2">
        <div className="w-fit mx-auto">
          {mounted ? (
            <GitHubCalendar
              username={username}
              theme={customTheme}
              colorScheme="dark"
              transformData={keepRecent}
              style={{
                color: "#e5e5e5",
              }}
              labels={{
                totalCount: "{{count}} contributions in the last 6 months",
              }}
            />
          ) : (
            <div className="h-[150px] w-full flex items-center justify-center text-neutral-500  text-sm">
              Loading GitHub contributions...
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

export default GithubCalendar;
