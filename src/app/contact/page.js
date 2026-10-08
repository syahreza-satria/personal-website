"use client";

import React, { useState } from "react";
import {
  PiEnvelopeSimpleBold,
  PiPaperPlaneRightBold,
  PiMapPinBold,
  PiCheckCircleBold,
  PiChatCircleTextBold,
  PiGithubLogoBold,
  PiLinkedinLogoBold,
  PiInstagramLogoBold,
  PiYoutubeLogoBold,
} from "react-icons/pi";
import Badge from "@/components/custom/Badge";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Developer / Creative Inquiry",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* Page Header */}
      <section className="space-y-3 pt-4 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2">
          <Badge type="hybrid" label={t("Get In Touch")} size="sm" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Let&apos;s Connect & Collaborate
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">{t("Have a web project, UI design challenge, or media collaboration in mind? Feel free to send a direct message.")}</p>
      </section>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Direct Info & Social Channels */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400">{t("CURRENT STATUS")}</span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-emerald-400" />{t("Available for Projects")}</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{t("Open for full-stack web development contracts, UI/UX consulting, and creative digital media opportunities.")}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">{t("Direct Contact")}</h3>
            <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20">
                <PiEnvelopeSimpleBold className="size-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">{t("Email")}</span>
                <a
                  href="mailto:contact@syahreza-satria.xyz"
                  className="text-xs sm:text-sm font-medium text-neutral-200 hover:text-emerald-400 transition-colors"
                >
                  satriaeza221@gmail.com
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20">
                <PiMapPinBold className="size-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">{t("Location")}</span>
                <span className="text-xs sm:text-sm font-medium text-neutral-200">
                  Bandung, Indonesia (UTC+7)
                </span>
              </div>
            </div>
          </div>

          {/* Social Channels (Official Brand Colors) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">{t("Social Connect")}</h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://github.com/syahreza-satria"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl border border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:text-white flex items-center gap-2 text-xs font-medium text-neutral-200 transition-all duration-200"
              >
                <PiGithubLogoBold className="size-4 text-white transition-transform duration-200 group-hover:scale-110" />
                <span>GitHub</span>
              </a>

              <a
                href="https://linkedin.com/in/syahreza-satria"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/20 hover:text-[#4c9ae8] flex items-center gap-2 text-xs font-medium text-neutral-200 transition-all duration-200"
              >
                <PiLinkedinLogoBold className="size-4 text-[#0A66C2] transition-transform duration-200 group-hover:scale-110" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://youtube.com/@syahrezasatria"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl border border-[#FF0000]/30 bg-[#FF0000]/10 hover:border-[#FF0000]/60 hover:bg-[#FF0000]/20 hover:text-[#ff5c5c] flex items-center gap-2 text-xs font-medium text-neutral-200 transition-all duration-200"
              >
                <PiYoutubeLogoBold className="size-4 text-[#FF0000] transition-transform duration-200 group-hover:scale-110" />
                <span>YouTube</span>
              </a>

              <a
                href="https://instagram.com/syahreza.satria"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl border border-[#E4405F]/30 bg-[#E4405F]/10 hover:border-[#E4405F]/60 hover:bg-[#E4405F]/20 hover:text-[#f0728a] flex items-center gap-2 text-xs font-medium text-neutral-200 transition-all duration-200"
              >
                <PiInstagramLogoBold className="size-4 text-[#E4405F] transition-transform duration-200 group-hover:scale-110" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-7">
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PiChatCircleTextBold className="size-5 text-emerald-400" />
              <span>{t("Send a Direct Message")}</span>
            </h2>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <PiCheckCircleBold className="size-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white text-base">{t("Message Sent Successfully!")}</h3>
                <p className="text-xs text-neutral-300">{t("Thank you for reaching out. I will review your inquiry and get back to you promptly.")}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-emerald-400 hover:underline pt-2 font-medium"
                >{t("Send another message")}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">{t("Your Name")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">{t("Email Address")}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">{t("Message")}</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={t("Tell me about your project, timeline, or idea...")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-neutral-950 font-semibold text-xs py-3 px-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  <PiPaperPlaneRightBold className="size-4" />
                  <span>{loading ? t("Sending...") : t("Send Message")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
