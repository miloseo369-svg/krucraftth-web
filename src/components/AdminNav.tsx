import Link from "next/link";
import Logo from "@/components/Logo";

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
    <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center justify-between h-12 sm:h-14">
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide">
          <Logo href="/admin" />
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-xs sm:text-sm shrink-0 transition ${active === l.href ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/dashboard" className="shrink-0 ml-3 sm:ml-4 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-all">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">กลับ</span>
        </Link>
      </div>
    </nav>
  );
}
