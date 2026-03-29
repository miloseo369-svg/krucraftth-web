import Link from "next/link";

const links = [
  { href: "/admin", label: "แดชบอร์ด" },
  { href: "/admin/courses", label: "คอร์ส" },
  { href: "/admin/products", label: "สินค้า" },
  { href: "/admin/slips", label: "ตรวจสลิป" },
  { href: "/admin/users", label: "ผู้ใช้" },
  { href: "/admin/discount-codes", label: "โค้ดส่วนลด" },
  { href: "/admin/settings", label: "ตั้งค่า" },
  { href: "/admin/logs", label: "Log" },
];

export default function AdminNav({ active }: { active?: string }) {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <Link href="/admin" className="text-lg font-semibold text-emerald-400 shrink-0">KruCraft</Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-sm shrink-0 transition ${active === l.href ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/dashboard" className="shrink-0 ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          กลับ
        </Link>
      </div>
    </nav>
  );
}
