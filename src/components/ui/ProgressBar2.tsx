export default function ProgressBar2({ percent, showLabel = true, className = "" }: { percent: number; showLabel?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${percent >= 100 ? "bg-emerald-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium shrink-0 ${percent >= 100 ? "text-emerald-400" : "text-[var(--text-secondary)]"}`}>
          {percent}%
        </span>
      )}
    </div>
  );
}
