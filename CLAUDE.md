# CLAUDE.md

Personal portfolio of Syahreza Satria (https://syahreza-satria.xyz). Next.js 16 App Router + React 19, plain JavaScript (no TypeScript), Tailwind CSS v4, Supabase as the only backend. The UI copy is English; some user-facing strings and code comments are Indonesian.

## Commands

```bash
npm run dev     # dev server (http://localhost:3000)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint (flat config, eslint-config-next)
```

No test framework is set up. Node.js >= 20.9 is required by Next.js 16 (not pinned in `engines`).

## Environment

`.env` (gitignored) needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. There is no `.env.example`; the README tells people to create `.env` by hand. Never print or commit the values.

## Related docs

- [design-system.md](design-system.md): tokens, type, shape, components and motion rules for the "Project Showcase" theme. Keep it in sync when tokens in globals.css or animation.js change.
- `design-reference/`: HTML mockups of the redesign in a canvas templating format (`<x-dc>`, `{{hole}}`). Reference for layout and copy only; never import or copy their markup as code.
- The product requirements (PRD) live outside the repo, in the owner's Claude docs.

## Architecture

- **Path alias**: `@/*` → `src/*` (jsconfig.json).
- **No API routes or server actions.** Pages are almost all `"use client"` and talk to Supabase straight from the browser using the singleton in [src/lib/supabase.js](src/lib/supabase.js). Security therefore depends on Supabase RLS policies, not on the Next.js code.
- **Auth**: [AuthProvider](src/providers/AuthProvider.jsx) (wrapped around the whole app in [layout.js](src/app/layout.js)) handles Google OAuth via Supabase and exposes `{ user, loading, isAdmin, signInWithGoogle, signOut, showToast }` through `useAuth()` ([src/hooks/useAuth.js](src/hooks/useAuth.js)). It also renders the global toast. `isAdmin` is true for the owner's hard-coded email or `user_metadata.role === "admin"`. This is a client-side check only; admin-only pages redirect when `!isAdmin` (see [projects/create](src/app/projects/create/page.js)).
- **Layout shell**: `MotionProvider` → `LanguageProvider` → `AuthProvider` → `PageTransitionLoader` + one centred column (`max-w-[1240px] mx-auto px-5`) holding [SiteHeader](src/components/custom/SiteHeader.jsx), `<main>` and [Footer](src/components/custom/Footer.jsx). There is no sidebar or top bar. SiteHeader shows the `SYAHREZA®` wordmark (the Home link) and, from `lg`, a row of nav pills (active = ink, Contact always accent). Below `lg` a "Menu" pill opens a full-screen ink dialog with numbered links, Download CV, the language toggle and social links; it locks scroll, traps focus, closes on Esc and on any route change. The footer holds social links, CV, the language toggle and the small Login/Logout link. Nav entries, `RESUME_URL` and `socialLinks` live in [nav-items.js](src/components/custom/nav-items.js); add new pages there.
- **Motion**: shared tokens/variants live in [src/constants/animation.js](src/constants/animation.js) (`ease`, `spring`, `parent`/`child` stagger, `modalBackdrop`/`modalPanel`, `listItem`); reuse them instead of hand-tuning springs. [MotionProvider](src/providers/MotionProvider.jsx) applies `reducedMotion="user"`. [app/template.js](src/app/template.js) fades each page in on navigation. [PageTransitionLoader](src/components/custom/PageTransitionLoader.jsx) is only a slim top progress bar (it does not intercept or delay navigation). The language toggle and [FilterPills](src/components/custom/FilterPills.jsx) use sliding `layoutId` indicators. Interactive pieces: `SplitReveal` (letter reveal; full text in an sr-only copy, letters aria-hidden with `data-split-letter`), `Reveal`/`RevealItem` (scroll reveal, `stagger` prop), `DrawRule` (divider that draws in; use instead of `border-t-2 border-ink`), `HeroTitle` (home hero, × spin, cursor-driven variable `wght` via [useCursorWeight](src/hooks/useCursorWeight.js)), `CursorFollower` (mounted once in layout.js; shows over any element with `data-cursor="view"`), `MotionLink` + `imageZoom` for card hover, `SkillChip` (magnetic lean + accent fill on Home, fine pointer only), and the circular clip-path mobile menu in SiteHeader. Rules: import from `framer-motion` only; put new tokens in animation.js; animate transform/opacity/clip-path only; cursor effects need [useFinePointer](src/hooks/useFinePointer.js) (SSR-safe, false until hydrated); with `useReducedMotion()` keep `initial` unchanged (SSR markup) and only switch transitions to instant or skip the effect. Don't wrap something in `Reveal` that already animates in from a parent.
- **Metadata**: root defaults and title template (`%s | Syahreza Satria`) are in [layout.js](src/app/layout.js). Because pages are client components, per-page metadata lives in sibling `layout.js` files (e.g. [about/layout.js](src/app/about/layout.js)). [projects/[id]/layout.js](src/app/projects/[id]/layout.js) uses `generateMetadata` and awaits `params` (Next 15+ async params). Client pages read the id with `useParams()`.
- **i18n (EN/ID)**: [LanguageProvider](src/providers/LanguageProvider.jsx) (outermost provider in layout.js) exposes `useLanguage()` → `{ lang, setLang, toggleLang, t }`. The English text itself is the key: `t("Add Project")` returns the Indonesian string from [translations.js](src/constants/translations.js) when `lang === "id"`, otherwise (or if the key is missing) the English text. `t("Hi {name}", { name })` supports placeholders. The choice is stored in `localStorage["portfolio-lang"]`; first render is always `en` to avoid hydration mismatch. Toggle UI is [LanguageToggle](src/components/custom/LanguageToggle.jsx) (footer, and the mobile menu with `tone="ink"`). When adding UI text, wrap it in `t()` and add the Indonesian string to `translations.js`. Database content (projects, gears, etc.) and the `metadata` exports are not translated. Strings that live in module-level data (e.g. [forms.js](src/constants/forms.js)) are translated at render time by the consumer.
- **SEO**: [sitemap.js](src/app/sitemap.js) has a hard-coded static route list plus dynamic project ids from Supabase, so add new public routes there. [robots.js](src/app/robots.js) also exists.

### Routes

`/` home, `/about` (summary, toolkit, GitHub activity, experience + education), `/projects` (list, search/filter), `/projects/[id]`, `/projects/create` and `/projects/[id]/edit` (admin), `/achievement`, `/gears`, `/contact`, `/guestbook` (realtime chat), `/experience` (client redirect to `/about#experience`). All of them are in the header nav except the create/edit pages and the `/experience` redirect.

### Supabase data

Tables used: `projects`, `experiences`, `educations`, `achievements`, `gears`, `guestbook`. Storage buckets are used for image uploads (the upload code in [ProjectForm.jsx](src/components/custom/ProjectForm.jsx) and [CrudModal.jsx](src/components/custom/CrudModal.jsx) retries once on failure and uses `getPublicUrl`). `next.config.mjs` only allows remote images from `*.supabase.co/storage/v1/object/public/**`, so new remote image hosts must be added there.

- `projects` columns: `title, description, image, type ('dev'|'creative'|'hybrid'), category, techstack[], demo_link, github, status, role, features[], gallery[], project_date`. The form uses camelCase (`demoLink`) and maps to snake_case (`demo_link`) in the page's save handler. `status` can come back as a string or boolean-ish value, so use `getStatusConfig` rather than comparing directly. Stored `type` values also include the older `"Web App"` (treated as dev) and `"Design"` (creative); normalise with `projectType`. Both helpers, plus `formatProjectDate` and `toList`, live in [constants/projects.js](src/constants/projects.js).
- [constants/projects.js](src/constants/projects.js) also holds `fallbackProjects`, shown on Home, /projects and their detail pages when the table is empty or unreachable.
- `guestbook` uses a Supabase Realtime `postgres_changes` channel (`guestbook_realtime`) for live inserts, deletes and reactions; messages support replies and an emoji reaction list.
- There is no contact form. [contact/page.js](src/app/contact/page.js) only lists status, email, location and social links.

## Conventions

- **Theme: "Project Showcase"** (light paper, ink, one orange accent). Tokens are in `@theme` in [globals.css](src/app/globals.css); use them, not raw hex or Tailwind palette colours:
  - `paper` #EFEFEC page, `surface` #FFFFFF light cards, `ink` #111111 text and dark cards, `muted` #4A4A46 secondary text, `subtle` #6B6B66 placeholders, `line` #CFCFC9 thin rules.
  - On ink surfaces: `on-ink` #EFEFEC, `on-ink-muted` #D6D6D0, `on-ink-subtle` #B5B5AF, dividers `ink-line`.
  - `accent` #FF5A1F is the only accent colour. Text on accent is always `text-ink`, never white. `accent` and `muted` are the shadcn `--accent` / `--muted` variables, so `bg-accent` / `text-muted` work as utilities.
  - Do not use `neutral-*`, `emerald-*`, `green-*`, `lime-*` etc., gradients, glows, blur or large shadows. The only exception is `text-white` on `bg-destructive` delete buttons.
- **Fonts**: `font-display` = Bricolage Grotesque for headings, loaded as a variable font (no `weight` list, so the hero can animate `wght`; `font-bold`/`font-extrabold` still give 700/800), and `font-sans` = DM Sans (400/500/600) for everything else; both via `next/font` in layout.js. Giant titles use about `leading-[0.86]` and `tracking-[-0.05em]`.
- **Shape**: pills (`rounded-full`) for nav, buttons, tags and inputs; `rounded-card` (20px) cards, `rounded-panel` (24px) larger cards, `rounded-block` (32px) big blocks, `rounded-[28px]` covers. Section rules are `border-t-2 border-ink` (or `border-b-2`); list rows use `border-t-[1.5px] border-ink`.
- **Accessibility**: 44px minimum targets (`min-h-11`, `size-11`); the global `:focus-visible` outline is ink (paper inside `data-surface="ink"` / `.bg-ink`), so don't add `outline-none`; `aria-current="page"` on the active nav item; dialogs use [useDialog](src/hooks/useDialog.js) (focus in, Tab trapped, Esc, scroll lock, focus restored).
- **Shared building blocks** (in `src/components/custom/`): `PageHeader` (giant title + accent dot + intro + 2px rule), `FilterPills`, `PreviewDialog`, `AdminButtons` (`AdminActions`, `AddButton`), `form-styles.js` (field/label/button classes used by `ProjectForm` and `CrudModal`). Put admin controls next to a card link or button, never inside it.
- **Badge** ([custom/Badge.jsx](src/components/custom/Badge.jsx)): one outline-pill style for Dev / Creative / Hybrid (1.5px ink); unknown types get a quieter `line` outline. No colours or gradients per type; pass `tone="ink"` on dark cards.
- Guestbook bubbles: other people's messages on `surface`, the viewer's own on `ink` (right-aligned); a reaction the viewer added is `bg-accent`.
- Animation: Framer Motion with spring transitions, imported from `framer-motion` everywhere (only `motion` is in package.json; `framer-motion` resolves as its transitive dependency). Shared stagger variants are `parent`/`child` in [src/constants/animation.js](src/constants/animation.js).
- Icons: `react-icons/pi` (Phosphor) for most UI, `lucide-react` in forms and the guestbook.
- Skills live in [src/constants/skills.js](src/constants/skills.js) as `{ id, name, category }` (no icons); Home shows the names as chips and About groups them by category. Add a skill there, not inline in a page.
- shadcn is configured ([components.json](components.json), style `radix-nova`, JSX not TSX, aliases to `@/components`, `@/lib/utils`). Use `cn()` from [src/lib/utils.js](src/lib/utils.js) to merge class names. `ui/Input` is used by the Achievement search; `ui/Select` is restyled but currently unused. Site-specific components are in `src/components/custom/`.
- Admin CRUD pattern: pages (about, achievement, gears, projects) show edit/delete controls when `isAdmin`; add/edit goes through [CrudModal](src/components/custom/CrudModal.jsx) or [ProjectForm](src/components/custom/ProjectForm.jsx). Delete asks with `confirm()` and errors use `alert()`; `showToast` from `useAuth()` is currently only used for login/logout notices.
- The home page is the hero, skill chips, selected work (latest 4 projects), the Developer/Creative panels and the accent contact block. No stat tiles.

## Gotchas

- Because everything is client-side and public, never put secrets in the code; the anon key is the only credential and it is intentionally public. Don't rely on `isAdmin` for real protection; mutations must be guarded by RLS.
- `guestbook` stores `user_email`, and the guestbook page reads `select("*")` without sign-in, so every author's email reaches every visitor's browser. Don't add more personal columns to public tables; the fix (stop storing it or read through a view) is still open.
- Supabase schema and RLS policies are not in the repo; they live only in the Supabase dashboard. The table/column list above is reconstructed from the code.
- Pages fetch their data in the browser after load, so project lists and About content are not in the initial HTML (matters for SEO and link previews).
- `fallbackProjects` copy still mentions DaisyUI, purple badges and `max-w-4xl`; it is sample content, not a spec.
- There is no `LICENSE` file; don't describe the project as MIT-licensed.
