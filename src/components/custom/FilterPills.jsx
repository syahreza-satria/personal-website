"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { spring } from "@/constants/animation";

// Single-choice filter row: 1.5px ink outlines, with one ink indicator that slides to the
// active pill. options: [{ value, label }] with labels already translated.
export default function FilterPills({ options, value, onChange, label, className = "" }) {
  const indicatorId = useId(); // several FilterPills can be mounted; keep their indicators apart

  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`relative min-h-11 px-5 rounded-full border-[1.5px] border-ink text-[15px] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-100 ${
              active ? "text-on-ink" : "text-ink hover:bg-surface"
            }`}
          >
            {active && (
              <motion.span
                aria-hidden="true"
                layoutId={`filter-pill-${indicatorId}`}
                transition={spring}
                className="absolute -inset-[1.5px] rounded-full bg-ink"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
