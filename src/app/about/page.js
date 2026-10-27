"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { skillset } from "@/constants/skills";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import CrudModal from "@/components/custom/CrudModal";
import GithubCalendar from "@/components/custom/GithubCalendar";
import { AdminActions, AddButton } from "@/components/custom/AdminButtons";
import { RESUME_URL } from "@/components/custom/nav-items";
import { experienceFields, educationFields } from "@/constants/forms";
import { useLanguage } from "@/hooks/useLanguage";
import Reveal, { RevealItem } from "@/components/custom/Reveal";
import DrawRule from "@/components/custom/DrawRule";

// Set to an image path (e.g. "/images/portrait.jpg") once a portrait exists; until then a placeholder shows.
const PORTRAIT_SRC = null;

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
    description: "Focused on Web Engineering, System Architecture, Object-Oriented Programming, and UI/UX Interface Design principles.",
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
  return [years && `${years} yr${years > 1 ? "s" : ""}`, months && `${months} mo${months > 1 ? "s" : ""}`].filter(Boolean).join(" ");
};

// Skills grouped by category, in the order they appear in skills.js
const toolkit = skillset.reduce((groups, skill) => {
  const group = groups.find((g) => g.category === skill.category);
  if (group) group.items.push(skill.name);
  else groups.push({ category: skill.category, items: [skill.name] });
  return groups;
}, []);

const yearOf = (date) => (date ? new Date(date).getFullYear() : "");

const sectionTitle = "font-display font-bold text-[40px] leading-none tracking-[-0.03em]";
const tagCls = "self-start px-3 py-1.5 rounded-full border-[1.5px] text-[13px] font-semibold";

