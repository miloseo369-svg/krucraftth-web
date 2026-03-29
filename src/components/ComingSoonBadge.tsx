interface Props {
  label?: string;
  size?: "sm" | "md";
}

export default function ComingSoonBadge({ label = "กำลังพัฒนา", size = "sm" }: Props) {
  const s = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-xs px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1 ${s} rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium`}>
      <svg className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {label}
    </span>
  );
}
