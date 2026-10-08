import {
  PiHouseBold,
  PiUserBold,
  PiProjectorScreenChartBold,
  PiCertificateBold,
  PiLaptopBold,
  PiChatTextBold,
  PiEnvelopeSimpleBold,
} from "react-icons/pi";

export const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/", icon: PiHouseBold },
      { name: "About", path: "/about", icon: PiUserBold },
    ],
  },
  {
    label: "Work",
    items: [
      { name: "Projects", path: "/projects", icon: PiProjectorScreenChartBold },
      { name: "Achievement", path: "/achievement", icon: PiCertificateBold },
      { name: "Gears", path: "/gears", icon: PiLaptopBold },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Guestbook", path: "/guestbook", icon: PiChatTextBold },
      { name: "Contact", path: "/contact", icon: PiEnvelopeSimpleBold },
    ],
  },
];

export const allNavItems = navSections.flatMap((s) => s.items);

export const isPathActive = (pathname, path) =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

export const RESUME_URL =
  "https://drive.google.com/file/d/14riR0Zz1-02CrayQTaOxZ1Q-mYQHWVX4/view?usp=sharing";
