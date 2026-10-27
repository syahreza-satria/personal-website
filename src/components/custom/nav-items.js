// Single source for site navigation (header pills, mobile menu) and shared outbound links.
// `name` is the English label and doubles as the translation key.
export const navItems = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Achievement", path: "/achievement" },
  { name: "Gears", path: "/gears" },
  { name: "Guestbook", path: "/guestbook" },
  { name: "Contact", path: "/contact" },
];

export const isPathActive = (pathname, path) =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

export const RESUME_URL =
  "https://drive.google.com/file/d/14riR0Zz1-02CrayQTaOxZ1Q-mYQHWVX4/view?usp=sharing";

export const socialLinks = [
  { name: "GitHub", url: "https://github.com/syahreza-satria" },
  { name: "LinkedIn", url: "https://linkedin.com/in/syahreza-satria" },
  { name: "Instagram", url: "https://instagram.com/syahreza.satria" },
  { name: "YouTube", url: "https://youtube.com/@syahrezasatria" },
];
