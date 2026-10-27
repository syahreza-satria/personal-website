"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { spring } from "@/constants/animation";

const options = [
  { code: "en", label: "EN", full: "English" },
  { code: "id", label: "ID", full: "Bahasa Indonesia" },
];

// tone: "paper" on light backgrounds (footer), "ink" on dark ones (mobile menu)
export default function LanguageToggle({ tone = "paper", className = "" }) {
  const { lang, setLang, t } = useLanguage();
  const pillId = useId(); // several toggles can be mounted; keep their pills independent
  const onInk = tone === "ink";

  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={`inline-flex rounded-full border-[1.5px] p-1 ${onInk ? "border-on-ink" : "border-ink"} ${className}`}
    >
      {options.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            aria-pressed={active}
            title={opt.full}
            className={`relative min-h-11 min-w-11 px-3 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              active ? (onInk ? "text-ink" : "text-on-ink") : onInk ? "text-on-ink" : "text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${pillId}`}
                transition={spring}
                className={`absolute inset-0 rounded-full ${onInk ? "bg-on-ink" : "bg-ink"}`}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
