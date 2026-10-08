"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProjectForm from "@/components/custom/ProjectForm";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/custom/Badge";
import { useLanguage } from "@/hooks/useLanguage";

export default function EditProject() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const { user, isAdmin, loading: authLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/projects");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (!id || !isAdmin) return;

    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, isAdmin]);

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

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    router.push("/projects");
    router.refresh();
  };

  const showLoader = authLoading || (isLoading && isAdmin);

  if (showLoader) {
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

  if (error || !project) {
    return (
      <div className="space-y-6 pt-4 pb-16">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200 text-xs font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>{t("Back to Projects")}</span>
        </Link>
        <div className="text-center py-12 text-red-400 bg-red-950/20 border border-red-900/30 rounded-2xl">
          {error ? `${t("Error:")} ${error}` : t("Project not found")}
        </div>
      </div>
    );
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
          <Badge type="dev" label={t("Edit Project")} size="sm" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Edit Project: {project.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">{t("Update project details, features, gallery screenshots, and status.")}</p>
        </div>
      </div>

      <ProjectForm
        initialData={project}
        onSubmit={handleSave}
        onCancel={() => router.push("/projects")}
        buttonText={t("Save Changes")}
      />
    </motion.div>
  );
}
