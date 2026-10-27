"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProjectForm, { ProjectFormHeader } from "@/components/custom/ProjectForm";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { child } from "@/constants/animation";
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
          <div className="h-6 w-32 bg-surface rounded-full" />
          <div className="h-4 w-48 bg-surface rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-start gap-6 pt-10 pb-12">
        <Link href="/projects" className="inline-flex items-center min-h-11 text-[15px] font-semibold hover:underline underline-offset-4">
          {t("← All work")}
        </Link>
        <p className="text-lg">{error ? `${t("Error:")} ${error}` : t("Project not found")}</p>
      </div>
    );
  }

  return (
    <motion.div variants={child} initial="hidden" animate="show" className="flex flex-col gap-10 pb-8">
      <ProjectFormHeader
        eyebrow={t("Edit Project")}
        title={project.title}
        intro={t("Update project details, features, gallery screenshots, and status.")}
      />

      <ProjectForm
        initialData={project}
        onSubmit={handleSave}
        onCancel={() => router.push("/projects")}
        buttonText={t("Save Changes")}
      />
    </motion.div>
  );
}
