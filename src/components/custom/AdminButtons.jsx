"use client";

import { PiPencilSimpleBold, PiPlusBold, PiTrashBold } from "react-icons/pi";
import { useLanguage } from "@/hooks/useLanguage";

// Admin-only CRUD controls shared by About, Achievement and Gears.
// `label` names the item so screen readers hear "Edit: <title>" rather than just "Edit".
export function AdminActions({ onEdit, onDelete, label, tone = "paper", className = "" }) {
  const { t } = useLanguage();
  const base = "inline-flex items-center justify-center size-11 rounded-full transition-colors cursor-pointer";
  const onInk = tone === "ink";
  return (
    <div className={`flex gap-1.5 shrink-0 ${className}`}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={label ? `${t("Edit")}: ${label}` : t("Edit")}
        className={`${base} ${onInk ? "bg-ink-line text-on-ink hover:bg-on-ink hover:text-ink" : "bg-surface text-ink hover:bg-ink hover:text-on-ink"}`}
      >
        <PiPencilSimpleBold className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={label ? `${t("Delete")}: ${label}` : t("Delete")}
        className={`${base} ${onInk ? "bg-ink-line text-on-ink" : "bg-surface text-ink"} hover:bg-destructive hover:text-white`}
      >
        <PiTrashBold className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold cursor-pointer shrink-0"
    >
      <PiPlusBold className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
