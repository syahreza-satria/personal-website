"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExperienceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/about#experience");
  }, [router]);

  return (
    <div className="py-24 text-center text-neutral-400 text-sm ">
      Redirecting to About & Experience...
    </div>
  );
}
