"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { imageZoom } from "@/constants/animation";
import HeroTitle, { heroIntroDelay } from "@/components/custom/HeroTitle";
import Reveal, { RevealItem } from "@/components/custom/Reveal";
import MotionLink from "@/components/custom/MotionLink";
import SkillChip from "@/components/custom/SkillChip";
import { useFinePointer } from "@/hooks/useFinePointer";
import { skillset } from "@/constants/skills";
import { fallbackProjects, projectType, typeLabels } from "@/constants/projects";

const skillNames = [...new Set(skillset.map((s) => s.name))];

const typeTag = (type) => typeLabels[projectType(type)];

const pillCls = "inline-flex items-center min-h-13 px-6 rounded-full font-semibold text-base";

function Shot({ src, alt, sizes, className = "", tone = "surface", priority = false }) {
  return (
    <div className={`relative overflow-hidden ${tone === "ink" ? "bg-ink-line" : "bg-surface"} ${className}`}>
      {src ? (
        <motion.div variants={imageZoom} className="absolute inset-0">
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </motion.div>
      ) : (
        <span className={`absolute inset-0 flex items-center justify-center text-[13px] ${tone === "ink" ? "text-on-ink-subtle" : "text-subtle"}`}>{alt}</span>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const [projects, setProjects] = useState(null); // null while loading

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from("projects").select("id, title, description, image, type, category, techstack, project_date").order("project_date", { ascending: false, nullsFirst: false }).limit(4);
        if (error) throw error;
        if (!cancelled) setProjects(data?.length ? data : fallbackProjects.slice(0, 4));
      } catch {
        if (!cancelled) setProjects(fallbackProjects.slice(0, 4));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [featured, ...rest] = projects ?? [];
  const [introBefore, introAfter] = t("I'm {name}, a hybrid developer & creative specialist from Bandung. I build web apps, design their interfaces and make the media that tells their story.").split("{name}");

  const heroLine1 = t("Code");
  const heroLine2 = t("Creative.");
  // Card hover: zoom the image. initial/animate never change (keeps SSR markup stable); only
  // whileHover is dropped for reduced motion. Framer ignores touch for whileHover.
  const zoomProps = { initial: "rest", animate: "rest", whileHover: reduce ? undefined : "hover" };

  return (
    <div>
      {/* --- HERO --- */}
      <section className="flex flex-col gap-8 pt-10 sm:pt-16 pb-10">
        <HeroTitle line1={heroLine1} line2={heroLine2}>
          <Reveal delay={heroIntroDelay(heroLine1, heroLine2)} className="flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-[560px] text-[17px] sm:text-[20px] leading-normal">
              {introBefore}
              <strong className="font-semibold">Syahreza Satria</strong>
              {introAfter}
            </p>
            <a href="#work" className={`${pillCls} gap-2.5 bg-ink text-on-ink font-display font-bold text-[17px] sm:text-lg`}>
              {t("See the work ↓")}
            </a>
          </Reveal>
        </HeroTitle>
      </section>

      {/* --- SKILLS --- */}
      {/* Starts in view on desktop, so wait for the hero title instead of popping in under it */}
      <Reveal as="ul" delay={heroIntroDelay(heroLine1, heroLine2)} aria-label={t("Skills")} className="flex flex-wrap gap-2.5 pt-6 pb-18">
        {skillNames.map((name, i) => (
          <SkillChip key={name} name={name} index={i} magnetic={finePointer} />
        ))}
      </Reveal>

      {/* --- SELECTED WORK --- */}
      <section id="work" aria-labelledby="work-title" className="flex flex-col gap-6 pb-24 scroll-mt-6">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="work-title" className="font-display font-bold text-[40px] sm:text-[48px] leading-none tracking-[-0.03em]">
            {t("Selected work")}
          </h2>
          <Link href="/projects" className="inline-flex items-center min-h-11 font-semibold hover:underline underline-offset-4">
            {t("All projects →")}
          </Link>
        </Reveal>

        {!projects ? (
          <div aria-busy="true" className="flex flex-col gap-6">
            <div className="aspect-[21/9] rounded-panel bg-surface animate-pulse" />
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-card bg-surface animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {featured && (
              <Reveal>
                <MotionLink href={`/projects/${featured.id}`} data-cursor="view" {...zoomProps} className="group flex flex-col rounded-panel overflow-hidden bg-ink text-on-ink">
                  <Shot src={featured.image} alt={featured.title} sizes="(min-width: 1240px) 1200px, 100vw" tone="ink" priority className="aspect-[21/9]" />
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8 sm:py-7">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="font-display font-bold text-[28px] sm:text-[36px] leading-tight tracking-[-0.02em]">{featured.title}</span>
                      <span className="text-base text-on-ink-muted">{[featured.category, ...(featured.techstack ?? []).slice(0, 3)].filter(Boolean).join(" · ")}</span>
                    </div>
                    <span className="shrink-0 px-3.5 py-2 rounded-full bg-accent text-ink text-sm font-semibold">{t(typeTag(featured.type))}</span>
                  </div>
                </MotionLink>
              </Reveal>
            )}

            {rest.length > 0 && (
              <Reveal stagger className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
                {rest.map((p) => (
                  <RevealItem key={p.id}>
                    <MotionLink href={`/projects/${p.id}`} data-cursor="view" {...zoomProps} className="group flex flex-col gap-4">
                      <Shot src={p.image} alt={p.title} sizes="(min-width: 1240px) 400px, (min-width: 720px) 50vw, 100vw" className="aspect-[4/3] rounded-card" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-display font-bold text-2xl tracking-[-0.02em] group-hover:underline underline-offset-4">{p.title}</span>
                          <span className="text-[15px] leading-normal text-muted line-clamp-2">{p.description}</span>
                        </div>
                        <span className="shrink-0 px-3 py-1.5 rounded-full border-[1.5px] border-ink text-[13px] font-semibold whitespace-nowrap">{t(typeTag(p.type))}</span>
                      </div>
                    </MotionLink>
                  </RevealItem>
                ))}
              </Reveal>
            )}
          </>
        )}
      </section>

      {/* --- TWO SIDES --- */}
      <Reveal as="section" stagger className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] pb-24">
        <RevealItem className="flex flex-col gap-4 rounded-panel bg-surface p-8 sm:p-10">
          <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted">{t("Side A")}</span>
          <h2 className="font-display font-bold text-[40px] leading-none tracking-[-0.03em]">{t("Developer")}</h2>
          <p className="text-[17px] leading-relaxed text-muted">{t("Web applications with React, Next.js and Laravel. Full-stack solutions, REST APIs and component architecture with Tailwind CSS.")}</p>
        </RevealItem>
        <RevealItem data-surface="ink" className="flex flex-col gap-4 rounded-panel bg-ink text-on-ink p-8 sm:p-10">
          <span className="text-sm font-bold uppercase tracking-[0.08em] text-on-ink-subtle">{t("Side B")}</span>
          <h2 className="font-display font-bold text-[40px] leading-none tracking-[-0.03em]">{t("Creative")}</h2>
          <p className="text-[17px] leading-relaxed text-on-ink-muted">{t("UI/UX and design systems in Figma, graphic branding, content strategy and video production for tech media.")}</p>
          <a href="https://youtube.com/@syahrezasatria" target="_blank" rel="noopener noreferrer" className="inline-flex items-center self-start min-h-11 font-semibold text-accent hover:underline underline-offset-4">
            {t("Watch on YouTube →")}
          </a>
        </RevealItem>
      </Reveal>

      {/* --- CONTACT --- */}
      <Reveal as="section" aria-labelledby="contact-title" className="flex flex-col gap-7 rounded-block bg-accent text-ink px-6 py-14 sm:px-10 sm:py-16">
        <h2 id="contact-title" className="font-display font-extrabold text-[clamp(44px,8vw,112px)] leading-[0.9] tracking-[-0.045em]">
          {t("Let's make")}
          <br />
          {t("something.")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href="mailto:satriaeza221@gmail.com" className={`${pillCls} bg-ink text-on-ink break-all`}>
            contact syahreza satria alfath
          </a>
          <Link href="/guestbook" className={`${pillCls} border-2 border-ink hover:bg-ink hover:text-on-ink transition-colors`}>
            {t("Sign the guestbook")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
