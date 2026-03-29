interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export default function Card2({ hover, glow, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl ${
        hover ? "hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all duration-200" : ""
      } ${glow ? "hover:shadow-[0_0_30px_var(--accent-glow)]" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
