import React from "react";

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const BrutalInput = ({ label, className = "", ...props }: BrutalInputProps) => (
  <label className="mb-4 block w-full">
    {label && <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>}
    <input
      className={`w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all ${className}`}
      {...props}
    />
  </label>
);

interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const BrutalTextarea = ({ label, className = "", rows = 4, ...props }: BrutalTextareaProps) => (
  <label className="mb-4 block w-full">
    {label && <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>}
    <textarea
      className={`w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all resize-y ${className}`}
      rows={rows}
      {...props}
    />
  </label>
);

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
      className="w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all"
    />
  </label>
);

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
      className="w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all resize-y"
    />
  </label>
);
