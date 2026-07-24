import type { Transition, Variants } from "motion/react";

export const prefersReducedMotion =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export const safeTransition: Transition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.35, ease: "easeOut" };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
  visible: { opacity: 1, y: 0, transition: safeTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: safeTransition },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -40 },
  visible: { opacity: 1, x: 0, transition: safeTransition },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 40 },
  visible: { opacity: 1, x: 0, transition: safeTransition },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 } },
};

export const curtainWipe: Variants = {
  hidden: { scaleX: 1, transformOrigin: "left" },
  visible: {
    scaleX: 0,
    transformOrigin: "left",
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: "easeInOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" },
  },
};

export const defaultViewport = { once: true, margin: "-60px" } as const;
