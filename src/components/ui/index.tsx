import React from "react";

// ==================== BUTTON ====================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "purple" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const BTN_VARIANTS: Record<string, string> = {
  primary: "bg-[var(--em)] text-white hover:brightness-110 shadow-lg shadow-emerald-500/15",
  secondary: "bg-[var(--bg-overlay)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]",
  ghost: "bg-transparent text-[var(--text-secondary)] border border-[var(--border-dim)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]",
  purple: "bg-[var(--purple-dim)] text-purple-400 border border-[var(--purple-border)] hover:brightness-110",
  danger: "bg-[var(--red-dim)] text-red-400 border border-red-500/30 hover:brightness-110",
};

const BTN_SIZES: Record<string, string> = {
  sm: "h-8 px-3 text-xs rounded-[var(--r-md)]",
  md: "h-10 px-4 text-[13px] rounded-[var(--r-md)]",
  lg: "h-12 px-6 text-[15px] rounded-[var(--r-lg)]",
};

export function Button({ variant = "primary", size = "md", loading, disabled, className = "", children, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

// ==================== BADGE ====================
interface BadgeProps { variant?: "em" | "purple" | "amber" | "red" | "blue" | "gray"; children: React.ReactNode; className?: string; }

const BADGE_VARIANTS: Record<string, string> = {
  em: "bg-[var(--em-dim)] text-emerald-400 border border-[var(--em-border)]",
  purple: "bg-[var(--purple-dim)] text-purple-400 border border-[var(--purple-border)]",
  amber: "bg-[var(--amber-dim)] text-amber-400 border border-amber-500/30",
  red: "bg-[var(--red-dim)] text-red-400 border border-red-500/30",
  blue: "bg-[var(--blue-dim)] text-blue-400 border border-blue-500/30",
  gray: "bg-white/5 text-[var(--text-secondary)] border border-[var(--border-subtle)]",
};

export function Badge({ variant = "em", children, className = "" }: BadgeProps) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${BADGE_VARIANTS[variant]} ${className}`}>{children}</span>;
}

// ==================== CARD ====================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { hover?: boolean; }

export function Card({ hover, className = "", children, ...props }: CardProps) {
  return (
    <div className={`bg-[var(--bg-raised)] border border-[var(--border-dim)] rounded-[var(--r-xl)] p-5 ${hover ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-subtle)] cursor-pointer" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps { label: string; value: string | number; sub?: string; subColor?: "green" | "amber" | "red" | "gray"; icon?: React.ReactNode; valueColor?: string; }

const SUB_COLORS: Record<string, string> = { green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400", gray: "text-[var(--text-muted)]" };

export function StatCard({ label, value, sub, subColor = "gray", icon, valueColor }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1.5">{label}</p>
          <p className={`text-[26px] font-bold tracking-tight ${valueColor || "text-[var(--text-primary)]"}`} style={{ fontFamily: "'Sora', sans-serif" }}>{value}</p>
          {sub && <p className={`text-[11px] mt-1 ${SUB_COLORS[subColor]}`}>{sub}</p>}
        </div>
        {icon && <div className="text-[var(--text-muted)]">{icon}</div>}
      </div>
    </Card>
  );
}

// ==================== INPUT ====================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1.5 tracking-wide">{label}</label>}
      <input className={`w-full h-10 bg-[var(--bg-overlay)] border ${error ? "border-red-500/50 focus:border-red-500" : "border-[var(--border-subtle)] focus:border-[var(--em)]"} rounded-[var(--r-md)] px-3.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:bg-[var(--bg-hover)] transition-colors duration-150 ${className}`} style={{ fontSize: "16px" }} {...props} />
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ==================== SECTION LABEL ====================
export function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[10px] font-semibold tracking-[0.10em] uppercase text-[var(--text-muted)] ${className}`}>{children}</p>;
}

// ==================== PROGRESS BAR ====================
export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-white/[0.08] rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-[var(--em)] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}
