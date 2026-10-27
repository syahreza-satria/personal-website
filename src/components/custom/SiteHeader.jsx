"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { child, menuCircle, menuLinks, modalBackdrop, parent } from "@/constants/animation";
import LanguageToggle from "./LanguageToggle";
import { navItems, isPathActive, RESUME_URL, socialLinks } from "./nav-items";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Wordmark({ pathname, className = "" }) {
  return (
    <Link
      href="/"
      aria-current={pathname === "/" ? "page" : undefined}
      className={`inline-flex items-center min-h-11 font-display font-extrabold text-[18px] lg:text-[20px] tracking-[-0.02em] ${className}`}
    >
      SYAHREZA®
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  // The menu remembers the route it was opened on, so navigating anywhere closes it.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === pathname;
  const menuButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const reduce = useReducedMotion();
  // Where the circular reveal grows from (Menu button centre) and how big it must get to cover the screen
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });

  const close = () => setOpenOn(null);

  const openMenu = () => {
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      // Distance to the farthest viewport corner, in px (mixing px and vmax would not interpolate)
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      setOrigin({ x, y, r });
    }
    setOpenOn(pathname);
  };

  const circle = (radius) => `circle(${radius}px at ${origin.x}px ${origin.y}px)`;
  const overlayMotion = reduce
    ? modalBackdrop
    : {
        initial: { clipPath: circle(0) },
        animate: { clipPath: circle(origin.r) },
        exit: { clipPath: circle(0) },
        transition: menuCircle,
      };

  // While open: lock page scroll, focus the dialog, close on Esc, keep Tab inside.
  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const dialog = dialogRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.querySelector(FOCUSABLE)?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenOn(null);
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      menuButton?.focus();
    };
  }, [open]);

  const desktopItems = navItems.filter((item) => item.path !== "/"); // the wordmark is the Home link

  return (
    <header className="flex items-center justify-between gap-4 py-4 lg:py-6">
      <Wordmark pathname={pathname} />

      {/* Desktop: pill row */}
      <nav aria-label={t("Main")} className="hidden lg:flex flex-wrap gap-1.5 text-[15px] font-medium">
        {desktopItems.map((item) => {
          const active = isPathActive(pathname, item.path);
          const isContact = item.path === "/contact";
          const tone = isContact
            ? `bg-accent text-ink ${active ? "ring-2 ring-ink ring-inset" : ""}`
            : active
              ? "bg-ink text-on-ink"
              : "bg-surface text-ink hover:bg-ink hover:text-on-ink";
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center min-h-11 px-4 rounded-full transition-colors duration-200 ${tone}`}
            >
              {t(item.name)}
            </Link>
          );
        })}
      </nav>

      {/* Mobile: menu button */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={openMenu}
        aria-expanded={open}
        aria-controls="site-menu"
        className="lg:hidden min-h-11 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold cursor-pointer"
      >
        {t("Menu")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dialogRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("Site menu")}
            data-surface="ink"
            {...overlayMotion}
            className="lg:hidden fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-on-ink px-5 pt-4 pb-7"
          >
            <div className="flex items-center justify-between gap-4">
              <Wordmark pathname={pathname} />
              <button
                type="button"
                onClick={close}
                aria-expanded="true"
                aria-controls="site-menu"
                className="min-h-11 px-5 rounded-full bg-accent text-ink text-[15px] font-semibold cursor-pointer"
              >
                {t("Close")}
              </button>
            </div>

            <motion.nav
              aria-label={t("Main")}
              variants={reduce ? parent : menuLinks}
              initial="hidden"
              animate="show"
              className="flex flex-col mt-10"
            >
              {navItems.map((item, i) => {
                const active = isPathActive(pathname, item.path);
                return (
                  <motion.div key={item.path} variants={child}>
                    <Link
                      href={item.path}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className="flex items-baseline justify-between gap-4 py-2.5 border-b border-ink-line"
                    >
                      <span
                        className={`font-display font-extrabold text-[40px] leading-none tracking-[-0.03em] ${active ? "text-accent" : ""}`}
                      >
                        {t(item.name)}
                      </span>
                      <span className="text-[13px] text-on-ink-subtle">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <div className="mt-auto pt-10 flex flex-col gap-4">
              <div className="flex gap-2.5">
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center min-h-12 rounded-full bg-accent text-ink text-[15px] font-semibold"
                >
                  {t("Download CV")}
                </a>
                <LanguageToggle tone="ink" />
              </div>
              <nav aria-label={t("Social")} className="flex flex-wrap justify-between gap-x-4 text-sm">
                {socialLinks.map(({ name, url }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-11 text-on-ink-muted hover:text-on-ink hover:underline"
                  >
                    {name}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
