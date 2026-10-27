"use client";

import { useState } from "react";
import { Upload, Loader2, Plus, X, ChevronLeft, ChevronRight, Move } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { fieldCls, textareaCls, labelCls, uploadBtnCls, primaryBtnCls, secondaryBtnCls } from "./form-styles";

// `type` is the identity used by the projects filter and <Badge>: dev | creative | hybrid.
const projectTypes = [
  { value: "dev", label: "Developer (code / engineering)" },
  { value: "creative", label: "Creative (design / media)" },
  { value: "hybrid", label: "Hybrid (code + design)" },
];

// Everything that changes with the project type lives here.
const typeConfig = {
  dev: {
    categories: ["Full-Stack Web", "Frontend", "Backend / API", "Mobile App", "Desktop App", "Other"],
    statuses: ["In Progress", "Live", "Completed", "Maintenance", "Archived"],
    titlePlaceholder: "e.g. LunasinYuk - Financial Tracker",
    rolePlaceholder: "e.g. Lead Full-Stack Developer",
    descriptionPlaceholder: "What problem does it solve, how is it built, and what was the outcome?",
    toolsLabel: "Tech Stack",
    toolsPlaceholder: "e.g. React, Next.js, Tailwind CSS, Supabase",
    toolsHelp: "Comma-separated list of technologies.",
    featuresLabel: "Key Features",
    featuresPlaceholder: "e.g. Real-time updates, Google OAuth login, Responsive admin page",
    featuresHelp: "Comma-separated list of important features.",
    galleryLabel: "Screenshots Gallery",
    imageLabel: "Main Thumbnail / Cover Screenshot",
    showGithub: true,
    githubLabel: "Source Code (GitHub)",
    linkLabel: "Live Demo URL",
    linkPlaceholder: "https://...",
  },
  creative: {
    categories: ["UI/UX Design", "Branding & Identity", "Graphic Design", "Video & Motion", "Content Creation", "Other"],
    statuses: ["Concept", "Design Phase", "In Progress", "Completed", "Live", "Archived"],
    titlePlaceholder: "e.g. Stream Overlay Pack - Season 2",
    rolePlaceholder: "e.g. UI/UX Designer, Video Editor",
    descriptionPlaceholder: "Describe the brief, your creative direction, and the final result...",
    toolsLabel: "Tools & Software",
    toolsPlaceholder: "e.g. Figma, Photoshop, After Effects, OBS Studio",
    toolsHelp: "Comma-separated list of tools you used.",
    featuresLabel: "Deliverables",
    featuresPlaceholder: "e.g. Logo set, Color palette, 12 social templates, Stream alerts",
    featuresHelp: "Comma-separated list of what was delivered.",
    galleryLabel: "Design Previews / Mockups",
    imageLabel: "Cover Image",
    showGithub: false,
    githubLabel: "",
    linkLabel: "Case Study / Behance / Video URL",
    linkPlaceholder: "https://behance.net/... or https://youtube.com/...",
  },
  hybrid: {
    categories: ["Full-Stack & UI/UX", "Design System", "Frontend & Design", "Product / MVP", "Other"],
    statuses: ["Concept", "Design Phase", "In Progress", "Live", "Completed", "Maintenance", "Archived"],
    titlePlaceholder: "e.g. Portfolio Platform - Design & Build",
    rolePlaceholder: "e.g. Full-Stack Engineer & Lead UI/UX Designer",
    descriptionPlaceholder: "Cover both sides: the design thinking and the engineering behind it...",
    toolsLabel: "Tech Stack & Tools",
    toolsPlaceholder: "e.g. Next.js, Tailwind CSS, Figma, Supabase",
    toolsHelp: "Comma-separated list of technologies and design tools.",
    featuresLabel: "Key Features & Deliverables",
    featuresPlaceholder: "e.g. Design system, Real-time guestbook, Admin CMS",
    featuresHelp: "Comma-separated list of features and design deliverables.",
    galleryLabel: "Screenshots & Design Previews",
    imageLabel: "Main Thumbnail / Cover Image",
    showGithub: true,
    githubLabel: "Source Code (GitHub)",
    linkLabel: "Live Demo / Case Study URL",
    linkPlaceholder: "https://...",
  },
};

