"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PiMagnifyingGlassBold, PiPencilSimpleBold, PiPlusBold, PiTrashBold } from "react-icons/pi";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { imageZoom, listItem } from "@/constants/animation";
import FilterPills from "@/components/custom/FilterPills";
import MotionLink from "@/components/custom/MotionLink";
import {
  fallbackProjects,
  getStatusConfig,
  projectType,
  projectYear,
  toList,
  typeLabels,
} from "@/constants/projects";

const filterTabs = [
  { label: "All", key: "ALL" },
  { label: "Developer", key: "DEV" },
  { label: "Creative", key: "CREATIVE" },
  { label: "Hybrid", key: "HYBRID" },
];

const adminBtn =
  "inline-flex items-center justify-center size-11 rounded-full bg-surface text-ink transition-colors cursor-pointer";

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useAuth();
  const reduce = useReducedMotion();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("project_date", { ascending: false, nullsFirst: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(fallbackProjects);
        }
      } catch (err) {
        setProjects(fallbackProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("Are you sure you want to delete this project?"))) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      alert(t("Error deleting project: ") + err.message);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const type = projectType(project.type);
    const typeMatch =
      activeFilter === "ALL" ||
      (activeFilter === "DEV" && type === "dev") ||
      (activeFilter === "CREATIVE" && type === "creative") ||
      (activeFilter === "HYBRID" && type === "hybrid");

    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      project.role?.toLowerCase().includes(query) ||
      toList(project.techstack).some((tech) => String(tech).toLowerCase().includes(query));

    return typeMatch && searchMatch;
  });

  return (
    <div className="pb-8">
      {/* Page Header */}
      <section className="flex flex-wrap items-end justify-between gap-6 pt-10 sm:pt-14 pb-8 border-b-2 border-ink">
        <h1 className="font-display font-extrabold text-[clamp(64px,12vw,168px)] leading-[0.86] tracking-[-0.05em]">
          {t("Work")}
          {!isLoading && (
            <sup className="align-top text-[0.28em] tracking-normal text-muted">({projects.length})</sup>
          )}
        </h1>
        <div className="flex flex-col items-start gap-4 max-w-[420px]">
          <p className="text-lg leading-normal">
            {t("Web apps, design systems and media — sorted by which side of me built them.")}
          </p>
          {isAdmin && (
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-ink text-on-ink text-[15px] font-semibold"
            >
              <PiPlusBold className="size-4" aria-hidden="true" />
              {t("Add Project")}
            </Link>
          )}
        </div>
      </section>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-7 pb-10">
        <FilterPills
          label={t("Filter by type")}
          value={activeFilter}
          onChange={setActiveFilter}
          options={filterTabs.map((tab) => ({ value: tab.key, label: t(tab.label) }))}
        />

        <label className="flex items-center gap-2.5 min-h-12 px-4.5 rounded-full bg-surface basis-[340px] grow sm:grow-0 focus-within:outline-2 focus-within:outline-ink focus-within:outline-offset-2">
          <PiMagnifyingGlassBold className="size-[18px] text-muted shrink-0" aria-hidden="true" />
          <span className="sr-only">{t("Search projects")}</span>
          <input
            type="search"
            placeholder={t("Search title, tech, category…")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 h-11 bg-transparent text-[15px] text-ink placeholder:text-subtle focus-visible:outline-none"
          />
        </label>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div aria-busy="true" className="grid gap-x-6 gap-y-10 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col gap-4">
              <div className="aspect-[16/10] rounded-card bg-surface animate-pulse" />
              <div className="h-4 w-1/3 rounded-full bg-surface animate-pulse" />
              <div className="h-7 w-2/3 rounded-full bg-surface animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <p className="py-12 text-center text-muted border-[1.5px] border-dashed border-line rounded-card">
          {t("No projects found matching your filter criteria.")}
        </p>
      ) : (
        <motion.div layout className="grid gap-x-6 gap-y-10 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const status = getStatusConfig(project.status);
              const tech = toList(project.techstack);
              const meta = [project.category, projectYear(project.project_date)].filter(Boolean).join(" · ");

              return (
                <motion.div key={project.id} layout {...listItem} className="relative">
                  <MotionLink
                    href={`/projects/${project.id}`}
                    data-cursor="view"
                    initial="rest"
                    animate="rest"
                    whileHover={reduce ? undefined : "hover"}
                    className="group flex flex-col gap-4"
                  >
                    <div className="relative aspect-[16/10] rounded-card overflow-hidden bg-surface">
                      {project.image ? (
                        <motion.div variants={imageZoom} className="absolute inset-0">
                          <Image
                            src={project.image}
                            alt=""
                            fill
                            sizes="(min-width: 1240px) 600px, (min-width: 760px) 50vw, 100vw"
                            priority={index < 2}
                            className="object-cover"
                          />
                        </motion.div>
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[13px] text-subtle">
                          {t("No image")}
                        </span>
                      )}
                      <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface text-ink text-[13px] font-semibold">
                        <span aria-hidden="true" className={`size-2 rounded-full ${status.dot}`} />
                        {t(status.text)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {meta && <span className="text-sm text-muted">{meta}</span>}
                        <span className="font-display font-bold text-[28px] leading-[1.1] tracking-[-0.02em] group-hover:underline underline-offset-4">
                          {project.title}
                        </span>
                        {tech.length > 0 && <span className="text-sm text-muted line-clamp-2">{tech.join(" · ")}</span>}
                      </div>
                      <span className="shrink-0 px-3 py-1.5 rounded-full border-[1.5px] border-ink text-[13px] font-semibold whitespace-nowrap">
                        {t(typeLabels[projectType(project.type)])}
                      </span>
                    </div>
                  </MotionLink>

                  {/* Admin controls sit beside the link, never inside it */}
                  {isAdmin && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                      <Link
                        href={`/projects/${project.id}/edit`}
                        aria-label={`${t("Edit Project")}: ${project.title}`}
                        className={`${adminBtn} hover:bg-ink hover:text-on-ink`}
                      >
                        <PiPencilSimpleBold className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, project.id)}
                        aria-label={`${t("Delete Project")}: ${project.title}`}
                        className={`${adminBtn} hover:bg-destructive hover:text-white`}
                      >
                        <PiTrashBold className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
