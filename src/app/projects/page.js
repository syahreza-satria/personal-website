"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiProjectorScreenChartBold,
  PiCodeBold,
  PiPaintBrushBold,
  PiSparkleBold,
  PiArrowSquareOutBold,
  PiGithubLogoBold,
  PiArrowRightBold,
  PiPlusBold,
  PiCalendarBold,
  PiUserBold,
  PiMagnifyingGlassBold,
  PiPencilSimpleBold,
  PiTrashBold,
  PiImageBold,
} from "react-icons/pi";
import Badge from "@/components/custom/Badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

const fallbackProjects = [
  {
    id: "1",
    title: "Personal Branding & Portfolio Platform",
    type: "hybrid",
    category: "Full-Stack & UI/UX Design",
    description:
      "A minimalist, high-performance personal branding website built with Next.js App Router, Tailwind CSS v4, and DaisyUI. Enforces a strict max-w-4xl layout constraint, high-contrast typography, and color-coded visual badges.",
    techstack: ["Next.js 16", "React 19", "Tailwind CSS", "DaisyUI", "Framer Motion"],
    status: "Live",
    image: "/images/brand-logo.png",
    github: "https://github.com/syahreza-satria/personal-website",
    demo_link: "https://syahreza-satria.xyz",
    role: "Full-Stack Engineer & Lead UI/UX Designer",
    features: [
      "Mobile-first responsive layout constrained strictly to max-w-4xl",
      "Color-coded visual badge system (Emerald for Dev, Purple for Creative, Gradient for Hybrid)",
      "Integrated Zen dark theme with DaisyUI component styling",
      "Multi-page architecture across Home, About, Projects, Experience, Gears, and Contact",
    ],
    gallery: [],
    project_date: "2024-08-01",
  },
  {
    id: "2",
    title: "Full-Stack Enterprise Management System",
    type: "dev",
    category: "Web Application",
    description:
      "Scalable enterprise web application featuring dynamic CRUD capabilities, database schema optimization, secure authentication, and REST API integrations.",
    techstack: ["Laravel", "React", "Supabase", "Tailwind CSS", "PostgreSQL"],
    status: "Completed",
    image: "",
    github: "https://github.com/syahreza-satria",
    demo_link: "#",
    role: "Lead Full-Stack Developer",
    features: [
      "Dynamic CRUD management modals with real-time state synchronization",
      "Custom authentication provider integration and OAuth security",
      "Optimized database indexing and schema performance",
    ],
    gallery: [],
    project_date: "2024-05-15",
  },
  {
    id: "3",
    title: "Digital Media & Stream Production System",
    type: "creative",
    category: "Digital Media & Design System",
    description:
      "Complete visual identity package including custom animated overlays, channel branding systems, stream broadcast layouts, and video production assets.",
    techstack: ["Figma", "Adobe Photoshop", "OBS Studio", "Content Strategy"],
    status: "Live",
    image: "",
    github: "#",
    demo_link: "https://youtube.com/@syahrezasatria",
    role: "Digital Media Creator & UI Designer",
    features: [
      "Custom animated broadcast overlay scenes and alerts",
      "Cohesive brand color tokens and typography system",
      "Multi-platform video asset export pipelines",
    ],
    gallery: [],
    project_date: "2024-03-10",
  },
  {
    id: "4",
    title: "Interactive Web Component Design System",
    type: "hybrid",
    category: "Design System & UI Engineering",
    description:
      "A modular, reusable React component library built with accessibility standards, smooth micro-interactions, and high contrast dark theme design tokens.",
    techstack: ["React", "Tailwind CSS", "Radix UI", "Framer Motion"],
    status: "Completed",
    image: "",
    github: "https://github.com/syahreza-satria",
    demo_link: "#",
    role: "UI Engineer & Component Architect",
    features: [
      "Accessible WAI-ARIA compliant dialogs and dropdown menus",
      "Framer Motion layout transitions and spring physics",
    ],
    gallery: [],
    project_date: "2023-11-20",
  },
];

