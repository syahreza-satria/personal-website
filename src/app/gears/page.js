"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import CrudModal from "@/components/custom/CrudModal";
import { gearFields } from "@/constants/forms";
import { useLanguage } from "@/hooks/useLanguage";
import PageHeader from "@/components/custom/PageHeader";
import FilterPills from "@/components/custom/FilterPills";
import PreviewDialog from "@/components/custom/PreviewDialog";
import { AdminActions, AddButton } from "@/components/custom/AdminButtons";
import { listItem } from "@/constants/animation";

const gridCls = "grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]";

export default function GearPage() {
  const { t } = useLanguage();
  const [gears, setGears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGear, setEditingGear] = useState(null);
  const [previewGear, setPreviewGear] = useState(null);

  const handleOpenAdd = () => {
    setEditingGear(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, gear) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingGear(gear);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("Are you sure you want to delete this gear item?"))) return;
    try {
      const { error } = await supabase.from("gears").delete().eq("id", id);
      if (error) throw error;
      setGears((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(t("Error deleting: ") + err.message);
    }
  };

  const handleSave = async (formData) => {
    const payload = {
      brand: formData.brand,
      model: formData.model,
      description: formData.description,
      image: formData.image,
      link: formData.link,
      category: formData.category,
    };

    if (editingGear) {
      const { data, error } = await supabase
        .from("gears")
        .update(payload)
        .eq("id", editingGear.id)
        .select();
      if (error) throw error;
      const updatedRow = data && data.length > 0 ? data[0] : { ...editingGear, ...payload };
      setGears((prev) => prev.map((g) => (g.id === editingGear.id ? updatedRow : g)));
    } else {
      const { data, error } = await supabase.from("gears").insert([payload]).select();
      if (error) throw error;
      const insertedRow = data && data.length > 0 ? data[0] : { id: Date.now(), ...payload };
      setGears((prev) => [...prev, insertedRow]);
    }
  };

  useEffect(() => {
    const fetchGears = async () => {
      try {
        const { data, error } = await supabase.from("gears").select("*").order("id", { ascending: true });

        if (error) throw error;
        setGears(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGears();
  }, []);

  const uniqueCategories = ["All", ...new Set(gears.map((gear) => gear.category))];
  const filteredGears = selectedCategory === "All" ? gears : gears.filter((gear) => gear.category === selectedCategory);

  return (
    <div className="pb-8">
      <PageHeader
        title={t("Gears")}
        intro={t("A curated collection of hardware tools, workstation gear, and audiovisual equipment powering daily full-stack development and digital media creation.")}
      >
        {isAdmin && <AddButton label={t("Add Gear")} onClick={handleOpenAdd} />}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-7 pb-10">
        <FilterPills
          label={t("Filter by category")}
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={uniqueCategories.map((category) => ({
            value: category,
            label: category === "All" ? t("All Categories") : t(category),
          }))}
        />
        <p className="text-[15px] text-muted" aria-live="polite">
          {t(filteredGears.length === 1 ? "Showing {count} gear item" : "Showing {count} gear items", { count: filteredGears.length })}
        </p>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div aria-busy="true" className={gridCls}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-panel bg-surface p-3 flex flex-col gap-4">
              <div className="aspect-square rounded-card bg-paper animate-pulse" />
              <div className="h-5 w-2/3 rounded-full bg-paper animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="py-10 text-center rounded-card border-[1.5px] border-destructive text-destructive">
          {t("Error:")} {error}
        </p>
      ) : (
        <motion.div layout className={gridCls}>
          <AnimatePresence mode="popLayout">
            {filteredGears.map((gear, index) => {
              // First item is the one ink card on the page
              const emphasis = index === 0;
              return (
                <motion.div key={gear.id} layout {...listItem} className="relative">
                  <button
                    type="button"
                    onClick={() => setPreviewGear(gear)}
                    className={`group w-full h-full text-left flex flex-col gap-4 rounded-panel p-3 transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${
                      emphasis ? "bg-ink text-on-ink" : "bg-surface text-ink"
                    }`}
                  >
                    <div className={`relative w-full aspect-square rounded-card overflow-hidden ${emphasis ? "bg-ink-line" : "bg-paper"}`}>
                      {gear.image ? (
                        <Image
                          src={gear.image}
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
                        {[gear.brand, t(gear.category)].filter(Boolean).join(" · ")}
                      </span>
                      <span className="font-display font-bold text-xl leading-tight tracking-[-0.01em] truncate group-hover:underline underline-offset-4">
                        {gear.model}
                      </span>
                      <span className={`text-[15px] leading-relaxed line-clamp-2 ${emphasis ? "text-on-ink-muted" : "text-muted"}`}>
                        {gear.description}
                      </span>
                    </div>
                  </button>
                  {isAdmin && (
                    <AdminActions
                      label={gear.model}
                      className="absolute top-5 right-5 z-10"
                      onEdit={(e) => handleOpenEdit(e, gear)}
                      onDelete={(e) => handleDelete(e, gear.id)}
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
        title={editingGear ? "Edit Gear Item" : "Add Gear Item"}
        onSubmit={handleSave}
        initialData={editingGear}
        fields={gearFields}
        submitLabel={editingGear ? "Save Changes" : "Add Gear"}
        subtitle="Hardware and tools shown on the Gears page."
      />

      <AnimatePresence>
        {previewGear && (
          <PreviewDialog
            label={previewGear.model}
            onClose={() => setPreviewGear(null)}
            media={
              previewGear.image ? (
                <Image src={previewGear.image} alt={previewGear.model} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm text-subtle">{t("No image")}</span>
              )
            }
          >
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                {[previewGear.brand, t(previewGear.category)].filter(Boolean).join(" · ")}
              </span>
              <h2 className="font-display font-bold text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em]">{previewGear.model}</h2>
              <p className="text-base leading-relaxed">{previewGear.description}</p>
            </div>
            {previewGear.link && (
              <a
                href={previewGear.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-accent text-ink text-[15px] font-semibold"
              >
                {t("View Official Product")} ↗
              </a>
            )}
          </PreviewDialog>
        )}
      </AnimatePresence>
    </div>
  );
}
