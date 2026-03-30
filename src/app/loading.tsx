export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">กำลังโหลด...</span>
      </div>
    </div>
  );
}
