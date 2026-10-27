// Shown on Home and /projects when the `projects` table is empty or unreachable.
// Same shape as a `projects` row.
export const fallbackProjects = [
  {
    id: "1",
    title: "Personal Branding & Portfolio Platform",
    type: "hybrid",
    category: "Full-Stack & UI/UX Design",
    description:
      "A minimalist, high-performance personal branding website built with Next.js App Router, Tailwind CSS v4, and DaisyUI. Enforces a strict max-w-4xl layout constraint, high-contrast typography, and color-coded visual badges.",
    techstack: ["Next.js 16", "React 19", "Tailwind CSS", "DaisyUI", "Framer Motion"],
    status: "Live",
    image: "/images/brand-logo.png",
    github: "https://github.com/syahreza-satria/personal-website",
    demo_link: "https://syahreza-satria.xyz",
    role: "Full-Stack Engineer & Lead UI/UX Designer",
    features: [
      "Mobile-first responsive layout constrained strictly to max-w-4xl",
      "Color-coded visual badge system (Emerald for Dev, Purple for Creative, Gradient for Hybrid)",
      "Integrated Zen dark theme with DaisyUI component styling",
      "Multi-page architecture across Home, About, Projects, Experience, Gears, and Contact",
    ],
    gallery: [],
    project_date: "2024-08-01",
  },
  {
    id: "2",
    title: "Full-Stack Enterprise Management System",
    type: "dev",
    category: "Web Application",
    description:
      "Scalable enterprise web application featuring dynamic CRUD capabilities, database schema optimization, secure authentication, and REST API integrations.",
    techstack: ["Laravel", "React", "Supabase", "Tailwind CSS", "PostgreSQL"],
    status: "Completed",
    image: "",
    github: "https://github.com/syahreza-satria",
    demo_link: "#",
    role: "Lead Full-Stack Developer",
    features: [
      "Dynamic CRUD management modals with real-time state synchronization",
      "Custom authentication provider integration and OAuth security",
      "Optimized database indexing and schema performance",
    ],
    gallery: [],
    project_date: "2024-05-15",
  },
  {
    id: "3",
    title: "Digital Media & Stream Production System",
    type: "creative",
    category: "Digital Media & Design System",
    description:
      "Complete visual identity package including custom animated overlays, channel branding systems, stream broadcast layouts, and video production assets.",
    techstack: ["Figma", "Adobe Photoshop", "OBS Studio", "Content Strategy"],
    status: "Live",
    image: "",
    github: "#",
    demo_link: "https://youtube.com/@syahrezasatria",
    role: "Digital Media Creator & UI Designer",
    features: [
      "Custom animated broadcast overlay scenes and alerts",
      "Cohesive brand color tokens and typography system",
      "Multi-platform video asset export pipelines",
    ],
    gallery: [],
    project_date: "2024-03-10",
  },
  {
    id: "4",
    title: "Interactive Web Component Design System",
    type: "hybrid",
    category: "Design System & UI Engineering",
    description:
      "A modular, reusable React component library built with accessibility standards, smooth micro-interactions, and high contrast dark theme design tokens.",
    techstack: ["React", "Tailwind CSS", "Radix UI", "Framer Motion"],
    status: "Completed",
    image: "",
    github: "https://github.com/syahreza-satria",
    demo_link: "#",
    role: "UI Engineer & Component Architect",
    features: [
      "Accessible WAI-ARIA compliant dialogs and dropdown menus",
      "Framer Motion layout transitions and spring physics",
    ],
    gallery: [],
    project_date: "2023-11-20",
  },
];

// `status` comes back as a label or a boolean-ish string; always go through this.
// `dot` is the status marker: Live = accent, Completed = ink, still in progress = dashed ring.
export const getStatusConfig = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "live" || s === "true") return { text: "Live", dot: "bg-accent" };
  if (s === "in progress" || s === "false" || s === "") return { text: "In Progress", dot: "border-[1.5px] border-dashed border-ink" };
  if (s === "completed") return { text: "Completed", dot: "bg-ink" };
  if (s === "design phase") return { text: "Design Phase", dot: "border-[1.5px] border-dashed border-ink" };
  return { text: status || "Showcase", dot: "border-[1.5px] border-ink" };
};

// Normalised type key ("dev" | "creative" | "hybrid"). Besides the form's values it accepts the
// Badge aliases and the older "Web App" / "Design" values still stored in the table.
export const projectType = (type) => {
  const v = String(type || "").toLowerCase();
  if (v === "dev" || v === "developer" || v === "web app") return "dev";
  if (v === "creative" || v === "design") return "creative";
  return "hybrid";
};

export const typeLabels = { dev: "Dev", creative: "Creative", hybrid: "Hybrid" };

// "August 2024" / "Agustus 2024". Dates are stored as YYYY-MM-DD, so format in UTC to avoid an off-by-one month.
export const formatProjectDate = (date, lang) =>
  date
    ? new Date(date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    : "";

export const projectYear = (date) => (date ? String(new Date(date).getUTCFullYear()) : "");

// techstack may be an array or a JSON string
export const toList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
