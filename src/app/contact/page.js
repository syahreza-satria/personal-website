"use client";

import PageHeader from "@/components/custom/PageHeader";
import Reveal, { RevealItem } from "@/components/custom/Reveal";
import { socialLinks } from "@/components/custom/nav-items";
import { useLanguage } from "@/hooks/useLanguage";

const EMAIL = "contact@syahreza-satria.xyz";

// Visible handle for each social card, keyed by socialLinks[].name
const handles = {
  GitHub: "@syahreza-satria",
  LinkedIn: "in/syahreza-satria",
  Instagram: "@syahreza.satria",
  YouTube: "@syahrezasatria",
};

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-8">
      <PageHeader
        title={t("Contact")}
        intro={t("Have a web project, UI design challenge, or media collaboration in mind? Feel free to send a direct message.")}
      />

      {/* Email block */}
      <Reveal
        as="section"
        aria-labelledby="contact-email-title"
        className="mt-10 flex flex-col gap-8 rounded-block bg-accent text-ink px-6 py-12 sm:px-10 sm:py-16"
      >
        <div className="flex flex-col gap-3 max-w-[640px]">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em]">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-ink" />
            {t("Available for Projects")}
          </span>
          <p className="text-lg leading-normal">
            {t("Open for full-stack web development contracts, UI/UX consulting, and creative digital media opportunities.")}
          </p>
        </div>
        <h2 id="contact-email-title" className="sr-only">
          {t("Email")}
        </h2>
        <a
          href={`mailto:${EMAIL}`}
          className="self-start font-display font-extrabold text-[clamp(28px,6vw,80px)] leading-[0.95] tracking-[-0.04em] break-all underline decoration-[3px] underline-offset-[8px] hover:decoration-[5px]"
        >
          {EMAIL}
        </a>
        <p className="text-base font-medium">
          {t("Location")}: Bandung, Indonesia (UTC+7)
        </p>
      </Reveal>

      {/* Social cards */}
      <section aria-labelledby="social-title" className="pt-16 flex flex-col gap-5">
        <Reveal as="h2" id="social-title" className="font-display font-bold text-[40px] leading-none tracking-[-0.03em]">
          {t("Social Connect")}
        </Reveal>
        <Reveal as="ul" stagger className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]">
          {socialLinks.map(({ name, url }, i) => {
            // GitHub is the one ink card
            const emphasis = i === 0;
            return (
              <RevealItem as="li" key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-surface={emphasis ? "ink" : undefined}
                  className={`group flex h-full flex-col justify-between gap-10 rounded-panel p-6 sm:p-7 transition-transform duration-200 hover:-translate-y-1 ${
                    emphasis ? "bg-ink text-on-ink" : "bg-surface text-ink"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display font-bold text-[28px] leading-none tracking-[-0.02em]">{name}</span>
                    <span aria-hidden="true" className="text-2xl leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </span>
                  <span className={`text-[15px] ${emphasis ? "text-on-ink-muted" : "text-muted"}`}>{handles[name]}</span>
                </a>
              </RevealItem>
            );
          })}
        </Reveal>
      </section>
    </div>
  );
}
