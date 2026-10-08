"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PiCodeBold,
  PiPaintBrushBold,
  PiArrowRightBold,
  PiVideoBold,
  PiCheckCircleBold,
  PiEnvelopeSimpleBold,
  PiProjectorScreenChartBold,
  PiCertificateBold,
  PiLaptopBold,
  PiChatTextBold,
} from "react-icons/pi";
import { SiGithub } from "react-icons/si";
import Badge from "@/components/custom/Badge";
import GithubCalendar from "@/components/custom/GithubCalendar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { parent, child } from "@/constants/animation";

const pillars = [
  {
    type: "dev",
    Icon: PiCodeBold,
    badge: "Software & Web",
    title: "Developer Specialty",
    desc: "Building robust, scalable, and responsive web platforms with clean code standards and efficient system architecture.",
    points: [
      "Web Applications (React, Next.js, Laravel)",
      "Full-Stack Solutions & REST APIs",
      "Tailwind CSS & Component Architecture",
    ],
    iconCls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    hoverCls: "hover:border-emerald-500/40",
    checkCls: "text-emerald-400",
  },
  {
    type: "creative",
    Icon: PiPaintBrushBold,
    badge: "Design & Media",
    title: "Creative Specialty",
    desc: "Designing intuitive digital interfaces, creating cohesive branding visual identities, and producing tech media content.",
    points: [
      "UI/UX Interface & Design Systems (Figma)",
      "Digital Media & Graphic Branding",
      "Content Strategy & Video Production",
    ],
    iconCls: "bg-lime-500/10 text-lime-300 border-lime-500/20",
    hoverCls: "hover:border-lime-500/40",
    checkCls: "text-lime-400",
  },
];

const statTiles = [
  { key: "projects", label: "Projects", href: "/projects", icon: PiProjectorScreenChartBold },
  { key: "achievements", label: "Achievements", href: "/achievement", icon: PiCertificateBold },
  { key: "gears", label: "Gears", href: "/gears", icon: PiLaptopBold },
  { key: "guestbook", label: "Guestbook", href: "/guestbook", icon: PiChatTextBold },
];

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-neutral-900/60 border border-neutral-800 ${className}`}>{children}</div>
);

export default function Home() {
  const { t } = useLanguage();
  // Live row counts for the stat tiles; "—" is shown until (or if) a count can't be loaded.
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        statTiles.map(async ({ key }) => {
          try {
            const { count, error } = await supabase
              .from(key)
              .select("*", { count: "exact", head: true });
            return [key, error ? null : count];
          } catch {
            return [key, null];
          }
        })
      );
      if (!cancelled) setCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div variants={parent} initial="hidden" animate="show" className="space-y-4 pb-8">
      {/* --- OVERVIEW: HERO + STATS --- */}
      <motion.section variants={child} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel className="xl:col-span-2 relative overflow-hidden p-6 sm:p-8 flex flex-col gap-5">
          <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-2">
            <Badge type="hybrid" label={t("Where Code Meets Creativity")} size="md" />
            <span className="text-xs text-neutral-500 font-mono">• Bandung, Indonesia</span>
          </div>

          <div className="relative space-y-3 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
              Syahreza Satria
              <span className="block text-xl sm:text-2xl font-medium text-neutral-400 mt-2">{t("Hybrid Developer &")}<span className="text-emerald-400 font-semibold">{t("Creative Specialist")}</span>
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">{t("I craft high-performance web applications with clean architecture, while designing intuitive UI/UX and producing engaging digital media content.")}</p>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <span>{t("View Projects")}</span>
              <PiArrowRightBold className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-black border border-neutral-800 hover:border-emerald-500/40 text-neutral-200 font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <PiEnvelopeSimpleBold className="size-4 text-emerald-400" />
              <span>{t("Let's Connect")}</span>
            </Link>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-4">
          {statTiles.map(({ key, label, href, icon: Icon }) => (
            <Link key={key} href={href} className="group">
              <Panel className="h-full p-4 flex flex-col justify-between gap-4 transition-colors group-hover:border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Icon className="size-4" />
                  </span>
                  <PiArrowRightBold className="size-3.5 text-neutral-600 transition-all group-hover:text-emerald-400 group-hover:translate-x-0.5" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">
                    {counts[key] ?? "—"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1.5">{t(label)}</p>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* --- CORE PILLARS --- */}
      <motion.section variants={child} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map(({ type, Icon, badge, title, desc, points, iconCls, hoverCls, checkCls }) => (
          <Panel key={type} className={`p-5 sm:p-6 flex flex-col gap-4 transition-colors ${hoverCls}`}>
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border ${iconCls}`}>
                <Icon className="size-5" />
              </div>
              <Badge type={type} label={t(badge)} size="sm" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-neutral-100">{t(title)}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{t(desc)}</p>
            </div>
            <ul className="space-y-2 pt-3 border-t border-neutral-800 text-xs text-neutral-300 mt-auto">
              {points.map((pt) => (
                <li key={pt} className="flex items-center gap-2">
                  <PiCheckCircleBold className={`size-4 shrink-0 ${checkCls}`} />
                  <span>{t(pt)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </motion.section>

      {/* --- ACTIVITY + MEDIA --- */}
      <motion.section variants={child} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
            <SiGithub className="size-5 text-emerald-400" />
            <span>{t("GitHub Contribution Activity")}</span>
          </div>
          <p className="text-xs text-neutral-500">{t("Open source code & continuous development commitments.")}</p>
          <GithubCalendar username="syahreza-satria" />
        </Panel>

        <Panel className="p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
              <PiVideoBold className="size-5 text-emerald-400" />
              <span>{t("Digital Media & Content")}</span>
            </div>
            <Badge type="creative" label={t("Video Media")} size="sm" />
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-black">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/uN6TN7PmXmE?si=fo56jnavGzr6OuW_&amp;controls=1"
              title="Syahreza Satria Content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Panel>
      </motion.section>
    </motion.div>
  );
}