// Older rows stored descriptive types ("Web App", "Design"...). Map them onto the three identities.
const normalizeType = (raw) => {
  const v = String(raw || "").toLowerCase();
  if (v === "dev" || v === "developer" || v === "web app" || v === "mobile app" || v === "desktop app") return "dev";
  if (v === "creative" || v === "design") return "creative";
  if (v === "hybrid" || v === "cross") return "hybrid";
  return "dev";
};

export default function ProjectForm({ initialData = null, onSubmit, onCancel, buttonText = "Save Project" }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      let currentStatus = "In Progress";
      if (initialData.status === true || String(initialData.status).toLowerCase() === 'true' || String(initialData.status).toLowerCase() === 'live') {
        currentStatus = "Live";
      } else if (initialData.status === false || String(initialData.status).toLowerCase() === 'false') {
        currentStatus = "In Progress";
      } else if (initialData.status) {
        currentStatus = initialData.status;
      }
      return {
        title: initialData.title || "",
        description: initialData.description || "",
        image: initialData.image || "",
        type: normalizeType(initialData.type),
        category: initialData.category || typeConfig[normalizeType(initialData.type)].categories[0],
        techstack: initialData.techstack || [],
        demoLink: initialData.demoLink || initialData.demo_link || "",
        github: initialData.github || "",
        status: currentStatus,
        role: initialData.role || "",
        features: initialData.features || [],
        gallery: initialData.gallery || [],
        project_date: initialData.project_date || "",
      };
    }
    return {
      title: "",
      description: "",
      image: "",
      type: "dev",
      category: typeConfig.dev.categories[0],
      techstack: [],
      demoLink: "",
      github: "",
      status: "In Progress",
      role: "",
      features: [],
      gallery: [],
      project_date: "",
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [techstackInput, setTechstackInput] = useState(() => {
    return (initialData && initialData.techstack) ? initialData.techstack.join(", ") : "";
  });
  const [featuresInput, setFeaturesInput] = useState(() => {
    return (initialData && initialData.features) ? initialData.features.join(", ") : "";
  });
  const [galleryInput, setGalleryInput] = useState(() => {
    return (initialData && initialData.gallery) ? initialData.gallery.join(", ") : "";
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cfg = typeConfig[formData.type] || typeConfig.dev;

  // Switching identity swaps the category/status lists, so reset values that no longer exist.
  const handleTypeChange = (nextType) => {
    const next = typeConfig[nextType];
    setFormData((prev) => ({
      ...prev,
      type: nextType,
      category: next.categories.includes(prev.category) ? prev.category : next.categories[0],
      status: next.statuses.includes(prev.status) ? prev.status : next.statuses[0],
      github: next.showGithub ? prev.github : "",
    }));
  };

  const handleTechstackChange = (valStr) => {
    setTechstackInput(valStr);
    const arr = valStr.split(",").map((s) => s.trim()).filter(Boolean);
    handleChange("techstack", arr);
  };

  const handleFeaturesChange = (valStr) => {
    setFeaturesInput(valStr);
    const arr = valStr.split(",").map((s) => s.trim()).filter(Boolean);
    handleChange("features", arr);
  };

  const handleGalleryInputChange = (valStr) => {
    setGalleryInput(valStr);
    const arr = valStr.split(",").map((s) => s.trim()).filter(Boolean);
    handleChange("gallery", arr);
  };

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFileUpload = async (file, isGallery = false) => {
    if (!file) return;
    if (isGallery) {
      setUploadingGallery(true);
    } else {
      setUploadingImage(true);
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      let bucketName = "portfolio";
      let { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);
      
      if (error) {
        bucketName = "uploads";
        const retry = await supabase.storage.from(bucketName).upload(filePath, file);
        if (retry.error) throw retry.error;
        data = retry.data;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      if (isGallery) {
        setFormData((prev) => {
          const newGallery = [...prev.gallery, publicUrl];
          setGalleryInput(newGallery.join(", "));
          return { ...prev, gallery: newGallery };
        });
      } else {
        handleChange("image", publicUrl);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      alert(t("Failed to upload image. Error: ") + err.message);
    } finally {
      if (isGallery) {
        setUploadingGallery(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  const handleMultipleFileUploads = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        let bucketName = "portfolio";
        let { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);
        
        if (error) {
          bucketName = "uploads";
          const retry = await supabase.storage.from(bucketName).upload(filePath, file);
          if (retry.error) throw retry.error;
          data = retry.data;
        }

        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);
      
      setFormData((prev) => {
        const newGallery = [...prev.gallery, ...publicUrls];
        setGalleryInput(newGallery.join(", "));
        return { ...prev, gallery: newGallery };
      });
    } catch (err) {
      console.error("Upload error:", err.message);
      alert(t("Failed to upload some gallery images. Error: ") + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    const newGallery = formData.gallery.filter((_, idx) => idx !== indexToRemove);
    handleChange("gallery", newGallery);
    setGalleryInput(newGallery.join(", "));
  };

  const handleMoveGalleryImage = (index, direction) => {
    const newGallery = [...formData.gallery];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newGallery.length) return;

    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;

    handleChange("gallery", newGallery);
    setGalleryInput(newGallery.join(", "));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newGallery = [...formData.gallery];
    const draggedItem = newGallery[draggedIndex];
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(targetIndex, 0, draggedItem);

    handleChange("gallery", newGallery);
    setGalleryInput(newGallery.join(", "));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      alert(t("Error saving project: ") + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-1" className={labelCls}>{t("Project Title")}</label>
          <input id="pf-field-1"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={t(cfg.titlePlaceholder)}
            className={`${fieldCls} w-full`}
            required
          />
        </div>

        {/* Project Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-2" className={labelCls}>{t("Project Focus")}</label>
          <select id="pf-field-2"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={`${fieldCls} cursor-pointer`}
            required
          >
            {projectTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-3" className={labelCls}>{t("Category")}</label>
          <select id="pf-field-3"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className={`${fieldCls} cursor-pointer`}
            required
          >
            {[...new Set([formData.category, ...cfg.categories])].map((opt) => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>

        {/* Developer Role */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-4" className={labelCls}>{t("Your Role")}</label>
          <input id="pf-field-4"
            type="text"
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder={t(cfg.rolePlaceholder)}
            className={`${fieldCls} w-full`}
            required
          />
        </div>

        {/* Project Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-5" className={labelCls}>{t("Completed / Launch Date")}</label>
          <input id="pf-field-5"
            type="date"
            value={formData.project_date}
            onChange={(e) => handleChange("project_date", e.target.value)}
            className={`${fieldCls} cursor-pointer w-full`}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-6" className={labelCls}>{t("Description")}</label>
          <textarea id="pf-field-6"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t(cfg.descriptionPlaceholder)}
            className={`${textareaCls} min-h-[120px] w-full`}
            required
          />
        </div>

        {/* Image upload / URL */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-7" className={labelCls}>{t(cfg.imageLabel)}</label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input id="pf-field-7"
              type="text"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder={t("Paste image URL or upload file below")}
              className={`${fieldCls} grow`}
            />
            
            <div className="relative shrink-0 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], false)}
                className="peer sr-only"
                id="image-file-input"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-file-input"
                className={uploadBtnCls}
              >
                {uploadingImage ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                <span>{uploadingImage ? t("Uploading...") : t("Upload Image")}</span>
              </label>
            </div>

            {formData.image && (
              <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-line bg-surface mx-auto sm:mx-0">
                <Image src={formData.image} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-8" className={labelCls}>{t(cfg.toolsLabel)}</label>
          <input id="pf-field-8"
            type="text"
            value={techstackInput}
            onChange={(e) => handleTechstackChange(e.target.value)}
            placeholder={t(cfg.toolsPlaceholder)}
            className={`${fieldCls} w-full`}
          />
          <span className="text-muted text-[13px]">{t(cfg.toolsHelp)}</span>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-9" className={labelCls}>{t(cfg.featuresLabel)}</label>
          <input id="pf-field-9"
            type="text"
            value={featuresInput}
            onChange={(e) => handleFeaturesChange(e.target.value)}
            placeholder={t(cfg.featuresPlaceholder)}
            className={`${fieldCls} w-full`}
          />
          <span className="text-muted text-[13px]">{t(cfg.featuresHelp)}</span>
        </div>

        {/* Gallery upload / URL */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="pf-field-10" className={labelCls}>{t(cfg.galleryLabel)}</label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input id="pf-field-10"
                type="text"
                value={galleryInput}
                onChange={(e) => handleGalleryInputChange(e.target.value)}
                placeholder={t("Paste screenshots URLs (comma separated) or upload files below")}
                className={`${fieldCls} grow`}
              />
              
              <div className="relative shrink-0 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleFileUploads(e.target.files)}
                  className="peer sr-only"
                  id="gallery-file-input"
                  disabled={uploadingGallery}
                />
                <label
                  htmlFor="gallery-file-input"
                  className={uploadBtnCls}
                >
                  {uploadingGallery ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  <span>{uploadingGallery ? t("Uploading...") : t("Add to Gallery")}</span>
                </label>
              </div>
            </div>

            {/* Gallery Previews with delete button and reordering */}
            {formData.gallery && formData.gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-surface rounded-card">
                {formData.gallery.map((imgUrl, idx) => {
                  const isDragged = draggedIndex === idx;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-[1.5px] bg-paper group transition-all cursor-grab active:cursor-grabbing ${
                        isDragged
                          ? "border-accent opacity-40 scale-95"
                          : "border-line hover:border-ink"
                      }`}
                    >
                      <Image src={imgUrl} alt={`Screenshot ${idx + 1}`} fill className="object-cover pointer-events-none" />
                      
                      {/* Drag handle icon / helper overlay on hover */}
                      <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                        <Move className="size-5 text-on-ink drop-shadow" />
                      </div>

                      {/* Index badge */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-ink text-[10px] font-bold text-on-ink pointer-events-none">
                        #{idx + 1}
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1">
                        <div className="flex gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryImage(idx, -1);
                              }}
                              className="inline-flex items-center justify-center max-lg:size-11 p-1 rounded-full bg-surface hover:bg-ink hover:text-on-ink text-ink cursor-pointer transition-colors"
                              title={t("Move Left")}
                            >
                              <ChevronLeft className="size-3" />
                            </button>
                          )}
                          {idx < formData.gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryImage(idx, 1);
                              }}
                              className="inline-flex items-center justify-center max-lg:size-11 p-1 rounded-full bg-surface hover:bg-ink hover:text-on-ink text-ink cursor-pointer transition-colors"
                              title={t("Move Right")}
                            >
                              <ChevronRight className="size-3" />
                            </button>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGalleryImage(idx);
                          }}
                          className="inline-flex items-center justify-center max-lg:size-11 p-1 rounded-full bg-destructive hover:bg-ink text-white cursor-pointer transition-colors"
                          title={t("Remove Image")}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* GitHub URL (code projects only) */}
        {cfg.showGithub && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-11" className={labelCls}>{t(cfg.githubLabel)} <span className="text-muted font-normal text-[13px]">{t("(optional)")}</span></label>
          <input id="pf-field-11"
            type="url"
            value={formData.github}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder="https://github.com/..."
            className={`${fieldCls} w-full`}
          />
        </div>
        )}

        {/* Live Demo URL */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-12" className={labelCls}>{t(cfg.linkLabel)} <span className="text-muted font-normal text-[13px]">{t("(optional)")}</span></label>
          <input id="pf-field-12"
            type="url"
            value={formData.demoLink}
            onChange={(e) => handleChange("demoLink", e.target.value)}
            placeholder={t(cfg.linkPlaceholder)}
            className={`${fieldCls} w-full`}
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-field-13" className={labelCls}>{t("Project Status")}</label>
          <select id="pf-field-13"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={`${fieldCls} cursor-pointer w-full`}
            required
          >
            {[...new Set([formData.status, ...cfg.statuses])].map((opt) => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-6 border-t-2 border-ink">
        <button
          type="button"
          onClick={onCancel}
          className={secondaryBtnCls}
        >{t("Cancel")}</button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage || uploadingGallery}
          className={primaryBtnCls}
        >
          {isSubmitting ? t("Saving...") : t(buttonText)}
        </button>
      </div>
    </form>
  );
}

// Shared page header for /projects/create and /projects/[id]/edit
export function ProjectFormHeader({ eyebrow, title, intro }) {
  const { t } = useLanguage();
  return (
    <header className="flex flex-col gap-5 pt-8 sm:pt-10 pb-8 border-b-2 border-ink">
      <Link href="/projects" className="inline-flex items-center self-start min-h-11 text-[15px] font-semibold hover:underline underline-offset-4">
        {t("← All work")}
      </Link>
      <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted">{eyebrow}</span>
      <h1 className="font-display font-extrabold text-[clamp(40px,6vw,80px)] leading-[0.92] tracking-[-0.045em] break-words">
        {title}
      </h1>
      {intro && <p className="max-w-[560px] text-lg leading-normal text-muted">{intro}</p>}
    </header>
  );
}
