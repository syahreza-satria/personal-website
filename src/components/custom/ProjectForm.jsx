"use client";

import { useState } from "react";
import { Upload, Loader2, Plus, X, ChevronLeft, ChevronRight, Move } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

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
    <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/40 border border-neutral-800/80 p-6 md:p-8 rounded-[2rem] shadow-xl backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t("Project Title")}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={t(cfg.titlePlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
            required
          />
        </div>

        {/* Project Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t("Project Focus")}</label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            required
          >
            {projectTypes.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900">{t(opt.label)}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t("Category")}</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            required
          >
            {[...new Set([formData.category, ...cfg.categories])].map((opt) => (
              <option key={opt} value={opt} className="bg-neutral-900">{t(opt)}</option>
            ))}
          </select>
        </div>

        {/* Developer Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t("Your Role")}</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder={t(cfg.rolePlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
            required
          />
        </div>

        {/* Project Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t("Completed / Launch Date")}</label>
          <input
            type="date"
            value={formData.project_date}
            onChange={(e) => handleChange("project_date", e.target.value)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer w-full"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t("Description")}</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t(cfg.descriptionPlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[120px] w-full"
            required
          />
        </div>

        {/* Image upload / URL */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.imageLabel)}</label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="text"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder={t("Paste image URL or upload file below")}
              className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 grow"
            />
            
            <div className="relative shrink-0 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], false)}
                className="hidden"
                id="image-file-input"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-file-input"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-750 hover:border-neutral-600 text-neutral-200 text-xs px-4 py-3 border border-neutral-700 rounded-xl cursor-pointer transition-all active:scale-95 font-medium shrink-0"
              >
                {uploadingImage ? (
                  <Loader2 className="size-4 animate-spin text-emerald-500" />
                ) : (
                  <Upload className="size-4" />
                )}
                <span>{uploadingImage ? t("Uploading...") : t("Upload Image")}</span>
              </label>
            </div>

            {formData.image && (
              <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-neutral-750 bg-neutral-950 mx-auto sm:mx-0">
                <Image src={formData.image} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.toolsLabel)}</label>
          <input
            type="text"
            value={techstackInput}
            onChange={(e) => handleTechstackChange(e.target.value)}
            placeholder={t(cfg.toolsPlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
          />
          <span className="text-neutral-500 text-[11px]">{t(cfg.toolsHelp)}</span>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.featuresLabel)}</label>
          <input
            type="text"
            value={featuresInput}
            onChange={(e) => handleFeaturesChange(e.target.value)}
            placeholder={t(cfg.featuresPlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
          />
          <span className="text-neutral-500 text-[11px]">{t(cfg.featuresHelp)}</span>
        </div>

        {/* Gallery upload / URL */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.galleryLabel)}</label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                value={galleryInput}
                onChange={(e) => handleGalleryInputChange(e.target.value)}
                placeholder={t("Paste screenshots URLs (comma separated) or upload files below")}
                className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 grow"
              />
              
              <div className="relative shrink-0 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleFileUploads(e.target.files)}
                  className="hidden"
                  id="gallery-file-input"
                  disabled={uploadingGallery}
                />
                <label
                  htmlFor="gallery-file-input"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-750 hover:border-neutral-600 text-neutral-200 text-xs px-4 py-3 border border-neutral-700 rounded-xl cursor-pointer transition-all active:scale-95 font-medium shrink-0"
                >
                  {uploadingGallery ? (
                    <Loader2 className="size-4 animate-spin text-emerald-500" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  <span>{uploadingGallery ? t("Uploading...") : t("Add to Gallery")}</span>
                </label>
              </div>
            </div>

            {/* Gallery Previews with delete button and reordering */}
            {formData.gallery && formData.gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-neutral-950/30 border border-neutral-800/50 rounded-2xl">
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
                      className={`relative aspect-video rounded-lg overflow-hidden border bg-neutral-950 group transition-all cursor-grab active:cursor-grabbing ${
                        isDragged
                          ? "border-emerald-500/50 opacity-40 scale-95"
                          : "border-neutral-750 hover:border-neutral-600"
                      }`}
                    >
                      <Image src={imgUrl} alt={`Screenshot ${idx + 1}`} fill className="object-cover pointer-events-none" />
                      
                      {/* Drag handle icon / helper overlay on hover */}
                      <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                        <Move className="size-5 text-neutral-300 drop-shadow " />
                      </div>

                      {/* Index badge */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-neutral-900/80 border border-neutral-700/50 text-[10px] font-bold text-neutral-300 pointer-events-none">
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
                              className="p-1 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/50 text-neutral-300 cursor-pointer transition-colors"
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
                              className="p-1 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/50 text-neutral-300 cursor-pointer transition-colors"
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
                          className="p-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-900/50 text-white cursor-pointer transition-colors"
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
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.githubLabel)} <span className="text-neutral-600 font-normal text-xs">{t("(optional)")}</span></label>
          <input
            type="url"
            value={formData.github}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder="https://github.com/..."
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
          />
        </div>
        )}

        {/* Live Demo URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t(cfg.linkLabel)} <span className="text-neutral-600 font-normal text-xs">{t("(optional)")}</span></label>
          <input
            type="url"
            value={formData.demoLink}
            onChange={(e) => handleChange("demoLink", e.target.value)}
            placeholder={t(cfg.linkPlaceholder)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-300 font-medium text-sm">{t("Project Status")}</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="bg-neutral-800/50 border border-neutral-700/60 text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer w-full"
            required
          >
            {[...new Set([formData.status, ...cfg.statuses])].map((opt) => (
              <option key={opt} value={opt} className="bg-neutral-900">{t(opt)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >{t("Cancel")}</button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage || uploadingGallery}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 active:scale-95"
        >
          {isSubmitting ? t("Saving...") : t(buttonText)}
        </button>
      </div>
    </form>
  );
}