export default function AboutPage() {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState(fallbackExperiences);
  const [educations, setEducations] = useState(fallbackEducations);
  const [isLoading, setIsLoading] = useState(true);

  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("experience");
  const [editingItem, setEditingItem] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Fallback rows are static placeholders; only rows that came from Supabase can be edited.
  const [expFromDb, setExpFromDb] = useState(false);
  const [eduFromDb, setEduFromDb] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [expResponse, eduResponse] = await Promise.all([
          supabase.from("experiences").select("*").order("start_date", { ascending: false }),
          supabase.from("educations").select("*").order("id", { ascending: true }),
        ]);

        if (expResponse.data && expResponse.data.length > 0) {
          const formattedExp = expResponse.data.map((item) => ({
            ...item,
            startDate: item.start_date,
            endDate: item.end_date,
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

    const query = editingItem ? supabase.from(table).update(payload).eq("id", editingItem.id) : supabase.from(table).insert([payload]);
    const { error } = await query;
    if (error) throw error;
    setReloadKey((k) => k + 1);
  };

  const period = (start, end) => `${yearOf(start)} — ${end ? yearOf(end) : t("Present")}`;

  return (
    <div className="pb-8">
      {/* Hero */}
      <Reveal as="section" className="grid gap-12 items-end grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] pt-10 sm:pt-14 pb-18">
        <div className="flex flex-col gap-7">
          <h1 className="font-display font-extrabold text-[clamp(64px,12vw,168px)] leading-[0.86] tracking-[-0.05em]">
            {t("About")}
            <span className="text-accent" aria-hidden="true">
              .
            </span>
          </h1>
          <p className="max-w-[520px] font-display font-bold text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em]">
            {t("Full-stack developer & UI/UX engineer, based in Bandung.")}
          </p>
        </div>
        <div className="relative w-full max-w-[384px] justify-self-end aspect-[4/5] rounded-[28px] overflow-hidden bg-ink">
          {PORTRAIT_SRC ? (
            <Image src={PORTRAIT_SRC} alt="Syahreza Satria" fill priority sizes="384px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-on-ink-subtle">{t("Portrait photo")}</span>
          )}
        </div>
      </Reveal>

      {/* Summary */}
      <DrawRule />
      <section className="grid gap-12 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] pt-12 pb-20">
        <Reveal as="h2" className={sectionTitle}>
          {t("Summary")}
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col items-start gap-4.5 text-[17px] sm:text-lg leading-[1.7]">
          <p>
            {t(
              "Computer Science graduate with a strong track record in full-stack web development and UI/UX engineering. Experienced in leading development teams and executing end-to-end redesigns for core web applications using React, Next.js, Laravel, and Tailwind CSS.",
            )}
          </p>
          <p>
            {t(
              "Adept at translating complex stakeholder requirements into high-performing digital solutions and driving cross-functional projects to on-time deployment. My portfolio demonstrates robust technical capabilities through production-ready platforms featuring automated workflows and API-driven architectures.",
            )}
          </p>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 font-semibold underline underline-offset-4"
          >
            {t("Download CV ↗")}
          </a>
        </Reveal>
      </section>

      {/* What I bring */}
      <Reveal as="section" stagger className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] pb-24">
        <RevealItem className="flex flex-col gap-3.5 rounded-panel bg-surface p-8">
          <span className={`${tagCls} border-ink`}>{t("Developer")}</span>
          <h3 className="font-display font-bold text-[28px] leading-tight tracking-[-0.02em]">{t("Full-Stack Development")}</h3>
          <p className="text-base leading-relaxed text-muted">
            {t("End-to-end web applications with React, Next.js, and Laravel, backed by API-driven architectures and automated workflows.")}
          </p>
        </RevealItem>
        <RevealItem data-surface="ink" className="flex flex-col gap-3.5 rounded-panel bg-ink text-on-ink p-8">
          <span className={`${tagCls} border-on-ink`}>{t("Design")}</span>
          <h3 className="font-display font-bold text-[28px] leading-tight tracking-[-0.02em]">{t("UI/UX Engineering")}</h3>
          <p className="text-base leading-relaxed text-on-ink-muted">
            {t("Leading end-to-end redesigns of core web applications, from Figma prototypes to polished Tailwind CSS interfaces.")}
          </p>
        </RevealItem>
        <RevealItem className="flex flex-col gap-3.5 rounded-panel bg-accent text-ink p-8">
          <span className={`${tagCls} border-ink`}>{t("Leadership")}</span>
          <h3 className="font-display font-bold text-[28px] leading-tight tracking-[-0.02em]">{t("Team & Delivery")}</h3>
          <p className="text-base leading-relaxed">
            {t(
              "Leading development teams, translating stakeholder requirements into solutions, and driving cross-functional projects to on-time deployment.",
            )}
          </p>
        </RevealItem>
      </Reveal>

      {/* Toolkit */}
      <section aria-labelledby="toolkit-title" className="flex flex-col pb-12">
        <Reveal as="h2" id="toolkit-title" className={`${sectionTitle} mb-5`}>
          {t("Toolkit")}
        </Reveal>
        <Reveal stagger>
          {toolkit.map((group) => (
            <RevealItem key={group.category}>
              <DrawRule weight="1.5" />
              <div className="grid gap-x-5 gap-y-3 items-start py-4.5 grid-cols-1 sm:grid-cols-[minmax(160px,220px)_minmax(0,1fr)]">
                <h3 className="font-display font-bold text-xl">{t(group.category)}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((name) => (
                    <li key={name} className="px-3.5 py-2 rounded-full bg-surface text-[15px] font-medium">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      {/* GitHub activity */}
      <Reveal as="section" aria-labelledby="github-title" className="flex flex-col gap-5 pb-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="github-title" className={sectionTitle}>
            {t("GitHub Contribution Activity")}
          </h2>
          <a
            href="https://github.com/syahreza-satria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 font-semibold hover:underline underline-offset-4"
          >
            @syahreza-satria ↗
          </a>
        </div>
        <GithubCalendar username="syahreza-satria" />
      </Reveal>

      {/* Experience + Education */}
      <section className="grid gap-12 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
        <div id="experience" className="flex flex-col scroll-mt-6">
          <Reveal className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className={sectionTitle}>{t("Experience")}</h2>
            {isAdmin && <AddButton label={t("Add Experience")} onClick={() => openModal("experience")} />}
          </Reveal>
          <Reveal stagger>
            {experiences.map((exp) => (
              <RevealItem as="article" key={exp.id}>
                <DrawRule weight="1.5" />
                <div className="flex flex-col gap-1.5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-sm font-semibold text-muted">{period(exp.startDate, exp.endDate)}</span>
                      <h3 className="font-display font-bold text-[22px] leading-tight">{t(exp.role)}</h3>
                      <span className="text-base text-muted">{[t(exp.company), exp.location].filter(Boolean).join(" · ")}</span>
                    </div>
                    {isAdmin && expFromDb && (
                      <AdminActions
                        label={exp.role}
                        onEdit={() => openModal("experience", exp)}
                        onDelete={() => handleDelete("experience", exp.id)}
                      />
                    )}
                  </div>
                  {exp.responsibilities?.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5 text-[15px] leading-relaxed">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2">
                          <span aria-hidden="true" className="font-bold">
                            —
                          </span>
                          <span>{t(resp)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>

        <div className="flex flex-col">
          <Reveal className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className={sectionTitle}>{t("Education")}</h2>
            {isAdmin && <AddButton label={t("Add Education")} onClick={() => openModal("education")} />}
          </Reveal>
          <Reveal stagger>
            {educations.map((edu) => (
              <RevealItem as="article" key={edu.id}>
                <DrawRule weight="1.5" />
                <div className="flex items-start justify-between gap-3 py-5">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-muted">{period(edu.startDate, edu.endDate)}</span>
                    <h3 className="font-display font-bold text-[22px] leading-tight">
                      {[t(edu.degree), edu.major && t(edu.major)].filter(Boolean).join(" — ")}
                    </h3>
                    <span className="text-base text-muted">{t(edu.school || "Informational Technology & Computer Science")}</span>
                  </div>
                  {isAdmin && eduFromDb && (
                    <AdminActions
                      label={edu.school}
                      onEdit={() => openModal("education", edu)}
                      onDelete={() => handleDelete("education", edu.id)}
                    />
                  )}
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? "Edit" : "Add"} ${modalType === "experience" ? "Work Experience" : "Education"}`}
        subtitle={
          modalType === "experience" ? "Shown in the Experience list on the About page." : "Shown in the Education list on the About page."
        }
        onSubmit={handleSave}
        initialData={editingItem}
        fields={modalType === "experience" ? experienceFields : educationFields}
        submitLabel={editingItem ? "Save Changes" : modalType === "experience" ? "Add Experience" : "Add Education"}
      />
    </div>
  );
}
