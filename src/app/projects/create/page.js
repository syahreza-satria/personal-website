"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProjectForm from "@/components/custom/ProjectForm";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/custom/Badge";
import { useLanguage } from "@/hooks/useLanguage";

export default function CreateProject() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/projects");
    }
  }, [isAdmin, authLoading, router]);

  const handleSave = async (formData) => {
    const payload = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      type: formData.type,
      category: formData.category,
      techstack: formData.techstack || [],
      demo_link: formData.demoLink,
      github: formData.github,
      status: formData.status,
      role: formData.role,
      features: formData.features || [],
      gallery: formData.gallery || [],
      project_date: formData.project_date || null,
    };

    const { error } = await supabase.from("projects").insert([payload]);
    if (error) throw error;

    router.push("/projects");
    router.refresh();
  };

  if (authLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className=" flex flex-col items-center gap-3">
          <div className="h-6 w-32 bg-neutral-800 rounded-md" />
          <div className="h-4 w-48 bg-neutral-800/60 rounded-md" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      initial={{ y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="space-y-6 pt-4 pb-16"
    >
      <div className="flex flex-col gap-3 border-b border-neutral-800 pb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200 text-xs font-medium w-fit"
        >
          <ArrowLeft className="size-4" />
          <span>{t("Back to Projects")}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge type="dev" label={t("Admin Action")} size="sm" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t("Add New Project")}</h1>
          <p className="text-xs sm:text-sm text-neutral-400">{t("Publish a new project with features, techstack, role, dates, and media gallery.")}</p>
        </div>
      </div>

      <ProjectForm
        onSubmit={handleSave}
        onCancel={() => router.push("/projects")}
        buttonText={t("Publish Project")}
      />
    </motion.div>
  );
}
