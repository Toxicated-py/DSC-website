import React from "react";

// ─── BRUTAL BUTTON ─────────────────────────────────────────────────────────────
interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  text?: string;
  children: React.ReactNode;
}

export const BrutalButton = ({
  children,
  color = "bg-[#FFE800]",
  text = "text-[#171717]",
  className = "",
  ...props
}: BrutalButtonProps) => (
  <button
    className={`inline-flex max-w-full items-center justify-center gap-2 px-6 py-3 text-center ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest whitespace-normal break-words brutal-shadow brutal-shadow-hover transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ─── BRUTAL CARD ───────────────────────────────────────────────────────────────
interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${rotate} ${className}`} {...props}>
    {children}
  </div>
);

// ─── BRUTAL BADGE ──────────────────────────────────────────────────────────────
interface BrutalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  text?: string;
  children: React.ReactNode;
}

export const BrutalBadge = ({
  children,
  color = "bg-[#FB7185]",
  text = "text-white",
  className = ""
}: BrutalBadgeProps) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

// ─── BRUTAL INPUT ──────────────────────────────────────────────────────────────
interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const BrutalInput = ({ label, className = "", ...props }: BrutalInputProps) => (
  <label className="mb-4 block w-full">
    {label && <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>}
    <input
      className={`w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all ${className}`}
      {...props}
    />
  </label>
);

// ─── BRUTAL TEXTAREA ───────────────────────────────────────────────────────────
interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const BrutalTextarea = ({ label, className = "", rows = 4, ...props }: BrutalTextareaProps) => (
  <label className="mb-4 block w-full">
    {label && <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>}
    <textarea
      className={`w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-y ${className}`}
      rows={rows}
      {...props}
    />
  </label>
);

// ─── BRUTAL FIELD (Custom State Friendly) ──────────────────────────────────────
interface BrutalFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export const BrutalField = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: BrutalFieldProps) => (
  <label className="block mb-4">
    <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
    />
  </label>
);

// ─── BRUTAL TEXT AREA (Custom State Friendly) ──────────────────────────────────
interface BrutalTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const BrutalTextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 6,
}: BrutalTextAreaProps) => (
  <label className="block mb-4">
    <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-y"
    />
  </label>
);
