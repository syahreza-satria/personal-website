import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { MotionProvider } from "@/providers/MotionProvider";
import PageTransitionLoader from "@/components/custom/PageTransitionLoader";
import SiteHeader from "@/components/custom/SiteHeader";
import CursorFollower from "@/components/custom/CursorFollower";
import Footer from "@/components/custom/Footer";
import { Analytics } from "@vercel/analytics/react";

// Display face for headings (`font-display`), body face for everything else (`font-sans`).
// Bricolage is loaded as a variable font (no `weight` list) so the hero can animate its "wght" axis;
// font-bold / font-extrabold still map to 700 / 800 on that axis.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL("https://syahreza-satria.xyz"),
  title: {
    default: "Syahreza Satria — Hybrid Developer & Creative Specialist",
    template: "%s | Syahreza Satria",
  },
  description:
    "Personal branding website of Syahreza Satria, operating at the intersection of Software/Web Development and Creative Work (UI/UX Design, Digital Media, Content Creation).",
  keywords: [
    "Syahreza Satria",
    "Hybrid Developer",
    "Software Engineer",
    "UI/UX Designer",
    "Full-stack Developer",
    "Content Creator",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Bandung",
    "Indonesia",
  ],
  authors: [{ name: "Syahreza Satria", url: "https://syahreza-satria.xyz" }],
  creator: "Syahreza Satria",
  publisher: "Syahreza Satria",
  openGraph: {
    title: "Syahreza Satria — Where Code Meets Creativity",
    description:
      "Portfolio & personal branding of Syahreza Satria. Hybrid Software Engineer & Creative Specialist.",
    url: "https://syahreza-satria.xyz",
    siteName: "Syahreza Satria Personal Branding",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Syahreza Satria Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syahreza Satria — Hybrid Developer & Creative Specialist",
    description:
      "Where Code Meets Creativity. Web Development, UI/UX Design, and Digital Media.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent selection:text-ink"
        suppressHydrationWarning
      >
        <MotionProvider>
        <LanguageProvider>
        <AuthProvider>
          <PageTransitionLoader />
          <CursorFollower />
          <div className="min-h-screen flex flex-col max-w-[1240px] w-full mx-auto px-5">
            <SiteHeader />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </div>
          <Analytics />
        </AuthProvider>
        </LanguageProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
