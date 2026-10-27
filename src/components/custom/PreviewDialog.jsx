"use client";

import { motion } from "framer-motion";
import { useDialog } from "@/hooks/useDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop, modalPanel } from "@/constants/animation";

// Item preview used by Achievement and Gears: media on one side, details on the other.
// Render it inside <AnimatePresence> and mount it only while open.
export default function PreviewDialog({ label, onClose, media, children }) {
  const { t } = useLanguage();
  const ref = useDialog(onClose);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <motion.div {...modalBackdrop} onClick={onClose} className="absolute inset-0 bg-ink/60" />

      <motion.div
        {...modalPanel}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row bg-paper rounded-t-panel sm:rounded-panel"
      >
        <div className="relative w-full md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[28rem] bg-surface shrink-0">{media}</div>
        <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col gap-6 md:overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="self-end min-h-11 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold cursor-pointer"
          >
            {t("Close")}
          </button>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
