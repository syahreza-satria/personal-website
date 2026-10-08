"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { PiTranslateBold } from "react-icons/pi";
import { useLanguage } from "@/hooks/useLanguage";
import { spring } from "@/constants/animation";

const options = [
  { code: "en", label: "EN", full: "English" },
  { code: "id", label: "ID", full: "Bahasa Indonesia" },
];

// compact = small version for the mobile top bar
export default function LanguageToggle({ compact = false, className = "" }) {
  const { lang, setLang, t } = useLanguage();
  const pillId = useId(); // two toggles exist (sidebar + topbar); keep their pills independent

  return (
    <div className={className}>
      {!compact && (
        <p className="flex items-center gap-1.5 px-1 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
          <PiTranslateBold className="size-3" />
          {t("Language")}
        </p>
      )}
      <div
        role="group"
        aria-label={t("Language")}
        className="flex rounded-xl border border-neutral-800 bg-neutral-950 p-1"
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
              className={`relative flex-1 rounded-lg font-semibold transition-colors duration-200 cursor-pointer ${
                compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
              } ${active ? "text-black" : "text-neutral-400 hover:text-neutral-100"}`}
            >
              {active && (
                <motion.span
                  layoutId={`lang-pill-${pillId}`}
                  transition={spring}
                  className="absolute inset-0 rounded-lg bg-emerald-500"
                />
              )}
              <span className="relative">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
