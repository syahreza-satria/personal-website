"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiUserBold,
  PiCodeBold,
  PiPaintBrushBold,
  PiSparkleBold,
  PiGraduationCapBold,
  PiBriefcaseBold,
  PiCalendarBold,
  PiMapPinBold,
  PiCheckCircleBold,
  PiPlusBold,
} from "react-icons/pi";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/custom/Badge";
import { skillset } from "@/constants/skills";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import ExperienceCard from "@/components/custom/ExperienceCard";
import EducationCard from "@/components/custom/EducationCard";
import CrudModal from "@/components/custom/CrudModal";
import { experienceFields, educationFields } from "@/constants/forms";
import { useLanguage } from "@/hooks/useLanguage";
import { parent, child } from "@/constants/animation";

const fallbackExperiences = [
  {
    id: "1",
    role: "Full-Stack Web Developer & UI Designer",
    company: "Freelance & Independent Digital Projects",
    location: "Bandung, Indonesia",
    startDate: "2024-01-01",
    endDate: null,
    type: "Full-time",
    setup: "Remote / Hybrid",
    roleType: "hybrid",
    badgeLabel: "Hybrid Role",
    responsibilities: [
      "Architected modern responsive web applications using React, Next.js, Laravel, and Tailwind CSS.",
      "Designed intuitive UI/UX mockups, design systems, and wireframes in Figma.",
      "Optimized system performance, database schemas, and RESTful API endpoints.",
    ],
  },
  {
    id: "2",
    role: "Lead IT & Systems Specialist",
    company: "Technology & Infrastructure Solutions",
    location: "Bandung, Indonesia",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    type: "Full-time",
    setup: "Onsite",
    roleType: "dev",
    badgeLabel: "Developer Focus",
    responsibilities: [
      "Managed IT operations, network setups, and web platform maintenance.",
      "Supervised technical implementation teams and optimized internal workflow automation.",
    ],
  },
  {
    id: "3",
    role: "Digital Content & Stream Media Specialist",
    company: "Syahreza Creative Studio",
    location: "Bandung, Indonesia",
    startDate: "2022-06-01",
    endDate: null,
    type: "Part-time",
    setup: "Remote",
    roleType: "creative",
    badgeLabel: "Creative Focus",
    responsibilities: [
      "Produced technical video content and streaming media graphics.",
      "Designed visual brand overlays, thumbnails, and digital content packages.",
    ],
  },
];

const fallbackEducations = [
  {
    id: "1",
    school: "Informational Technology & Computer Science",
    degree: "Bachelor Degree",
    major: "Software Engineering & Web Technologies",
    startDate: "2020-08-01",
    endDate: "2024-06-01",
    description:
      "Focused on Web Engineering, System Architecture, Object-Oriented Programming, and UI/UX Interface Design principles.",
  },
];

// "1 yr 3 mos" style label, stored in experiences.duration so the cards can show it.
const formatDuration = (start, end) => {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date();
  if (isNaN(from) || isNaN(to)) return null;
  const total = Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1);
  const years = Math.floor(total / 12);
  const months = total % 12;
  return [years && `${years} yr${years > 1 ? "s" : ""}`, months && `${months} mo${months > 1 ? "s" : ""}`]
    .filter(Boolean)
    .join(" ");
};

const AdminActions = ({ onEdit, onDelete }) => {
  const { t } = useLanguage();
  return (
  <div className="flex gap-1.5 shrink-0">
    <button
      onClick={onEdit}
      className="p-1.5 rounded-lg bg-black/60 border border-neutral-800 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
      title={t("Edit")}
    >
      <Pencil className="size-3.5" />
    </button>
    <button
      onClick={onDelete}
      className="p-1.5 rounded-lg bg-black/60 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
      title={t("Delete")}
    >
      <Trash2 className="size-3.5" />
    </button>
  </div>
  );
};

const AddButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
  >
    <Plus className="size-3.5" />
    <span>{label}</span>
  </button>
);

