import { forwardRef } from "react";

const variants = {
  primary: "bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/10",
  secondary: "bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-primary)]",
  ghost: "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]",
  danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button2 = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button2.displayName = "Button2";
export default Button2;
