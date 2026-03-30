"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "หน้าแรก", svg: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/courses", label: "คอร์ส", svg: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/shop", label: "ร้านค้า", svg: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { href: "/doc-creator", label: "โปรไฟล์", svg: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t backdrop-blur-xl pb-safe" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((t) => {
          const active = t.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition ${active ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.svg} /></svg>
              <span className="text-[9px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