const getStatusConfig = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "live" || s === "true") {
    return {
      text: "Live",
      dotClass: "bg-emerald-500 ",
      badgeClass: "border-emerald-500/25 text-emerald-400 bg-emerald-500/10",
    };
  }
  if (s === "in progress" || s === "false" || s === "") {
    return {
      text: "In Progress",
      dotClass: "bg-green-500 ",
      badgeClass: "border-green-500/25 text-green-400 bg-green-500/10",
    };
  }
  if (s === "completed") {
    return {
      text: "Completed",
      dotClass: "bg-lime-400",
      badgeClass: "border-lime-500/25 text-lime-400 bg-lime-500/10",
    };
  }
  return {
    text: status || "Showcase",
    dotClass: "bg-neutral-500",
    badgeClass: "border-neutral-700 text-neutral-400 bg-neutral-900/60",
  };
};

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAdmin } = useAuth();

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
    const typeMatch =
      activeFilter === "ALL"
        ? true
        : activeFilter === "DEV"
        ? String(project.type).toLowerCase() === "dev" ||
          String(project.type).toLowerCase() === "developer"
        : activeFilter === "CREATIVE"
        ? String(project.type).toLowerCase() === "creative" ||
          String(project.type).toLowerCase() === "design"
        : activeFilter === "HYBRID"
        ? String(project.type).toLowerCase() === "hybrid" ||
          String(project.type).toLowerCase() === "cross"
        : true;

    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      project.role?.toLowerCase().includes(query) ||
      (Array.isArray(project.techstack) &&
        project.techstack.some((t) => String(t).toLowerCase().includes(query)));

    return typeMatch && searchMatch;
  });

  const filterTabs = [
    { label: "All Projects", key: "ALL" },
    { label: "Developer", key: "DEV" },
    { label: "Creative", key: "CREATIVE" },
    { label: "Hybrid", key: "HYBRID" },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* Page Header */}
      <section className="space-y-3 pt-4 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge type="hybrid" label={t("Featured Showcase")} size="sm" />
          </div>

          {isAdmin && (
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95 shrink-0"
            >
              <PiPlusBold className="size-4" />
              <span>{t("Add Project")}</span>
            </Link>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{t("Projects & Creative Showcase")}</h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">{t("Explore full-stack web applications, UI/UX designs, and digital media creations tagged by specialty focus.")}</p>
      </section>

      {/* Filter Tabs & Search Controls */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-neutral-800 text-white border border-neutral-700 shadow-md"
                    : "bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{t(tab.label)}</span>
                  {isActive && (
                    <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <PiMagnifyingGlassBold className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
          <input
            type="text"
            placeholder={t("Search projects...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>
      </section>

      {/* Project Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden h-72 flex flex-col justify-between"
            >
              <div className="w-full aspect-video bg-neutral-800/60" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-1/3 bg-neutral-800/60 rounded" />
                <div className="h-5 w-2/3 bg-neutral-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 bg-neutral-900/20 border border-neutral-800 border-dashed rounded-2xl">{t("No projects found matching your filter criteria.")}</div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              const stackList = Array.isArray(project.techstack)
                ? project.techstack
                : [];

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="group relative rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col justify-between overflow-hidden"
                >
                  {/* Admin Quick Controls */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <Link
                        href={`/projects/${project.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-all shadow-md backdrop-blur-md"
                        title={t("Edit Project")}
                      >
                        <PiPencilSimpleBold className="size-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-red-950/80 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-900 transition-all cursor-pointer shadow-md backdrop-blur-md"
                        title={t("Delete Project")}
                      >
                        <PiTrashBold className="size-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Project Image Banner (Edge to Edge, NO padding) */}
                  <Link
                    href={`/projects/${project.id}`}
                    className="block relative w-full aspect-video bg-neutral-950 border-b border-neutral-800/80 overflow-hidden group/img shrink-0"
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                        sizes="(max-w-4xl) 50vw, 100vw"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-1 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950">
                        <PiImageBold className="size-8 text-neutral-700" />
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Content Area (Has padding p-4 sm:p-5) */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-4">
                    <div className="space-y-3">
                      {/* Badges Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          type={project.type || "dev"}
                          label={String(project.type || "dev").toUpperCase()}
                          size="sm"
                        />

                        {project.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 font-medium truncate max-w-[130px]">
                            {t(project.category)}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
                        >
                          <span className={`size-1.5 rounded-full ${statusConfig.dotClass}`} />
                          {t(statusConfig.text)}
                        </span>
                      </div>

                      {/* Title & Role */}
                      <div className="space-y-1">
                        <Link href={`/projects/${project.id}`} className="block">
                          <h2 className="text-base sm:text-lg font-bold text-neutral-100 group-hover:text-white transition-colors">
                            {project.title}
                          </h2>
                        </Link>

                        {project.role && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <PiUserBold className="size-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{project.role}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Footer & Tech Stack */}
                    <div className="space-y-3 pt-3 border-t border-neutral-800/60">
                      {/* Tech Stack Pills */}
                      {stackList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {stackList.slice(0, 4).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800/70 text-neutral-300 border border-neutral-700/40 font-mono"
                            >
                              {tech}
                            </span>
                          ))}
                          {stackList.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800/40 text-neutral-500 font-mono">
                              +{stackList.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Links Bar */}
                      <div className="flex items-center justify-between gap-2 text-xs pt-1">
                        <div className="flex items-center gap-3">
                          {project.demo_link && project.demo_link !== "#" && (
                            <a
                              href={project.demo_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                            >
                              <span>{t("Live Demo")}</span>
                              <PiArrowSquareOutBold className="size-3.5" />
                            </a>
                          )}

                          {project.github && project.github !== "#" && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors font-medium"
                            >
                              <PiGithubLogoBold className="size-3.5" />
                              <span>{t("Source")}</span>
                            </a>
                          )}
                        </div>

                        <Link
                          href={`/projects/${project.id}`}
                          className="flex items-center gap-1 text-neutral-400 hover:text-emerald-400 font-medium transition-colors text-xs shrink-0"
                        >
                          <span>{t("Details")}</span>
                          <PiArrowRightBold className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
