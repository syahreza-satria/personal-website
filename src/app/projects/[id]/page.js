"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Edit,
  User,
  Tag,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "@/components/custom/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop } from "@/constants/animation";

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

  if (s === "design phase") {
    return {
      text: "Design Phase",
      dotClass: "bg-lime-400 ",
      badgeClass: "border-lime-500/25 text-lime-300 bg-lime-500/10",
    };
  }

  return {
    text: status || "Showcase",
    dotClass: "bg-neutral-500",
    badgeClass: "border-neutral-700 text-neutral-400 bg-neutral-900/60",
  };
};

export default function ProjectDetailPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const nextImage = (e) => {
    e.stopPropagation();
    if (project?.gallery?.length) {
      setActiveImageIndex((prev) => (prev + 1) % project.gallery.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (project?.gallery?.length) {
      setActiveImageIndex(
        (prev) => (prev - 1 + project.gallery.length) % project.gallery.length
      );
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProjectDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setProject({
            ...data,
            demo_link: data.demo_link || data.demoLink,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4  pb-12">
        <div className="h-9 w-32 bg-neutral-800/60 rounded-xl" />
        <div className="w-full aspect-video bg-neutral-800/60 rounded-2xl" />
        <div className="h-8 w-2/3 bg-neutral-800/60 rounded-md" />
        <div className="h-4 w-full bg-neutral-800/40 rounded-md" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6 pt-4 pb-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-4 py-2 rounded-xl border border-neutral-800 transition-all text-xs font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>{t("Back to Projects")}</span>
        </Link>
        <div className="py-12 text-center text-red-400 bg-red-950/20 border border-red-900/30 rounded-2xl">
          {error ? `${t("Error:")} ${error}` : t("Project not found")}
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);
  const techstackList = Array.isArray(project.techstack)
    ? project.techstack
    : typeof project.techstack === "string"
    ? JSON.parse(project.techstack || "[]")
    : [];
  const featuresList = Array.isArray(project.features) ? project.features : [];
  const galleryList = Array.isArray(project.gallery) ? project.gallery : [];

  return (
    <div className="space-y-8 pt-4 pb-12">
      {/* Top Bar Navigation & Admin Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl border border-neutral-800 transition-all text-xs font-medium active:scale-95 shadow-sm"
        >
          <ArrowLeft className="size-4" />
          <span>{t("Back to Projects")}</span>
        </Link>

        {isAdmin && (
          <Link
            href={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95"
          >
            <Edit className="size-3.5" />
            <span>{t("Edit Project")}</span>
          </Link>
        )}
      </div>

      {/* Main Project Case Study Box */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl space-y-6">
        {/* Banner / Hero Image */}
        <div
          className="relative w-full aspect-video bg-neutral-950 border-b border-neutral-800/80 overflow-hidden flex items-center justify-center cursor-pointer group"
          onClick={() => project.image && setActiveImageIndex(0)}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-w-4xl) 100vw"
              priority
            />
          ) : (
            <div className="p-8 text-center text-neutral-600 flex flex-col items-center gap-2">
              <ExternalLink className="size-12 stroke-1 text-neutral-700" />
              <span className="text-xs">{t("No hero image uploaded")}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                type={project.type || "dev"}
                label={String(project.type || "dev").toUpperCase()}
                size="sm"
              />

              {project.category && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 font-medium">
                  {project.category}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
              >
                <span className={`size-1.5 rounded-full ${statusConfig.dotClass}`} />
                {t(statusConfig.text)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Metadata Bar (Role, Date, Created At) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-400">
              {project.role && (
                <div className="flex items-center gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850">
                  <User className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-mono">{t("Role")}</span>
                    <span className="text-neutral-200 font-semibold">{project.role}</span>
                  </div>
                </div>
              )}

              {project.project_date && (
                <div className="flex items-center gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850">
                  <Calendar className="size-4 text-lime-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-mono">{t("Release Date")}</span>
                    <span className="text-neutral-200 font-semibold">
                      {new Date(project.project_date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-neutral-800/80" />

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-400">{t("About the Project")}</h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Key Features */}
          {featuresList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-400">{t("Key Features & Technical Achievements")}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-neutral-300">
                {featuresList.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-850"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          {techstackList.length > 0 && (
            <div className="space-y-2 pt-2">
              <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-400">{t("Technologies Used")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {techstackList.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-neutral-950 text-neutral-200 border border-neutral-800 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery Screenshots */}
          {galleryList.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-400">
                Project Screenshots & Visual Gallery ({galleryList.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryList.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer"
                  >
                    <Image
                      src={imgUrl}
                      alt={`${project.title} Screenshot ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Links Bar */}
          <div className="pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-3">
            {project.demo_link && project.demo_link !== "#" && (
              <a
                href={project.demo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-neutral-950 font-semibold text-xs py-3 px-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-emerald-500/10"
              >
                <span>{t("Visit Live Project")}</span>
                <ArrowUpRight className="size-4" />
              </a>
            )}

            {project.github && project.github !== "#" && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-200 text-xs py-3 px-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <SiGithub className="size-4" />
                <span>{t("Explore Source Code")}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Gallery Lightbox */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...modalBackdrop}
            onClick={() => setActiveImageIndex(null)}
              className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md cursor-zoom-out"
            />

            <div className="relative max-w-4xl w-full flex items-center justify-center z-10">
              <button
                onClick={() => setActiveImageIndex(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="size-5" />
              </button>

              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <Image
                  src={
                    galleryList[activeImageIndex] ||
                    project.image ||
                    "/images/brand-logo.png"
                  }
                  alt={t("Gallery Preview")}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
