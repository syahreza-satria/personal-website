"use client";

import { motion } from "framer-motion";
import { ease } from "@/constants/animation";

// A template (unlike a layout) re-mounts on every navigation, so each page fades in.
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      {children}
    </motion.div>
  );
}
