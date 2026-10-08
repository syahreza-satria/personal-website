# Syahreza Satria's Developer Portfolio (2026 Edition)

A premium, interactive developer portfolio designed to showcase professional skills, projects, and achievements. Built with the latest modern web technologies, this platform goes beyond a static resume by offering an engaging, animated user interface, a real-time guestbook, and a secure administrator dashboard for live content management.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## 💡 Why This Project Exists

In today's fast-paced digital landscape, a developer's true capabilities are best demonstrated through live, interactive experiences rather than plain text. This project was built to:

*   **Showcase Full-Stack Proficiency:** Go beyond a simple landing page by integrating a real-time guestbook and a complete custom CRUD dashboard with secure authentication.
*   **Experiment with Modern Technologies:** Serve as a practical playground for implementing Next.js 16 (App Router), React 19, Supabase real-time capabilities, and complex UI animations with Framer Motion.
*   **Create a Living Digital Identity:** Provide a centralized, easily updatable platform that evolves alongside my career, skills, and projects, ensuring visitors always see the most current representation of my professional journey.

---

## 🚀 Key Features

*   **Black & Green Dashboard UI**: A fixed sidebar (collapses into a floating dock on mobile), a sticky top bar with breadcrumbs, and a card-based home dashboard with live content counts pulled from Supabase.
*   **Bilingual (English / Bahasa Indonesia)**: One-click language toggle in the sidebar. The choice is remembered, and all interface text is translated from a single dictionary (`src/constants/translations.js`).
*   **Polished Motion System**: Shared animation tokens, a fade-in page template, a slim top progress bar, sliding active-state indicators, staggered section entrances, and full `prefers-reduced-motion` support.
*   **Dynamic Project Gallery (Supabase-integrated)**:
    *   **Live Search & Filtering**: Instant client-side search with Developer / Creative / Hybrid filters.
    *   **Project Detail Pages**: Tech stack, key features, screenshot gallery with lightbox, and live demo / source links.
*   **Admin CRUD Control Center**:
    *   **Authentication & Authorization**: Google OAuth via Supabase, with admin privileges for the site owner.
    *   **Context-Aware Forms**: Create/edit forms adapt to what is being edited, e.g. a project's focus (Developer / Creative / Hybrid) changes the categories, statuses and field labels, while experience, education, achievement and gear each have their own fields, hints and validation.
    *   **Image Uploads**: Upload covers, galleries, logos and certificates straight to Supabase Storage.
*   **Real-time Guestbook Chat**:
    *   **Social Sign-In**: Quick Google OAuth sign-in to leave a message.
    *   **Real-time Synchronization**: Live updates for new posts, replies, and reactions using Supabase Postgres replication.
*   **Interactive Skillset Grid**: Filterable skills and tools with layout-preserving spring animations.
*   **GitHub Activity Integration**: Shows the most recent six months of contributions using `react-github-calendar`.
*   **Comprehensive Sections**: *About* (professional summary, skills, experience & education timeline), *Projects*, *Achievements*, *Gears*, *Guestbook*, and *Contact*.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router), React 19
*   **Styling**: Tailwind CSS v4, Radix UI, Shadcn UI
*   **Animations**: Framer Motion (v12), GSAP
*   **i18n**: Lightweight in-house provider (English / Bahasa Indonesia)
*   **Backend & Database**: Supabase (PostgreSQL, Realtime Channels, Auth)
*   **Icons & Assets**: Lucide React, React Icons

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:
*   **Node.js**: `v18.x` or newer (recommended: `v20.x` or higher)
*   **NPM**: `v9.x` or newer
*   A **Supabase** account and active project instance

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/syahreza-satria/portfolio-2026.git
cd portfolio-2026
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root and fill in your Supabase project API credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Schema Migration
In your **Supabase SQL Editor**, create the following tables, enable Row Level Security (RLS) with suitable policies, and turn on replication for `guestbook` so real-time updates work:

| Table | Used by |
| --- | --- |
| `projects` | Projects list, detail and admin forms |
| `experiences`, `educations` | About page timeline |
| `achievements` | Achievement page |
| `gears` | Gears page |
| `guestbook` | Real-time guestbook |

Also create a public **Storage** bucket named `portfolio` (or `uploads` as fallback) for image uploads.

> **Security note:** the app talks to Supabase directly from the browser, and the admin check in `AuthProvider` is client-side only. Write access must be enforced with RLS policies (e.g. restrict inserts/updates/deletes to the owner's account).

### 5. Setup Google OAuth in Supabase
1. Go to **Supabase Dashboard** -> **Authentication** -> **Providers**.
2. Select **Google**, toggle it **Enabled**, and fill in your Client ID and Client Secret from the [Google Cloud Console](https://console.cloud.google.com/).
3. Add the redirect URI provided by Supabase back to your Google Cloud Console credentials.

---

## 🏃 Running the Application

### Development Server
Start the local server with hot-reloading:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production Build
Generate an optimized production build:
```bash
npm run build
```

### Start Production Server
Run the compiled code locally:
```bash
npm run start
```

---

## 📂 Project Structure

```text
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router (pages and layouts)
    │   ├── template.js     # Page fade-in on every navigation
    │   ├── about/          # Professional summary, skills, experience & education
    │   ├── achievement/    # Certificates list
    │   ├── contact/        # Contact form page
    │   ├── gears/          # Workspace tech specs & equipment
    │   ├── guestbook/      # Real-time chat & guest posts
    │   └── projects/       # Showcase, detail pages and admin create/edit
    ├── components/         # React Components
    │   ├── custom/         # Sidebar, Topbar, Footer, forms, GitHub calendar, language toggle
    │   └── ui/             # Radix & Shadcn based UI primitives
    ├── constants/          # animation tokens, form field configs, skills, translations
    ├── hooks/              # useAuth, useLanguage
    ├── lib/                # Shared utilities (supabase connection, class merges)
    └── providers/          # AuthProvider, LanguageProvider, MotionProvider
```

---

## 📄 License

This project is licensed under the MIT License. Feel free to copy, modify, and use it for your own web development portfolio.

---

## ✉️ Author / Contact

*   **Developer**: Syahreza Satria
*   **Location**: Bandung, Indonesia
*   **GitHub**: [@syahreza-satria](https://github.com/syahreza-satria)
