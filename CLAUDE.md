# CLAUDE.md

Personal portfolio of Syahreza Satria (https://syahreza-satria.xyz). Next.js 16 App Router + React 19, plain JavaScript (no TypeScript), Tailwind CSS v4, Supabase as the only backend. The UI copy is English; some user-facing strings and code comments are Indonesian.

## Commands

```bash
npm run dev     # dev server (http://localhost:3000)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint (flat config, eslint-config-next)
```

No test framework is set up. `scratch/` holds throwaway Node scripts that query Supabase directly (they `require("dotenv")`, which is not in package.json). They are not part of the app.

## Environment

`.env` (gitignored) needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. There is no `.env.example` even though the README mentions one. Never print or commit the values.

## Architecture

- **Path alias**: `@/*` → `src/*` (jsconfig.json).
- **No API routes or server actions.** Pages are almost all `"use client"` and talk to Supabase straight from the browser using the singleton in [src/lib/supabase.js](src/lib/supabase.js). Security therefore depends on Supabase RLS policies, not on the Next.js code.
- **Auth**: [AuthProvider](src/providers/AuthProvider.jsx) (wrapped around the whole app in [layout.js](src/app/layout.js)) handles Google OAuth via Supabase and exposes `{ user, loading, isAdmin, signInWithGoogle, signOut, showToast }` through `useAuth()` ([src/hooks/useAuth.js](src/hooks/useAuth.js)). It also renders the global toast. `isAdmin` is true for the owner's hard-coded email or `user_metadata.role === "admin"`. This is a client-side check only; admin-only pages redirect when `!isAdmin` (see [projects/create](src/app/projects/create/page.js)).
- **Layout shell (dashboard)**: `AuthProvider` → `PageTransitionLoader` → fixed left [Sidebar](src/components/custom/Sidebar.jsx) (desktop, `w-64`; becomes a floating bottom dock on mobile) + a content column with `lg:pl-64` containing sticky [Topbar](src/components/custom/Topbar.jsx) (breadcrumb, mobile CV/login), `<main class="max-w-6xl">`, and a slim [Footer](src/components/custom/Footer.jsx). Nav entries live in one place, [nav-items.js](src/components/custom/nav-items.js); add new pages there.
- **Motion**: shared tokens/variants live in [src/constants/animation.js](src/constants/animation.js) (`ease`, `spring`, `parent`/`child` stagger, `modalBackdrop`/`modalPanel`, `listItem`); reuse them instead of hand-tuning springs. [MotionProvider](src/providers/MotionProvider.jsx) applies `reducedMotion="user"`. [app/template.js](src/app/template.js) fades each page in on navigation. [PageTransitionLoader](src/components/custom/PageTransitionLoader.jsx) is only a slim top progress bar (it does not intercept or delay navigation). Sidebar/dock/language-toggle active states use shared `layoutId` pills.
- **Metadata**: root defaults and title template (`%s | Syahreza Satria`) are in [layout.js](src/app/layout.js). Because pages are client components, per-page metadata lives in sibling `layout.js` files (e.g. [about/layout.js](src/app/about/layout.js)). [projects/[id]/layout.js](src/app/projects/[id]/layout.js) uses `generateMetadata` and awaits `params` (Next 15+ async params). Client pages read the id with `useParams()`.
- **i18n (EN/ID)**: [LanguageProvider](src/providers/LanguageProvider.jsx) (outermost provider in layout.js) exposes `useLanguage()` → `{ lang, setLang, toggleLang, t }`. The English text itself is the key: `t("Add Project")` returns the Indonesian string from [translations.js](src/constants/translations.js) when `lang === "id"`, otherwise (or if the key is missing) the English text. `t("Hi {name}", { name })` supports placeholders. The choice is stored in `localStorage["portfolio-lang"]`; first render is always `en` to avoid hydration mismatch. Toggle UI is [LanguageToggle](src/components/custom/LanguageToggle.jsx) (sidebar on desktop, topbar on mobile). When adding UI text, wrap it in `t()` and add the Indonesian string to `translations.js`. Database content (projects, gears, etc.) and the `metadata` exports are not translated. Strings that live in module-level data (e.g. [forms.js](src/constants/forms.js)) are translated at render time by the consumer.
- **SEO**: [sitemap.js](src/app/sitemap.js) has a hard-coded static route list plus dynamic project ids from Supabase, so add new public routes there. [robots.js](src/app/robots.js) also exists.

### Routes

`/` home, `/about` (experience + education timeline), `/projects` (list, search/filter, modal), `/projects/[id]`, `/projects/create` and `/projects/[id]/edit` (admin), `/achievement`, `/gears`, `/contact`, `/guestbook` (realtime chat), `/experience` (client redirect to `/about#experience`). All of them are in the sidebar except the `/experience` redirect.

### Supabase data

Tables used: `projects`, `experiences`, `educations`, `achievements`, `gears`, `guestbook`. Storage buckets are used for image uploads (the upload code in [ProjectForm.jsx](src/components/custom/ProjectForm.jsx) and [CrudModal.jsx](src/components/custom/CrudModal.jsx) retries once on failure and uses `getPublicUrl`). `next.config.mjs` only allows remote images from `*.supabase.co/storage/v1/object/public/**`, so new remote image hosts must be added there.

- `projects` columns: `title, description, image, type ('dev'|'creative'|'hybrid'), category, techstack[], demo_link, github, status, role, features[], gallery[], project_date`. The form uses camelCase (`demoLink`) and maps to snake_case (`demo_link`) in the page's save handler. `status` can come back as a string or boolean-ish value, so use `getStatusConfig` in [projects/page.js](src/app/projects/page.js) rather than comparing directly.
- [projects/page.js](src/app/projects/page.js) contains `fallbackProjects` shown when the DB is empty or unreachable.
- `guestbook` uses a Supabase Realtime `postgres_changes` channel (`guestbook_realtime`) for live inserts, deletes and reactions; messages support replies and an emoji reaction list.
- Contact form posts `FormData` to a Google Apps Script URL (hard-coded in [ContactForm.jsx](src/components/custom/ContactForm.jsx)) with `mode: "no-cors"`, so success cannot be verified from the response.

## Conventions

- Black + green theme: `globals.css` remaps `neutral-950…700` to near-pure black, so existing `neutral-*` classes render black. Emerald is the single accent; do not introduce other hues (purple/amber/blue were removed). `skills.js` brand-icon colours are the only exception. Use Tailwind utilities inline; daisyUI/shadcn tokens are imported but rarely used.
- **Dual-identity badges** via [Badge](src/components/custom/Badge.jsx): emerald = dev, lime = creative, emerald→lime gradient = hybrid. (`components/ui/Badge.jsx` is a separate, generic shadcn-style badge.)
- Animation: Framer Motion (`framer-motion` and `motion/react` are both used) with spring transitions. Shared stagger variants are `parent`/`child` in [src/constants/animation.js](src/constants/animation.js). GSAP is installed as well.
- Icons: `react-icons/pi` (Phosphor) for most UI, `lucide-react` in forms and some pages, `react-icons/si` for tech logos.
- Skills grid data lives in [src/constants/skills.js](src/constants/skills.js) (name, icon, category). Add a skill there, not inline in a page.
- shadcn is configured ([components.json](components.json), style `radix-nova`, JSX not TSX, aliases to `@/components`, `@/lib/utils`). Use `cn()` from [src/lib/utils.js](src/lib/utils.js) to merge class names. Generic primitives are in `src/components/ui/`, site-specific ones in `src/components/custom/`, and the reactbits-style effects (`RotatingText`, `ShinyText`, `SpotlightCard`) sit directly in `src/components/`.
- Admin CRUD pattern: pages (about, achievement, gears, projects) show edit/delete controls when `isAdmin`; add/edit goes through [CrudModal](src/components/custom/CrudModal.jsx) or [ProjectForm](src/components/custom/ProjectForm.jsx), and success/failure feedback goes through `showToast` from `useAuth()`.
- The home page is a dashboard of `Panel` cards; its stat tiles run `count` head-queries against `projects`, `achievements`, `gears`, `guestbook`.

## Gotchas

- The working tree has many uncommitted changes (dashboard layout + black/green restyle). Check `git status` before assuming what is committed.
- Because everything is client-side and public, never put secrets in the code; the anon key is the only credential and it is intentionally public. Don't rely on `isAdmin` for real protection; mutations must be guarded by RLS.
- README claims Framer Motion v12 / GSAP / "real-time" features that match the code, but its `.env.example` instruction is out of date.
