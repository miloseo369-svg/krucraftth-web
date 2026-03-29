export default function StatCard2({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string | number; className?: string }) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
