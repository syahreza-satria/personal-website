# Syahreza Satria — Portfolio

The personal portfolio of Syahreza Satria, a hybrid developer and creative specialist based in Bandung, Indonesia. Live at **[syahreza-satria.xyz](https://syahreza-satria.xyz)**.

It shows projects, experience, certificates and gear, has a real-time guestbook, and includes a built-in admin mode so the owner can manage every piece of content from the site itself.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-black?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%C2%B7%20Auth%20%C2%B7%20Realtime-black?style=flat-square&logo=supabase)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?style=flat-square&logo=framer)](https://motion.dev/)

---

## Why this project exists

- **Show, don't tell.** A live, interactive site demonstrates full-stack and UI/UX skills better than a PDF résumé.
- **One place to keep current.** Projects, roles and certificates are edited from the site, so the portfolio grows with the career without redeploying.
- **A playground.** A practical place to use Next.js 16, React 19, Supabase Realtime and motion design in production.

---

## Features

### Design — "Project Showcase"

- Light paper layout, oversized display type (Bricolage Grotesque + DM Sans), pill navigation, ink cards and a single orange accent.
- Full-screen mobile menu that opens as a circle growing from the Menu button.
- Details and rules in [design-system.md](design-system.md).

### Interaction & motion

- Home hero with a letter-by-letter reveal, a spinning ×, and letters that get bolder as the cursor approaches (variable font `wght` axis).
- An accent "View →" cursor and a soft image zoom over project cards.
- Filter pills with a sliding indicator; the project grid re-arranges smoothly when filtered.
- Scroll reveals, dividers that draw themselves in, a fade between pages and a slim progress bar.
- Magnetic skill chips.
- Full `prefers-reduced-motion` support; cursor effects only run on devices with a fine pointer.

### Content

- **Home**: hero, skills, the four latest projects (one featured), Developer / Creative panels, contact block.
- **Work** (`/projects`): search plus Developer / Creative / Hybrid filters, status on every card.
- **Project detail**: role, category, date, live demo and GitHub links, overview, key features, tech stack, gallery with lightbox, next project.
- **About**: summary, CV download, toolkit grouped by category, 12 months of GitHub contributions, experience and education.
- **Achievement**: certificates with search, type filter and image preview.
- **Gears**: equipment by category with links to the product pages.
- **Contact**: availability, email, location and social links (no contact form).

### Real-time guestbook

- Anyone can read; sign in with Google to post, reply or react with an emoji.
- New messages, deletions and reactions appear for every visitor instantly via Supabase Realtime.

### Admin mode

- Google sign-in through Supabase Auth; the owner's account gets admin controls on every content page.
- Create, edit and delete projects, experience, education, achievements and gear.
- Forms adapt to what is being edited (e.g. a project's Dev / Creative / Hybrid focus changes its categories and statuses).
- Image uploads go straight to Supabase Storage.

### Bilingual (English / Bahasa Indonesia)

- Toggle in the footer and the mobile menu; the choice is remembered in the browser.
- All interface text comes from one dictionary, [src/constants/translations.js](src/constants/translations.js). Database content and page metadata stay in one language.

### SEO

- Per-page metadata, Open Graph and Twitter cards, a dynamic sitemap that includes every project, and `robots` rules that hide the admin pages.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, plain JavaScript |
| Styling | Tailwind CSS v4, shadcn/ui primitives on Radix UI |
| Motion | Framer Motion 12 (`motion` package) |
| Backend | Supabase: Postgres, Auth (Google OAuth), Storage, Realtime |
| Analytics | Vercel Analytics |
| Other | `react-github-calendar`, React Icons, Lucide |

There are no API routes: pages talk to Supabase directly from the browser with the public anon key, so **all write protection comes from Supabase Row Level Security**.

---

## Getting started

### Prerequisites

- Node.js **20.9 or newer** (required by Next.js 16) and npm
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/syahreza-satria/personal-website.git
cd personal-website
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (there is no `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase setup

Create these tables, turn on **Row Level Security** for each, and enable **Realtime replication** for `guestbook`.

| Table | Main columns | Used by |
| --- | --- | --- |
| `projects` | `title`, `description`, `image`, `type`, `category`, `techstack[]`, `demo_link`, `github`, `status`, `role`, `features[]`, `gallery[]`, `project_date` | Home, Work, project pages, sitemap |
| `experiences` | `role`, `company`, `location`, `type`, `setup`, `start_date`, `end_date`, `responsibilities[]`, `logo` | About |
| `educations` | `school`, `degree`, `major`, `gpa`, `location`, `start_date`, `end_date`, `logo` | About |
| `achievements` | `type`, `category`, `title`, `organizer`, `issued_date`, `credential_id`, `image` | Achievement |
| `gears` | `category`, `brand`, `model`, `description`, `link`, `image` | Gears |
| `guestbook` | `user_id`, `user_name`, `user_email`, `user_avatar`, `message`, `reactions` (jsonb), `parent_id`, `created_at` | Guestbook |

Then:

- Create a public **Storage** bucket named `portfolio` (the uploader falls back to `uploads` if that fails).
- **RLS**: allow public `select`; restrict `insert` / `update` / `delete` on content tables to the owner's account; on `guestbook`, allow signed-in users to insert their own rows and delete only their own (plus the owner).
- **Privacy**: `guestbook.user_email` is stored with each message. Don't expose that column to anonymous reads (e.g. serve the guestbook through a view without it).
- The admin check in [AuthProvider](src/providers/AuthProvider.jsx) (owner email or `user_metadata.role === "admin"`) only controls what the UI shows; it is not a security boundary.

### 4. Google sign-in

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**: enable it and paste the Client ID and Secret from the [Google Cloud Console](https://console.cloud.google.com/).
2. Add the redirect URI Supabase shows you to the Google OAuth credentials.

### 5. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

If Supabase is empty or unreachable, Home and Work fall back to the sample projects in [src/constants/projects.js](src/constants/projects.js).

---

## Project structure

```text
├── design-reference/       # Mockups of the redesign (reference only, not app code)
├── design-system.md        # Colours, type, shape, components, motion rules
├── CLAUDE.md               # Architecture notes and conventions for AI coding agents
├── public/                 # brand-logo.png, og-image.png
└── src/
    ├── app/                # App Router pages; per-page metadata in sibling layout.js files
    │   ├── page.js         # Home
    │   ├── projects/       # Work list, [id] detail, create and [id]/edit (admin)
    │   ├── about/  achievement/  gears/  guestbook/  contact/
    │   ├── experience/     # Redirect to /about#experience
    │   ├── template.js     # Fade-in on every navigation
    │   ├── sitemap.js  robots.js
    │   └── globals.css     # Tailwind v4 theme tokens
    ├── components/
    │   ├── custom/         # SiteHeader, Footer, PageHeader, HeroTitle, motion helpers, forms, dialogs
    │   └── ui/             # shadcn primitives (Input, Select)
    ├── constants/          # animation tokens, projects helpers + fallback, forms, skills, translations
    ├── hooks/              # useAuth, useLanguage, useDialog, useFinePointer, useCursorWeight
    ├── lib/                # Supabase client, cn()
    └── providers/          # Auth, Language, Motion providers
```

---

## Documentation

- [design-system.md](design-system.md) — tokens, typography, components and motion rules.
- [CLAUDE.md](CLAUDE.md) — architecture, data model and conventions in detail.

---

## License

No license file has been added yet, so all rights are reserved by default. Add a `LICENSE` file before inviting reuse.

---

## Author

**Syahreza Satria** — Bandung, Indonesia
[GitHub](https://github.com/syahreza-satria) · [LinkedIn](https://linkedin.com/in/syahreza-satria) · [Instagram](https://instagram.com/syahreza.satria) · [YouTube](https://youtube.com/@syahrezasatria)
