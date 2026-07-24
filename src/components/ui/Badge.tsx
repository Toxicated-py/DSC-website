import React from "react";

interface BrutalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  text?: string;
  children: React.ReactNode;
}

export const BrutalBadge = ({
  children,
  color = "bg-secondary",
  text = "text-white",
  className = "",
}: BrutalBadgeProps) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-foreground text-sm font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);
