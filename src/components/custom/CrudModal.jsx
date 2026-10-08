"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { modalBackdrop, modalPanel } from "@/constants/animation";

/**
 * Field definition (see src/constants/forms.js for real examples):
 *  name, label, type (text|url|number|textarea|select|date|image|array|list|checkbox|section)
 *  placeholder, help      - hint shown inside / under the input
 *  half                   - take half the row on >= sm screens (default: full row)
 *  required
 *  options                - select: string[] or { value, label }[]
 *  separator              - array: separator character (default ",")
 *  step, min, max         - number
 *  showIf(formData)       - render the field only when it returns true
 *  type "list"            - one item per line, stored as string[]
 *  type "section"         - non-input heading that groups the fields below it
 */

const inputCls =
  "bg-neutral-800 border border-neutral-700/60 text-neutral-200 placeholder:text-neutral-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full";

const normalizeOption = (opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt);

const emptyValue = (f) =>
  f.type === "checkbox" || f.type === "switch" ? false : f.type === "array" || f.type === "list" ? [] : "";

const toDateInput = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

function CrudForm({ onClose, title, subtitle, onSubmit, initialData, fields, submitLabel }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach((f) => {
      if (f.type === "section") return;
      data[f.name] = emptyValue(f);
    });
    return initialData ? { ...data, ...initialData } : data;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  // Raw text for array/list fields so separators and blank lines can be typed freely.
  const [rawInputs, setRawInputs] = useState(() => {
    const raw = {};
    fields.forEach((f) => {
      if (f.type !== "array" && f.type !== "list") return;
      const sep = f.type === "list" ? "\n" : (f.separator || ",") + " ";
      const val = initialData?.[f.name];
      raw[f.name] = Array.isArray(val) ? val.join(sep) : "";
    });
    return raw;
  });

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleListChange = (field, valStr) => {
    const separator = field.type === "list" ? "\n" : field.separator || ",";
    setRawInputs((prev) => ({ ...prev, [field.name]: valStr }));
    handleChange(field.name, valStr.split(separator).map((s) => s.trim()).filter(Boolean));
  };

  const handleFileUpload = async (name, file) => {
    if (!file) return;
    setUploadingField(name);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `uploads/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      let bucketName = "portfolio";
      const first = await supabase.storage.from(bucketName).upload(filePath, file);
      if (first.error) {
        bucketName = "uploads";
        const retry = await supabase.storage.from(bucketName).upload(filePath, file);
        if (retry.error) throw retry.error;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      handleChange(name, publicUrl);
    } catch (err) {
      console.error("Upload error:", err.message);
      alert(t("Failed to upload image. Please check if your Supabase Storage bucket ('portfolio' or 'uploads') exists and allows public uploads. Error: ") + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Postgres rejects "" for date / numeric columns, so send null for blanks.
      const payload = { ...formData };
      fields.forEach((f) => {
        if ((f.type === "date" || f.type === "number") && payload[f.name] === "") payload[f.name] = null;
      });
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t("Error saving: ") + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderControl = (field) => {
    const value = formData[field.name];
    const common = { required: field.required, placeholder: field.placeholder ? t(field.placeholder) : undefined };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...common}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${inputCls} min-h-[96px]`}
          />
        );
      case "list":
        return (
          <textarea
            {...common}
            value={rawInputs[field.name] ?? ""}
            onChange={(e) => handleListChange(field, e.target.value)}
            className={`${inputCls} min-h-[120px]`}
          />
        );
      case "array":
        return (
          <input
            type="text"
            {...common}
            value={rawInputs[field.name] ?? ""}
            onChange={(e) => handleListChange(field, e.target.value)}
            className={inputCls}
          />
        );
      case "select":
        return (
          <select
            required={field.required}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="" disabled>{field.placeholder || `Select ${t(field.label)}`}</option>
            {field.options.map(normalizeOption).map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
            ))}
          </select>
        );
      case "checkbox":
      case "switch":
        return (
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="size-4.5 rounded border-neutral-700 bg-neutral-800 accent-emerald-500 cursor-pointer"
            />
            <span className="text-neutral-400 text-sm">{t(field.description)}</span>
          </label>
        );
      case "image":
        return (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              {...common}
              placeholder={t(field.placeholder || "Paste image URL or upload a file")}
              value={value || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`${inputCls} grow`}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(field.name, e.target.files[0])}
              className="hidden"
              id={`file-${field.name}`}
              disabled={uploadingField === field.name}
            />
            <label
              htmlFor={`file-${field.name}`}
              className="flex items-center justify-center gap-1.5 bg-neutral-800 border border-neutral-700 hover:border-emerald-500/40 text-neutral-200 text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 active:scale-95 font-medium"
            >
              {uploadingField === field.name ? (
                <Loader2 className="size-3.5 animate-spin text-emerald-500" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>{uploadingField === field.name ? t("Uploading...") : t("Upload")}</span>
            </label>
            {value && (
              <div className="relative size-9.5 shrink-0 rounded-lg overflow-hidden border border-neutral-700 bg-black">
                <Image src={value} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        );
      case "date":
        return (
          <input
            type="date"
            required={field.required}
            value={toDateInput(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${inputCls} cursor-pointer`}
          />
        );
      default:
        return (
          <input
            type={field.type || "text"}
            {...common}
            step={field.step}
            min={field.min}
            max={field.max}
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={inputCls}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        {...modalBackdrop}
            onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        {...modalPanel}
            className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[88vh]"
      >
        <div className="flex justify-between items-start gap-4 px-6 py-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">{t(title)}</h2>
            {subtitle && <p className="text-neutral-500 text-xs mt-0.5">{t(subtitle)}</p>}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors cursor-pointer" aria-label={t("Close")}>
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col grow overflow-y-auto px-6 py-5 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((field) => {
              if (field.showIf && !field.showIf(formData)) return null;

              if (field.type === "section") {
                return (
                  <div key={field.name || field.label} className="sm:col-span-2 pt-2 first:pt-0 border-t border-neutral-800 first:border-t-0">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mt-3 first:mt-0">{t(field.label)}</p>
                  </div>
                );
              }

              return (
                <div key={field.name} className={`flex flex-col gap-1.5 ${field.half ? "" : "sm:col-span-2"}`}>
                  {field.type !== "checkbox" && field.type !== "switch" && (
                    <label className="text-neutral-300 font-medium text-sm">
                      {t(field.label)}
                      {field.required ? <span className="text-emerald-500"> *</span> : <span className="text-neutral-600 font-normal text-xs">{t("(optional)")}</span>}
                    </label>
                  )}
                  {renderControl(field)}
                  {field.help && <span className="text-neutral-500 text-[11px]">{t(field.help)}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >{t("Cancel")}</button>
            <button
              type="submit"
              disabled={isSubmitting || !!uploadingField}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? t("Saving...") : t(submitLabel)}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// The form body is mounted only while open so its state is re-initialised from
// `initialData` every time the modal opens (add vs. edit).
export default function CrudModal({
  isOpen,
  onClose,
  title,
  subtitle,
  onSubmit,
  initialData = null,
  fields = [],
  submitLabel = "Save",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <CrudForm
          key={initialData?.id ?? "new"}
          onClose={onClose}
          title={title}
          subtitle={subtitle}
          onSubmit={onSubmit}
          initialData={initialData}
          fields={fields}
          submitLabel={submitLabel}
        />
      )}
    </AnimatePresence>
  );
}
