"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, Plus, Edit, Trash2, X } from "lucide-react";
import Image from "next/image";
import { PiLaptopBold, PiArrowSquareOutBold, PiSparkleBold } from "react-icons/pi";
import Badge from "@/components/custom/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import CrudModal from "@/components/custom/CrudModal";
import { gearFields } from "@/constants/forms";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop, modalPanel, listItem } from "@/constants/animation";

export default function GearPage() {
  const { t } = useLanguage();
  const [gears, setGears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { user, isAdmin } = useAuth();
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
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* Page Header */}
      <section className="space-y-3 pt-4 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge type="hybrid" label={t("Gear & Workspace Setup")} size="sm" />
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-600/10 active:scale-95"
            >
              <Plus className="size-4" />
              <span>{t("Add Gear")}</span>
            </button>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{t("Tools & Workstation Hardware")}</h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">{t("A curated collection of hardware tools, workstation gear, and audiovisual equipment powering daily full-stack development and digital media creation.")}</p>
      </section>

      {/* Category Filter & Count Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-neutral-400 font-medium text-xs">
          {t(filteredGears.length === 1 ? "Showing {count} gear item" : "Showing {count} gear items", { count: filteredGears.length })}
        </p>

        <div className="flex flex-wrap gap-2">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-neutral-800 text-white border border-neutral-700 shadow-sm"
                  : "bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200"
              }`}
            >
              {category === "All" ? t("All Categories") : t(category)}
            </button>
          ))}
        </div>
      </section>

      {/* Gear Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden flex flex-col justify-between">
              <div className="w-full aspect-square bg-neutral-800/50" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-1/2 bg-neutral-800/60 rounded" />
                <div className="h-3 w-3/4 bg-neutral-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-10 text-center text-red-400 bg-red-950/20 border border-red-900/30 rounded-2xl">
          Gagal memuat gears: {error}
        </div>
      ) : (
        <motion.section layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGears.map((gear) => (
              <motion.div
                key={gear.id}
                layout
                {...listItem}
                transition={{ duration: 0.2 }}
                onClick={() => setPreviewGear(gear)}
                className="group relative rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                    <button
                      onClick={(e) => handleOpenEdit(e, gear)}
                      className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur transition-all shadow-md"
                    >
                      <Edit className="size-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, gear.id)}
                      className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-red-950/80 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-900 backdrop-blur transition-all shadow-md"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}

                {/* Top Image Banner (Edge-to-Edge 1:1 Aspect Square) */}
                <div className="relative w-full aspect-square bg-neutral-950 border-b border-neutral-800/80 overflow-hidden shrink-0 group/img">
                  {gear.image ? (
                    <Image
                      src={gear.image}
                      alt={gear.model}
                      fill
                      className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950">
                      <PiLaptopBold className="size-10 text-neutral-700" />
                    </div>
                  )}
                </div>

                {/* Text Content Area with Padding */}
                <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                      {gear.brand} • {t(gear.category)}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-100 truncate" title={gear.model}>
                      {gear.model}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {gear.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500 font-mono">{t("View details")}</span>
                    <ArrowUpRight className="size-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Crud Modal */}
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

      {/* Gear Lightbox Preview Modal */}
      <AnimatePresence>
        {previewGear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...modalBackdrop}
            onClick={() => setPreviewGear(null)}
              className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
            />

            <motion.div
              {...modalPanel}
            className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row"
            >
              <button
                onClick={() => setPreviewGear(null)}
                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="w-full md:w-1/2 aspect-square relative bg-neutral-950">
                {previewGear.image ? (
                  <Image src={previewGear.image} alt={previewGear.model} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <PiLaptopBold className="size-12" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md inline-block">
                    {previewGear.brand} • {t(previewGear.category)}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight pr-8">{previewGear.model}</h2>
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-h-60 overflow-y-auto">
                    {previewGear.description}
                  </p>
                </div>

                {previewGear.link && (
                  <a
                    href={previewGear.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold transition-all"
                  >
                    <span>{t("View Official Product")}</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
