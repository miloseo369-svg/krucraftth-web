import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PublicNav({ active }: { active?: "courses" | "shop" }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-semibold text-emerald-400">KruCraft</Link>
        <div className="flex items-center gap-5">
          <Link href="/courses" className={`text-sm transition ${active === "courses" ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>คอร์สเรียน</Link>
          <Link href="/shop" className={`text-sm transition ${active === "shop" ? "text-white font-medium" : "text-[var(--text-secondary)] hover:text-white"}`}>ร้านค้า</Link>
          {user ? (
            <Link href="/dashboard" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">แดชบอร์ด</Link>
          ) : (
            <Link href="/login" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">เข้าสู่ระบบ</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
