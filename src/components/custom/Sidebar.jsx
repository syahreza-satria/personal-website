"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { spring } from "@/constants/animation";
import { PiDownloadBold, PiSignInBold, PiSignOutBold } from "react-icons/pi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import RotatingText from "@/components/RotatingText";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "./LanguageToggle";
import { navSections, allNavItems, isPathActive, RESUME_URL } from "./nav-items";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-black border-r border-neutral-900">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-1 px-5 py-6 border-b border-neutral-900 shrink-0">
          <Link href="/" className="flex flex-col items-center gap-2.5 group text-center">
            <Image src="/images/brand-logo.png" width={72} height={72} alt="Syahreza Satria" className="size-[72px] rounded-2xl border-2 border-emerald-500/40 object-cover transition-colors group-hover:border-emerald-400" loading="eager" />
            <span className="flex items-center justify-center gap-1.5 text-base font-extrabold text-white tracking-tight">
              SYAHREZA SATRIA
              <RiVerifiedBadgeFill className="size-4 text-emerald-400 shrink-0" />
            </span>
          </Link>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <RotatingText
              texts={["Web Developer", "UI/UX Designer", "Content Creator", "Graphic Designer", "Gamer"]}
              mainClassName="text-xs text-emerald-400 font-semibold"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={5000}
              splitBy="words"
              auto
              loop
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-600">{t(section.label)}</p>
              {section.items.map(({ name, path, icon: Icon }) => {
                const active = isPathActive(pathname, path);
                return (
                  <Link
                    key={path}
                    href={path}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${active ? "text-emerald-400" : "text-neutral-400 hover:text-neutral-100"}`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active"
                        transition={spring}
                        className="absolute inset-0 rounded-lg bg-emerald-500/10 border-l-2 border-emerald-400"
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-lg bg-neutral-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    )}
                    <Icon className="relative size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="relative">{t(name)}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: resume + account */}
        <div className="shrink-0 border-t border-neutral-900 p-4 space-y-2.5">
          <LanguageToggle />
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold py-2.5 transition-colors">
            <PiDownloadBold className="size-4" />
            <span>{t("Download CV")}</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} width={28} height={28} className="size-7 rounded-full" alt="Avatar" unoptimized />
                ) : (
                  <div className="size-7 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">{user.email?.[0]}</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-neutral-200 truncate">{user.user_metadata?.full_name || user.email}</span>
                  <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">{isAdmin ? t("Admin") : t("User")}</span>
                </div>
              </div>
              <button onClick={signOut} aria-label={t("Logout")} className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                <PiSignOutBold className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-neutral-800 hover:border-emerald-500/40 hover:bg-neutral-900 text-neutral-200 text-xs font-medium py-2.5 transition-colors cursor-pointer"
            >
              <PiSignInBold className="size-4" />
              <span>{t("Login with Google")}</span>
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM DOCK --- */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex lg:hidden bg-black/90 backdrop-blur-xl border border-neutral-800 rounded-full p-1.5 shadow-2xl items-center gap-0.5 max-w-[94vw] overflow-x-auto">
        {allNavItems.map(({ name, path, icon: Icon }) => {
          const active = isPathActive(pathname, path);
          return (
            <Link
              key={path}
              href={path}
              aria-label={t(name)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap shrink-0 transition-colors duration-200 ${
                active ? "text-emerald-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-active"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                />
              )}
              <Icon className="relative size-4" />
              {active && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={spring}
                  className="relative overflow-hidden text-xs font-semibold"
                >
                  {t(name)}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
