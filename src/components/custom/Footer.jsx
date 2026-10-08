"use client";

import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  PiGithubLogoBold,
  PiLinkedinLogoBold,
  PiInstagramLogoBold,
  PiYoutubeLogoBold,
} from "react-icons/pi";

const socialLinks = [
  { name: "GitHub", url: "https://github.com/syahreza-satria", Icon: PiGithubLogoBold },
  { name: "LinkedIn", url: "https://linkedin.com/in/syahreza-satria", Icon: PiLinkedinLogoBold },
  { name: "YouTube", url: "https://youtube.com/@syahrezasatria", Icon: PiYoutubeLogoBold },
  { name: "Instagram", url: "https://instagram.com/syahreza.satria", Icon: PiInstagramLogoBold },
];

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-900 bg-black mt-12 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <p>© {currentYear} Syahreza Satria. {t("All rights reserved.")} · Bandung, Indonesia</p>
        <div className="flex items-center gap-1">
          {socialLinks.map(({ name, url, Icon }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="p-2 rounded-lg text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
