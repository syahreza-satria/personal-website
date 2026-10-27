"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// next/link with motion props (whileHover, variants). Created once here, not per render.
const MotionLink = motion.create(Link);

export default MotionLink;
