"use client";

import React from "react";
import { PiCodeBold, PiPaintBrushBold, PiSparkleBold } from "react-icons/pi";

const icons = {
  dev: <PiCodeBold className="shrink-0" aria-hidden="true" />,
  creative: <PiPaintBrushBold className="shrink-0" aria-hidden="true" />,
  hybrid: <PiSparkleBold className="shrink-0" aria-hidden="true" />,
};

const typeOf = (type) => {
  const v = String(type || "dev").toLowerCase();
  if (v === "dev" || v === "developer") return "dev";
  if (v === "creative" || v === "design") return "creative";
  if (v === "hybrid" || v === "cross") return "hybrid";
  return null;
};

const sizes = {
  sm: "text-xs px-2.5 py-1 gap-1",
  md: "text-[13px] px-3 py-1.5 gap-1.5",
  lg: "text-sm px-3.5 py-2 gap-2",
};

/**
 * Outline pill tag. Dev / Creative / Hybrid share one style (1.5px ink outline); any other
 * value falls back to a quieter line-coloured outline.
 * @param {'dev' | 'creative' | 'hybrid' | string} type
 * @param {string} label
 * @param {boolean} showIcon
 * @param {'sm' | 'md' | 'lg'} size
 * @param {'paper' | 'ink'} tone  use "ink" on dark surfaces
 */
export default function Badge({ type = "dev", label, className = "", showIcon = false, size = "md", tone = "paper" }) {
  const kind = typeOf(type);
  const colour =
    tone === "ink" ? "border-on-ink text-on-ink" : kind ? "border-ink text-ink" : "border-line text-muted";

  return (
    <span
      className={`inline-flex items-center rounded-full border-[1.5px] font-semibold whitespace-nowrap ${sizes[size] || sizes.md} ${colour} ${className}`}
    >
      {showIcon && kind && icons[kind]}
      <span>{label}</span>
    </span>
  );
}
