"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PiCaretLeftBold, PiCaretRightBold, PiPencilSimpleBold } from "react-icons/pi";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop, modalPanel } from "@/constants/animation";
import Reveal, { RevealItem } from "@/components/custom/Reveal";
import DrawRule from "@/components/custom/DrawRule";
import { fallbackProjects, formatProjectDate, getStatusConfig, projectType, toList, typeLabels } from "@/constants/projects";

const hasLink = (url) => Boolean(url) && url !== "#";

const sectionTitle = "font-display font-bold text-[40px] leading-none tracking-[-0.03em]";

export default function ProjectDetailPage() {
  const { t, lang } = useLanguage();
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [nextProject, setNextProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      let current = null;
      let ordered = [];
      let failure = null;
      try {
        const [detail, list] = await Promise.all([
          supabase.from("projects").select("*").eq("id", id).maybeSingle(),
          supabase.from("projects").select("id, title, project_date").order("project_date", { ascending: false, nullsFirst: false }),
        ]);
        if (detail.error) throw detail.error;
        current = detail.data;
        ordered = list.data ?? [];
      } catch (err) {
        failure = err.message;
      }

      // Cards fall back to `fallbackProjects` only when the table is empty or unreachable; resolve those ids too.
      if (!current && (failure || ordered.length === 0)) {
        const fallback = fallbackProjects.find((p) => String(p.id) === String(id));
        if (fallback) {
          current = fallback;
          ordered = fallbackProjects;
          failure = null;
        }
      }

      if (cancelled) return;
      if (current) {
        setProject({ ...current, demo_link: current.demo_link || current.demoLink });
        const index = ordered.findIndex((p) => String(p.id) === String(current.id));
        setNextProject(index >= 0 ? (ordered[index + 1] ?? null) : null);
      }
      setError(failure);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-7 pt-10 pb-12">
        <div className="h-6 w-28 rounded-full bg-surface animate-pulse" />
        <div className="h-24 w-3/4 rounded-card bg-surface animate-pulse" />
        <div className="aspect-[16/8] rounded-[28px] bg-surface animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-start gap-6 pt-10 pb-12">
        <Link href="/projects" className="inline-flex items-center min-h-11 text-[15px] font-semibold hover:underline underline-offset-4">
          {t("← All work")}
        </Link>
        <h1 className="font-display font-extrabold text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-[-0.04em]">
          {t("Project not found")}
        </h1>
        {error && <p className="text-muted">{`${t("Error:")} ${error}`}</p>}
      </div>
    );
  }

  const status = getStatusConfig(project.status);
  const techstackList = toList(project.techstack);
  const featuresList = toList(project.features);
  const galleryList = toList(project.gallery);
  const date = formatProjectDate(project.project_date, lang);
  const showDemo = hasLink(project.demo_link);
  const showGithub = hasLink(project.github);

  const facts = [
    { label: "Role", value: project.role },
    { label: "Category", value: project.category && t(project.category) },
    { label: "Date", value: date },
  ].filter((f) => f.value);

  return (
    <article className="pb-8">
      {/* Title block */}
      <Reveal as="section" className="flex flex-col gap-7 pt-8 sm:pt-10 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/projects" className="inline-flex items-center min-h-11 text-[15px] font-semibold hover:underline underline-offset-4">
            {t("← All work")}
          </Link>
          {isAdmin && (
            <Link
              href={`/projects/${project.id}/edit`}
              className="inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold"
            >
              <PiPencilSimpleBold className="size-4" aria-hidden="true" />
              {t("Edit Project")}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full border-[1.5px] border-ink text-[13px] font-semibold">
            {t(typeLabels[projectType(project.type)])}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-[7px] rounded-full bg-surface text-[13px] font-semibold">
            <span aria-hidden="true" className={`size-2 rounded-full ${status.dot}`} />
            {t(status.text)}
          </span>
        </div>

        <h1 className="max-w-[1100px] font-display font-extrabold text-[clamp(48px,8vw,112px)] leading-[0.9] tracking-[-0.045em] break-words">
          {project.title}
        </h1>
      </Reveal>

      {/* Facts + links */}
      {(facts.length > 0 || showDemo || showGithub) && (
        <div>
          <DrawRule />
          <Reveal
            as="dl"
            className="grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
          >
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5 py-5 pr-5">
                <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{t(f.label)}</dt>
                <dd className="text-base font-medium">{f.value}</dd>
              </div>
            ))}
            {(showDemo || showGithub) && (
              <div className="py-5">
                <dt className="sr-only">{t("Links")}</dt>
                <dd className="flex flex-wrap items-center gap-2.5">
                  {showDemo && (
                    <a
                      href={project.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-12 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold"
                    >
                      {t("Live demo ↗")}
                    </a>
                  )}
                  {showGithub && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-12 px-5 rounded-full border-[1.5px] border-ink text-[15px] font-semibold hover:bg-ink hover:text-on-ink transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                </dd>
              </div>
            )}
          </Reveal>
          <DrawRule delay={0.1} />
        </div>
      )}

      {/* Cover */}
      <Reveal className="relative mt-10 mb-18 aspect-[16/8] rounded-[28px] overflow-hidden bg-ink">
        {project.image ? (
          <Image src={project.image} alt={project.title} fill priority sizes="(min-width: 1240px) 1200px, 100vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-on-ink-subtle">{t("No image")}</span>
        )}
      </Reveal>

      {/* Overview + features */}
      <section className="grid gap-12 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] pb-20">
        <div className="flex flex-col gap-5">
          <Reveal as="h2" className={sectionTitle}>
            {t("Overview")}
          </Reveal>
          <Reveal as="p" delay={0.1} className="text-[17px] sm:text-[19px] leading-[1.65] whitespace-pre-wrap">
            {project.description}
          </Reveal>
        </div>
        {featuresList.length > 0 && (
          <div className="flex flex-col gap-5">
            <Reveal as="h2" className={sectionTitle}>
              {t("Key features")}
            </Reveal>
            <div>
              <DrawRule weight="1.5" />
              <Reveal as="ol" stagger className="flex flex-col">
                {featuresList.map((feature, i) => (
                  <RevealItem
                    as="li"
                    key={i}
                    className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 py-4 border-b border-line text-base leading-normal"
                  >
                    <span aria-hidden="true" className="font-display font-bold text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{feature}</span>
                  </RevealItem>
                ))}
              </Reveal>
            </div>
          </div>
        )}
      </section>

      {/* Tech stack */}
      {techstackList.length > 0 && (
        <section className="flex flex-col gap-5 pb-20">
          <Reveal as="h2" className={sectionTitle}>
            {t("Built with")}
          </Reveal>
          <Reveal as="ul" delay={0.1} className="flex flex-wrap gap-2.5">
            {techstackList.map((tech, i) => (
              <li key={i} className="px-4 py-2.5 rounded-full border-[1.5px] border-ink text-[15px] font-medium">
                {tech}
              </li>
            ))}
          </Reveal>
        </section>
      )}

      {/* Gallery */}
      {galleryList.length > 0 && (
        <section className="flex flex-col gap-5 pb-24">
          <Reveal as="h2" className={sectionTitle}>
            {t("Gallery")}
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]">
            {galleryList.map((imgUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                aria-label={t("Open screenshot {n}", { n: index + 1 })}
                className="group relative aspect-[4/3] rounded-card overflow-hidden bg-surface cursor-zoom-in"
              >
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1240px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </Reveal>
        </section>
      )}

      {/* Next project */}
      {nextProject && (
        <Reveal>
          <Link
            href={`/projects/${nextProject.id}`}
            data-cursor="view"
            className="group flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-accent text-ink p-8 sm:p-10"
          >
            <span className="flex flex-col gap-2 min-w-0">
              <span className="text-sm font-semibold uppercase tracking-[0.08em]">{t("Next project")}</span>
              <span className="font-display font-extrabold text-[clamp(32px,5vw,64px)] leading-[0.95] tracking-[-0.04em] group-hover:underline underline-offset-[6px] decoration-[3px]">
                {nextProject.title}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-display font-extrabold text-[64px] leading-none transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Reveal>
      )}

      <AnimatePresence>
        {activeImageIndex !== null && (
          <GalleryLightbox images={galleryList} index={activeImageIndex} title={project.title} onChange={setActiveImageIndex} />
        )}
      </AnimatePresence>
    </article>
  );
}

// `onChange` is the state setter: an index pages, `null` closes. Keeping it the only callback keeps the effect below stable.
function GalleryLightbox({ images, index, title, onChange }) {
  const { t } = useLanguage();
  const closeRef = useRef(null);
  const count = images.length;
  const go = (step) => onChange((index + step + count) % count);
  const close = () => onChange(null);

  // Esc closes, arrow keys page through; lock page scroll while open.
  useEffect(() => {
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onChange(null);
      else if (e.key === "ArrowRight" && count > 1) onChange((i) => (i + 1) % count);
      else if (e.key === "ArrowLeft" && count > 1) onChange((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [count, onChange]);

  const navBtn =
    "inline-flex items-center justify-center size-12 rounded-full bg-surface text-ink hover:bg-accent transition-colors cursor-pointer";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("Gallery Preview")}
      data-surface="ink"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      <motion.div {...modalBackdrop} onClick={close} className="absolute inset-0 bg-ink/95 cursor-zoom-out" />

      <motion.div {...modalPanel} className="relative z-10 w-full max-w-5xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 text-on-ink">
          <span className="text-sm text-on-ink-muted">
            {index + 1} / {count}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="min-h-11 px-5 rounded-full bg-accent text-ink text-[15px] font-semibold cursor-pointer"
          >
            {t("Close")}
          </button>
        </div>

        <div className="relative w-full aspect-video rounded-card overflow-hidden bg-ink">
          <Image
            src={images[index]}
            alt={`${title} — ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-contain"
          />
        </div>

        {count > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label={t("Previous image")} className={navBtn}>
              <PiCaretLeftBold className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t("Next image")} className={navBtn}>
              <PiCaretRightBold className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
