"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProjectForm, { ProjectFormHeader } from "@/components/custom/ProjectForm";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { child } from "@/constants/animation";
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
          <div className="h-6 w-32 bg-surface rounded-full" />
          <div className="h-4 w-48 bg-surface rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div variants={child} initial="hidden" animate="show" className="flex flex-col gap-10 pb-8">
      <ProjectFormHeader
        eyebrow={t("Admin Action")}
        title={t("Add New Project")}
        intro={t("Publish a new project with features, techstack, role, dates, and media gallery.")}
      />

      <ProjectForm
        onSubmit={handleSave}
        onCancel={() => router.push("/projects")}
        buttonText={t("Publish Project")}
      />
    </motion.div>
  );
}
