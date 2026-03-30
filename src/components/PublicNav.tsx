import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import Logo from "@/components/Logo";

export default async function PublicNav({ active }: { active?: "courses" | "shop" }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const credits = user ? await getBalance(user.id) : 0;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/courses" className={`text-sm transition ${active === "courses" ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>คอร์สเรียน</Link>
          <Link href="/shop" className={`text-sm transition ${active === "shop" ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>ร้านค้า</Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/credits" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[11px] font-medium text-emerald-400">{credits.toLocaleString()}</span>
              </Link>
              <Link href="/dashboard" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">แดชบอร์ด</Link>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">เข้าสู่ระบบ</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
