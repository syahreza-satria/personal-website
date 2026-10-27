"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "./LanguageToggle";
import DrawRule from "./DrawRule";
import { RESUME_URL, socialLinks } from "./nav-items";

const linkCls = "inline-flex items-center min-h-11 hover:underline underline-offset-4";

export default function Footer() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="mt-24 pb-12 text-[15px] font-medium">
      <DrawRule />
      <div className="pt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <nav aria-label={t("Social")} className="flex flex-wrap gap-x-5">
          {socialLinks.map(({ name, url }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={linkCls}>
              {name}
            </a>
          ))}
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
            {t("CV ↗")}
          </a>
        </nav>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-muted">Bandung, Indonesia</span>
          <LanguageToggle />
          {/* Login lives here now that the dashboard top bar is gone; it also serves guestbook visitors */}
          {!loading &&
            (user ? (
              <span className="inline-flex items-center gap-3 text-sm text-muted">
                <span className="max-w-48 truncate">
                  {user.user_metadata?.full_name || user.email}
                  {isAdmin && ` · ${t("Admin")}`}
                </span>
                <button type="button" onClick={signOut} className={`${linkCls} text-ink cursor-pointer`}>
                  {t("Logout")}
                </button>
              </span>
            ) : (
              <button type="button" onClick={signInWithGoogle} className={`${linkCls} text-sm text-muted hover:text-ink cursor-pointer`}>
                {t("Login")}
              </button>
            ))}
        </div>
      </div>
    </footer>
  );
}
