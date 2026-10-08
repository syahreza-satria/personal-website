"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Youtube, Music, Code2, Layout, Info } from "lucide-react";
import SpotlightCard from "../SpotlightCard";

// Helper to determine the platform and icon based on the embed URL
const getPlatformDetails = (url) => {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) {
    return {
      name: "YouTube Video",
      icon: Youtube,
      color: "text-red-500",
      bg: "bg-red-500/10",
      borderColor: "group-hover:border-red-500/30"
    };
  }
  if (lowercaseUrl.includes("spotify.com")) {
    return {
      name: "Spotify Player",
      icon: Music,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      borderColor: "group-hover:border-emerald-500/30"
    };
  }
  if (lowercaseUrl.includes("codepen.io")) {
    return {
      name: "CodePen Sandbox",
      icon: Code2,
      color: "text-neutral-200",
      bg: "bg-neutral-200/10",
      borderColor: "group-hover:border-neutral-200/30"
    };
  }
  if (lowercaseUrl.includes("figma.com")) {
    return {
      name: "Figma Live Embed",
      icon: Layout,
      color: "text-lime-400",
      bg: "bg-lime-500/10",
      borderColor: "group-hover:border-lime-500/30"
    };
  }
  
  return {
    name: "Interactive Preview",
    icon: Info,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/30"
  };
};

export default function InteractiveEmbed({ src, title = "Live Embed", aspect = "video" }) {
  const [isLoading, setIsLoading] = useState(true);
  const platform = getPlatformDetails(src);
  const PlatformIcon = platform.icon;

  const aspectClass = {
    video: "aspect-[16/9]",
    square: "aspect-square",
    portrait: "aspect-[9/16]",
    figma: "h-[450px] w-full",
    spotify: "h-[352px] w-full"
  }[aspect] || "aspect-[16/9]";

  return (
    <SpotlightCard 
      className={`!p-0 overflow-hidden flex flex-col w-full border border-neutral-800 bg-neutral-900/40 backdrop-blur-md transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] ${platform.borderColor}`}
      spotlightColor="rgba(255, 255, 255, 0.05)"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/60 border-b border-neutral-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${platform.bg} ${platform.color} transition-transform duration-300 group-hover:scale-110`}>
            <PlatformIcon className="size-4" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-neutral-300 group-hover:text-white transition-colors duration-200">
            {platform.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60 transition-all cursor-pointer"
            title="Open in new tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Area */}
      <div className={`relative w-full overflow-hidden bg-neutral-950 ${aspectClass}`}>
        {/* Loading Spinner / Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950/90 gap-3">
            <Loader2 className="size-8 text-neutral-700 animate-spin" />
            <span className="text-xs text-neutral-500 tracking-widest uppercase font-semibold">Loading Live Canvas...</span>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </SpotlightCard>
  );
}
