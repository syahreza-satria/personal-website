"use client";

import React from "react";
import { PiCodeBold, PiPaintBrushBold, PiSparkleBold } from "react-icons/pi";

/**
 * Visual Badge Component for Dual Identity Focus
 * @param {'dev' | 'creative' | 'hybrid'} type
 * @param {string} label
 * @param {string} className
 * @param {boolean} showIcon
 * @param {'sm' | 'md' | 'lg'} size
 */
export default function Badge({
  type = "dev",
  label,
  className = "",
  showIcon = true,
  size = "md",
}) {
  const normalizedType = (type || "dev").toLowerCase();

  let styles = "";
  let defaultIcon = null;

  if (normalizedType === "dev" || normalizedType === "developer") {
    styles =
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/20";
    defaultIcon = <PiCodeBold className="shrink-0" />;
  } else if (normalizedType === "creative" || normalizedType === "design") {
    styles =
      "bg-lime-500/10 text-lime-300 border-lime-500/20 hover:border-lime-500/40 hover:bg-lime-500/20";
    defaultIcon = <PiPaintBrushBold className="shrink-0" />;
  } else if (normalizedType === "hybrid" || normalizedType === "cross") {
    styles =
      "bg-gradient-to-r from-emerald-500/10 via-lime-500/10 to-lime-500/10 text-emerald-300 border-emerald-500/30 hover:border-lime-500/40 shadow-sm";
    defaultIcon = <PiSparkleBold className="shrink-0 text-lime-300" />;
  } else {
    // Neutral fallback
    styles = "bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:border-neutral-600";
  }

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1 rounded-md font-medium border",
    md: "text-xs px-2.5 py-1 gap-1.5 rounded-lg font-medium border",
    lg: "text-sm px-3 py-1.5 gap-2 rounded-xl font-semibold border",
  }[size] || "text-xs px-2.5 py-1 gap-1.5 rounded-lg font-medium border";

  return (
    <span
      className={`inline-flex items-center transition-all duration-200 whitespace-nowrap ${sizeStyles} ${styles} ${className}`}
    >
      {showIcon && defaultIcon}
      <span>{label}</span>
    </span>
  );
}
