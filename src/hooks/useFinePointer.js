"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

const subscribe = (onChange) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server (and the hydration pass) always sees `false`, so cursor-only effects render
// nothing until the client knows it has a mouse/trackpad. No hydration mismatch.
const getServerSnapshot = () => false;

// True on devices with a precise, hover-capable pointer (mouse / trackpad).
export function useFinePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
