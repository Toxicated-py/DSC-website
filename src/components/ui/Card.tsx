import React from "react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { prefersReducedMotion } from "../../utils/animations";

interface BrutalCardProps extends HTMLMotionProps<"div"> {
  color?: string;
  rotate?: string;
  children: React.ReactNode;
}

export const BrutalCard = ({
  children,
  className = "",
  color = "bg-white",
  rotate = "rotate-0",
  ...props
}: BrutalCardProps) => (
  <motion.div
    whileHover={prefersReducedMotion ? undefined : { y: -4 }}
    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
    className={`border-2 border-foreground p-6 brutal-shadow-lg ${color} ${rotate} ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
