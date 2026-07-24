export const BrutalButton = ({ children, color = "bg-highlight", text = "text-foreground", className = "", ...props }: any) => (
  <button
    className={`px-6 py-3 ${color} ${text} border-2 border-foreground font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-foreground p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

export const BrutalBadge = ({ children, color = "bg-secondary", text = "text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-foreground text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

export const BrutalInput = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <input
      className="w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all"
      {...props}
    />
  </div>
);

export const BrutalTextarea = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      className="w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all resize-none"
      rows={4}
      {...props}
    />
  </div>
);

export const BrutalSelect = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <select
      className="w-full border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all"
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
