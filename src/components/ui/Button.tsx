import React from "react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { prefersReducedMotion } from "../../utils/animations";

interface BrutalButtonProps extends HTMLMotionProps<"button"> {
  color?: string;
  text?: string;
  children: React.ReactNode;
}

export const BrutalButton = ({
  children,
  color = "bg-highlight",
  text = "text-foreground",
  className = "",
  ...props
}: BrutalButtonProps) => (
  <motion.button
    whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
    transition={{ duration: prefersReducedMotion ? 0 : 0.1 }}
    className={`inline-flex max-w-full items-center justify-center gap-2 px-6 py-3 text-center ${color} ${text} border-2 border-foreground font-bold uppercase tracking-widest whitespace-normal break-words brutal-shadow brutal-shadow-hover transition-all ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);
