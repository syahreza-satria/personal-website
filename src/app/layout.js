import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { MotionProvider } from "@/providers/MotionProvider";
import PageTransitionLoader from "@/components/custom/PageTransitionLoader";
import Sidebar from "@/components/custom/Sidebar";
import Topbar from "@/components/custom/Topbar";
import Footer from "@/components/custom/Footer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-black text-neutral-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300"
        suppressHydrationWarning
      >
        <MotionProvider>
        <LanguageProvider>
        <AuthProvider>
          <PageTransitionLoader />
          <Sidebar />
          <div className="min-h-screen flex flex-col lg:pl-64">
            <Topbar />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              {children}
            </main>
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
