"use client";

import { useContext } from "react";
import { LanguageContext } from "@/providers/LanguageProvider";

export const useLanguage = () => useContext(LanguageContext);
