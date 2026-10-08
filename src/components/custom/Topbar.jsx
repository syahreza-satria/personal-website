"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PiDownloadBold, PiSignInBold, PiSignOutBold, PiCaretRightBold } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "./LanguageToggle";
import { allNavItems, isPathActive, RESUME_URL } from "./nav-items";

export default function Topbar() {
  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { t } = useLanguage();

  const current = allNavItems.find((i) => i.path !== "/" && isPathActive(pathname, i.path));
  const title = current?.name ?? "Dashboard";
  const isDetail = current && pathname !== current.path;

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-black/80 backdrop-blur-xl border-b border-neutral-900">
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo only on mobile (sidebar is hidden there) */}
        <Link href="/" className="lg:hidden shrink-0">
          <Image src="/images/brand-logo.png" width={32} height={32} alt="Syahreza Satria" className="rounded-lg border border-emerald-500/40 object-cover" loading="eager" />
        </Link>

        <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-xs font-mono min-w-0">
          <Link href="/" className="text-neutral-500 hover:text-emerald-400 transition-colors">
            syahreza
          </Link>
          <PiCaretRightBold className="size-3 text-neutral-700 shrink-0" />
          <span className={`truncate ${isDetail ? "text-neutral-500" : "text-emerald-400"}`}>{t(title).toLowerCase()}</span>
          {isDetail && (
            <>
              <PiCaretRightBold className="size-3 text-neutral-700 shrink-0" />
              <span className="text-emerald-400 truncate">{t("detail")}</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile-only actions (on desktop these live in the sidebar) */}
        <LanguageToggle compact className="lg:hidden" />
        <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-2.5 py-1.5">
          <PiDownloadBold className="size-3.5" />
          <span>CV</span>
        </a>
        {!loading &&
          (user ? (
            <button onClick={signOut} className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 text-neutral-300 text-xs px-2.5 py-1.5 cursor-pointer">
              <PiSignOutBold className="size-3.5" />
              <span>{t("Logout")}</span>
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 text-neutral-300 text-xs px-2.5 py-1.5 cursor-pointer">
              <PiSignInBold className="size-3.5" />
              <span>{t("Login")}</span>
            </button>
          ))}
      </div>
    </header>
  );
}
