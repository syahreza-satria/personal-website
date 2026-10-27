"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import CrudModal from "@/components/custom/CrudModal";
import { achievementFields } from "@/constants/forms";
import { useLanguage } from "@/hooks/useLanguage";
import PageHeader from "@/components/custom/PageHeader";
import FilterPills from "@/components/custom/FilterPills";
import PreviewDialog from "@/components/custom/PreviewDialog";
import { AdminActions, AddButton } from "@/components/custom/AdminButtons";
import { listItem } from "@/constants/animation";

const gridCls = "grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]";

export default function AchievementPage() {
  const { t, lang } = useLanguage();
  const formatMonthYear = (dateString) => {
    if (!dateString) return t("Present");
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const uniqueTypes = ["All", ...new Set(achievements.map((item) => item.type))];
  const uniqueCategories = ["All", ...new Set(achievements.map((item) => item.category))];

  const filteredAchievements = achievements.filter((achieve) => {
    const matchesSearch =
      achieve.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achieve.organizer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || achieve.type === selectedType;
    const matchesCategory = selectedCategory === "All" || achieve.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [previewAchievement, setPreviewAchievement] = useState(null);

  const handleOpenAdd = () => {
    setEditingAchievement(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, achieve) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingAchievement(achieve);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("Are you sure you want to delete this achievement?"))) return;
    try {
      const { error } = await supabase.from("achievements").delete().eq("id", id);
      if (error) throw error;
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(t("Error deleting: ") + err.message);
    }
  };

  const handleSave = async (formData) => {
    const payload = {
      title: formData.title,
      organizer: formData.organizer,
      credential_id: formData.credentialId,
      image: formData.image,
      issued_date: formData.issuedDate,
      type: formData.type,
      category: formData.category,
    };

    if (editingAchievement) {
      const { data, error } = await supabase
        .from("achievements")
        .update(payload)
        .eq("id", editingAchievement.id)
        .select();
      if (error) throw error;

      const returnedRow = data && data.length > 0 ? data[0] : { ...editingAchievement, ...payload };
      const formatted = { ...returnedRow, credentialId: returnedRow.credential_id, issuedDate: returnedRow.issued_date };
      setAchievements((prev) => {
        const updated = prev.map((a) => (a.id === editingAchievement.id ? formatted : a));
        return updated.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
      });
    } else {
      const { data, error } = await supabase.from("achievements").insert([payload]).select();
      if (error) throw error;

      const returnedRow = data && data.length > 0 ? data[0] : { id: Date.now(), ...payload };
      const formatted = { ...returnedRow, credentialId: returnedRow.credential_id, issuedDate: returnedRow.issued_date };
      setAchievements((prev) => {
        const updated = [...prev, formatted];
        return updated.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
      });
    }
  };

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase.from("achievements").select("*").order("issued_date", { ascending: false });
        if (error) throw error;

        const formattedData = (data || []).map((item) => ({
          ...item,
          credentialId: item.credential_id,
          issuedDate: item.issued_date,
        }));

        setAchievements(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="pb-8">
      <PageHeader
        title={t("Achievement")}
        intro={t("A collection of verified technical certifications, design awards, and industry credentials.")}
      >
        {isAdmin && <AddButton label={t("Add Achievement")} onClick={handleOpenAdd} />}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-7 pb-10">
        <FilterPills
          label={t("Filter by type")}
          value={selectedType}
          onChange={setSelectedType}
          options={uniqueTypes.map((type) => ({ value: type, label: type === "All" ? t("All Types") : t(type) }))}
        />
        <label className="basis-[340px] grow sm:grow-0">
          <span className="sr-only">{t("Search achievements")}</span>
          <Input
            type="search"
            placeholder={t("Search title or organizer...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div aria-busy="true" className={gridCls}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-panel bg-surface p-3 flex flex-col gap-4">
              <div className="aspect-[297/210] rounded-card bg-paper animate-pulse" />
              <div className="h-5 w-2/3 rounded-full bg-paper animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="py-10 text-center rounded-card border-[1.5px] border-destructive text-destructive">
          {t("Error:")} {error}
        </p>
      ) : filteredAchievements.length === 0 ? (
        <p className="py-12 text-center text-muted border-[1.5px] border-dashed border-line rounded-card">
          {t("No achievements match your filters.")}
        </p>
      ) : (
        <motion.div layout className={gridCls}>
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achieve, index) => {
              // The newest entry is the one ink card on the page
              const emphasis = index === 0;
              return (
                <motion.div key={achieve.id} layout {...listItem} className="relative">
                  <button
                    type="button"
                    onClick={() => setPreviewAchievement(achieve)}
                    className={`group w-full h-full text-left flex flex-col gap-4 rounded-panel p-3 transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${
                      emphasis ? "bg-ink text-on-ink" : "bg-surface text-ink"
                    }`}
                  >
                    <div className={`relative w-full aspect-[297/210] rounded-card overflow-hidden ${emphasis ? "bg-ink-line" : "bg-paper"}`}>
                      {achieve.image ? (
                        <Image
                          src={achieve.image}
                          alt=""
                          fill
                          sizes="(min-width: 1240px) 400px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <span className={`absolute inset-0 flex items-center justify-center text-[13px] ${emphasis ? "text-on-ink-subtle" : "text-subtle"}`}>
                          {t("No image")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 px-2 pb-2">
                      <span className={`text-sm ${emphasis ? "text-on-ink-subtle" : "text-muted"}`}>
                        {[t(achieve.type), t(achieve.category)].filter(Boolean).join(" · ")}
                      </span>
                      <span className="font-display font-bold text-xl leading-tight tracking-[-0.01em] line-clamp-2 group-hover:underline underline-offset-4">
                        {achieve.title}
                      </span>
                      <span className={`text-[15px] truncate ${emphasis ? "text-on-ink-muted" : "text-muted"}`}>{achieve.organizer}</span>
                      <span className={`text-sm font-semibold pt-2 ${emphasis ? "text-on-ink" : "text-ink"}`}>
                        {t("Issued")} {formatMonthYear(achieve.issuedDate)}
                      </span>
                    </div>
                  </button>
                  {isAdmin && (
                    <AdminActions
                      label={achieve.title}
                      className="absolute top-5 right-5 z-10"
                      onEdit={(e) => handleOpenEdit(e, achieve)}
                      onDelete={(e) => handleDelete(e, achieve.id)}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAchievement ? "Edit Achievement" : "Add Achievement"}
        onSubmit={handleSave}
        initialData={editingAchievement}
        fields={achievementFields}
        submitLabel={editingAchievement ? "Save Changes" : "Add Achievement"}
        subtitle="Certificates, awards, and courses shown on the Achievement page."
      />

      <AnimatePresence>
        {previewAchievement && (
          <PreviewDialog
            label={previewAchievement.title}
            onClose={() => setPreviewAchievement(null)}
            media={
              previewAchievement.image ? (
                <Image
                  src={previewAchievement.image}
                  alt={previewAchievement.title}
                  fill
                  sizes="(min-width: 768px) 600px, 100vw"
                  className="object-contain p-4"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm text-subtle">{t("No image")}</span>
              )
            }
          >
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                {[t(previewAchievement.type), t(previewAchievement.category)].filter(Boolean).join(" · ")}
              </span>
              <h2 className="font-display font-bold text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em]">
                {previewAchievement.title}
              </h2>
              <p className="text-base">
                {t("Issued by:")} <span className="font-semibold">{previewAchievement.organizer}</span>
              </p>
              {previewAchievement.credentialId && (
                <p className="text-sm text-muted break-all rounded-card bg-surface p-3">ID: {previewAchievement.credentialId}</p>
              )}
            </div>
            <p className="mt-auto pt-4 border-t-[1.5px] border-ink text-sm font-semibold">
              {t("Issued date:")} {formatMonthYear(previewAchievement.issuedDate)}
            </p>
          </PreviewDialog>
        )}
      </AnimatePresence>
    </div>
  );
}