export default function AboutPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [experiences, setExperiences] = useState(fallbackExperiences);
  const [educations, setEducations] = useState(fallbackEducations);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("experience");
  const [editingItem, setEditingItem] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Fallback rows are static placeholders; only rows that came from Supabase can be edited.
  const [expFromDb, setExpFromDb] = useState(false);
  const [eduFromDb, setEduFromDb] = useState(false);

  const categories = ["ALL", ...new Set(skillset.map((skill) => skill.category))];

  const filteredSkills =
    activeFilter === "ALL"
      ? skillset
      : skillset.filter((skill) => skill.category === activeFilter);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [expResponse, eduResponse] = await Promise.all([
          supabase
            .from("experiences")
            .select("*")
            .order("start_date", { ascending: false }),
          supabase.from("educations").select("*").order("id", { ascending: true }),
        ]);

        if (expResponse.data && expResponse.data.length > 0) {
          const formattedExp = expResponse.data.map((item) => ({
            ...item,
            startDate: item.start_date,
            endDate: item.end_date,
            roleType:
              item.type?.toLowerCase().includes("design") ||
              item.role?.toLowerCase().includes("creative") ||
              item.role?.toLowerCase().includes("content")
                ? "creative"
                : item.role?.toLowerCase().includes("designer") &&
                  item.role?.toLowerCase().includes("developer")
                ? "hybrid"
                : "dev",
          }));
          setExperiences(formattedExp);
          setExpFromDb(true);
        }

        if (eduResponse.data && eduResponse.data.length > 0) {
          const formattedEdu = eduResponse.data.map((item) => ({
            ...item,
            startDate: item.start_date,
            endDate: item.end_date,
          }));
          setEducations(formattedEdu);
          setEduFromDb(true);
        }
      } catch (err) {
        // Fallback static data
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, [reloadKey]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const tableFor = (type) => (type === "experience" ? "experiences" : "educations");

  const handleDelete = async (type, id) => {
    if (!confirm(t("Are you sure you want to delete this entry?"))) return;
    const { error } = await supabase.from(tableFor(type)).delete().eq("id", id);
    if (error) {
      alert(t("Error deleting: ") + error.message);
      return;
    }
    if (type === "experience") setExpFromDb(false);
    else setEduFromDb(false);
    setReloadKey((k) => k + 1);
  };

  const handleSave = async (formData) => {
    const table = tableFor(modalType);
    const common = {
      location: formData.location || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      logo: formData.logo || null,
    };
    const payload =
      modalType === "experience"
        ? {
            ...common,
            role: formData.role,
            company: formData.company,
            type: formData.type,
            setup: formData.setup,
            responsibilities: formData.responsibilities || [],
            duration: formatDuration(formData.start_date, formData.end_date),
          }
        : {
            ...common,
            school: formData.school,
            degree: formData.degree,
            major: formData.major || null,
            gpa: formData.gpa === null || formData.gpa === "" ? null : Number(formData.gpa),
          };

    const query = editingItem
      ? supabase.from(table).update(payload).eq("id", editingItem.id)
      : supabase.from(table).insert([payload]);
    const { error } = await query;
    if (error) throw error;
    setReloadKey((k) => k + 1);
  };

  return (
    <motion.div variants={parent} initial="hidden" animate="show" className="space-y-12 sm:space-y-16 pb-12">
      {/* Header */}
      <motion.section variants={child} className="space-y-3 pt-4 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2">
          <Badge type="hybrid" label={t("About Me")} size="sm" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{t("Full-Stack Developer &")}<span className="text-emerald-400">{t("UI/UX Engineer")}</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">{t("I am Syahreza Satria, a Computer Science graduate based in Bandung, building production-ready web platforms with React, Next.js, Laravel, and Tailwind CSS.")}</p>
      </motion.section>

      {/* Professional Summary */}
      <motion.section variants={child} className="text-sm sm:text-base text-neutral-300 leading-relaxed">
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PiUserBold className="size-5 text-emerald-400" />
            <span>{t("Professional Summary")}</span>
          </h2>
          <p>{t("Computer Science graduate with a strong track record in full-stack web development and UI/UX engineering. Experienced in leading development teams and executing end-to-end redesigns for core web applications using React, Next.js, Laravel, and Tailwind CSS.")}</p>
          <p>{t("Adept at translating complex stakeholder requirements into high-performing digital solutions and driving cross-functional projects to on-time deployment. My portfolio demonstrates robust technical capabilities through production-ready platforms featuring automated workflows and API-driven architectures.")}</p>
        </div>
      </motion.section>

      {/* What I Bring */}
      <motion.section variants={child} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/30 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-neutral-100 flex items-center gap-2">
              <PiCodeBold className="size-5 text-emerald-400" />
              <span>{t("Full-Stack Development")}</span>
            </h3>
            <Badge type="dev" label={t("Developer")} size="sm" showIcon={false} />
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">{t("End-to-end web applications with React, Next.js, and Laravel, backed by API-driven architectures and automated workflows.")}</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/30 border border-lime-500/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-neutral-100 flex items-center gap-2">
              <PiPaintBrushBold className="size-5 text-lime-400" />
              <span>{t("UI/UX Engineering")}</span>
            </h3>
            <Badge type="creative" label={t("Design")} size="sm" showIcon={false} />
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">{t("Leading end-to-end redesigns of core web applications, from Figma prototypes to polished Tailwind CSS interfaces.")}</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-neutral-100 flex items-center gap-2">
              <PiSparkleBold className="size-5 text-emerald-400" />
              <span>{t("Team & Delivery")}</span>
            </h3>
            <Badge type="hybrid" label={t("Leadership")} size="sm" showIcon={false} />
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">{t("Leading development teams, translating stakeholder requirements into solutions, and driving cross-functional projects to on-time deployment.")}</p>
        </div>
      </motion.section>

      {/* Capabilities Matrix */}
      <motion.section variants={child} className="space-y-6">
        <div className="flex flex-col gap-1 border-l-2 border-emerald-500/80 pl-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-mono">{t("Capabilities")}</h2>
          <p className="text-xl sm:text-2xl font-bold text-white">{t("Skillset & Technology Stack")}</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = activeFilter === category;
            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                type="button"
                className={`py-1.5 px-3 text-xs rounded-full border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                    : "bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                {category === "ALL" ? t("ALL") : category}
              </button>
            );
          })}
        </div>

        {/* Skill Tags */}
        <motion.div layout className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id || skill.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 border border-neutral-800 bg-neutral-900/60 py-1.5 px-3 rounded-xl hover:-translate-y-0.5 hover:border-neutral-700 transition-all text-xs font-medium text-neutral-200"
              >
                {skill.icon}
                <span>{skill.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      {/* --- CAREER & EXPERIENCE TIMELINE (INTEGRATED HERE) --- */}
      <motion.section variants={child} id="experience" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1 border-l-2 border-green-500/80 pl-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-mono">{t("Career Trajectory")}</h2>
            <p className="text-xl sm:text-2xl font-bold text-white">{t("Work Experience & Roles")}</p>
          </div>
          {isAdmin && <AddButton label={t("Add Experience")} onClick={() => openModal("experience")} />}
        </div>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-800">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="relative pl-10 p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 shadow-sm space-y-3"
            >
              {/* Timeline Indicator Dot */}
              <div className="absolute left-2.5 top-6 size-3.5 rounded-full bg-neutral-950 border-2 border-emerald-400" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                  <PiCalendarBold className="size-3.5" />
                  <span>
                    {exp.startDate
                      ? new Date(exp.startDate).getFullYear()
                      : ""}{" "}
                    — {exp.endDate ? new Date(exp.endDate).getFullYear() : t("Present")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    type={exp.roleType || "dev"}
                    label={t(exp.badgeLabel || exp.type || "Full-time")}
                    size="sm"
                  />
                  {isAdmin && expFromDb && (
                    <AdminActions
                      onEdit={() => openModal("experience", exp)}
                      onDelete={() => handleDelete("experience", exp.id)}
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {t(exp.role)}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                  <span className="font-medium text-neutral-300">
                    {t(exp.company)}
                  </span>
                  {exp.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <PiMapPinBold className="size-3" />
                        {exp.location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-neutral-800/60 text-xs sm:text-sm text-neutral-300">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <PiCheckCircleBold className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t(resp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Education Background */}
      <motion.section variants={child} className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1 border-l-2 border-lime-500/80 pl-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-mono">{t("Academic Background")}</h2>
            <p className="text-xl sm:text-2xl font-bold text-white">{t("Education & Learning")}</p>
          </div>
          {isAdmin && <AddButton label={t("Add Education")} onClick={() => openModal("education")} />}
        </div>

        <div className="space-y-4">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PiGraduationCapBold className="size-5 text-lime-400" />
                  <h3 className="font-bold text-neutral-100">
                    {t(edu.school || "Informational Technology & Computer Science")}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  {t(edu.degree)} — {t(edu.major || edu.description)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge type="dev" label={t("Academic Degree")} size="sm" />
                {isAdmin && eduFromDb && (
                  <AdminActions
                    onEdit={() => openModal("education", edu)}
                    onDelete={() => handleDelete("education", edu.id)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? "Edit" : "Add"} ${modalType === "experience" ? "Work Experience" : "Education"}`}
        subtitle={
          modalType === "experience"
            ? "Shown in the Career Trajectory timeline on the About page."
            : "Shown in the Education & Learning section on the About page."
        }
        onSubmit={handleSave}
        initialData={editingItem}
        fields={modalType === "experience" ? experienceFields : educationFields}
        submitLabel={editingItem ? "Save Changes" : modalType === "experience" ? "Add Experience" : "Add Education"}
      />
    </motion.div>
  );
}
