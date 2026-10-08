"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import Image from "next/image";
import { ArrowUpRight, Plus, Edit, Trash2, X, Calendar, Award, ExternalLink, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import CrudModal from "@/components/custom/CrudModal";
import { achievementFields } from "@/constants/forms";
import Badge from "@/components/custom/Badge";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop, modalPanel, listItem } from "@/constants/animation";

export default function AchievementPage() {
  const { t, lang } = useLanguage();
  const formatMonthYear = (dateString) => {
    if (!dateString) return "Present";
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

  const { user, isAdmin } = useAuth();
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
    <div className="space-y-6 sm:space-y-14 pb-12">
      {/* Header */}
      <section className="space-y-3 pt-2 sm:pt-4 border-b border-neutral-800/80 pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge type="hybrid" label={t("Certifications & Honors")} size="sm" />
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-600/10 active:scale-95"
            >
              <Plus className="size-4" />
              <span>{t("Add Achievement")}</span>
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">{t("Achievements & Verified Licenses")}</h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">{t("A collection of verified technical certifications, design awards, and industry credentials.")}</p>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-col md:flex-row gap-3 md:items-center justify-between w-full">
        <input
          type="text"
          placeholder={t("Search title or organizer...")}
          className="px-3.5 py-3 sm:py-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors w-full md:max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 md:flex-wrap md:overflow-visible scrollbar-hide">
          {uniqueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`py-2 sm:py-1.5 px-3.5 sm:px-3 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-neutral-800 text-white border border-neutral-700 shadow-sm"
                  : "bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200"
              }`}
            >
              {type === "All" ? t("All Types") : t(type)}
            </button>
          ))}
        </div>
      </section>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 h-64 flex flex-col gap-3">
              <div className="w-full aspect-video rounded-xl bg-neutral-800/50" />
              <div className="h-4 w-1/2 bg-neutral-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-10 text-center text-red-400 bg-red-950/20 border border-red-900/30 rounded-2xl">
          Error: {error}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achieve) => (
              <motion.div
                key={achieve.id}
                layout
                {...listItem}
                onClick={() => setPreviewAchievement(achieve)}
                className="group relative p-3 sm:p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.98] sm:active:scale-100 shadow-sm flex flex-col justify-between space-y-3 cursor-pointer"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                    <button
                      onClick={(e) => handleOpenEdit(e, achieve)}
                      className="p-2 sm:p-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur transition-all"
                    >
                      <Edit className="size-3.5 sm:size-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, achieve.id)}
                      className="p-2 sm:p-1.5 rounded-lg bg-neutral-950/80 hover:bg-red-950/80 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-900 backdrop-blur transition-all"
                    >
                      <Trash2 className="size-3.5 sm:size-3" />
                    </button>
                  </div>
                )}

                <div className="relative w-full aspect-[297/210] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                  {achieve.image ? (
                    <Image src={achieve.image} alt={achieve.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Award className="size-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                    {t(achieve.type)} • {t(achieve.category)}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-100 line-clamp-2" title={achieve.title}>
                    {achieve.title}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate">{achieve.organizer}</p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
                  <span className="text-[11px] font-mono">{t("Issued")} {formatMonthYear(achieve.issuedDate)}</span>
                  <ArrowUpRight className="size-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Crud Modal */}
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

      {/* Preview Lightbox Modal */}
      <AnimatePresence>
        {previewAchievement && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              {...modalBackdrop}
            onClick={() => setPreviewAchievement(null)}
              className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
            />

            <motion.div
              {...modalPanel}
            className="relative bg-neutral-900 border border-neutral-800 rounded-t-2xl rounded-b-none sm:rounded-2xl w-full max-w-5xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row"
            >
              <button
                onClick={() => setPreviewAchievement(null)}
                className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-neutral-950/90 border border-neutral-800 text-neutral-300 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="w-full md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[26rem] relative bg-neutral-950 shrink-0">
                {previewAchievement.image ? (
                  <Image src={previewAchievement.image} alt={previewAchievement.title} fill className="object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Award className="size-12" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md inline-block">
                    {t(previewAchievement.type)} • {t(previewAchievement.category)}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight pr-8">{previewAchievement.title}</h2>
                  <p className="text-sm sm:text-base text-neutral-300 font-medium">{t("Issued by:")} {previewAchievement.organizer}</p>
                  {previewAchievement.credentialId && (
                    <p className="text-xs sm:text-sm font-mono text-neutral-400 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 break-all">
                      ID: {previewAchievement.credentialId}
                    </p>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-mono text-neutral-500 pt-3 border-t border-neutral-800">
                  {t("Issued date:")} {formatMonthYear(previewAchievement.issuedDate)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
