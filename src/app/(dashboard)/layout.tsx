import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "student";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-emerald-400">KruCraft</Link>
            {role === "student" && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">ผู้เรียน</span>}
            {role === "instructor" && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">ผู้สอน</span>}
            {role === "admin" && <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">Admin</span>}
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-white transition">แดชบอร์ด</Link>
              <Link href="/courses" className="text-sm text-[var(--text-secondary)] hover:text-white transition">คอร์สเรียน</Link>
              <Link href="/shop" className="text-sm text-[var(--text-secondary)] hover:text-white transition">ร้านค้า</Link>
              <Link href="/orders" className="text-sm text-[var(--text-secondary)] hover:text-white transition">คำสั่งซื้อ</Link>
              <Link href="/affiliate" className="text-sm text-[var(--text-secondary)] hover:text-white transition">แนะนำเพื่อน</Link>
              {(role === "instructor" || role === "admin") && <Link href="/instructor" className="text-sm text-[var(--text-secondary)] hover:text-white transition">ผู้สอน</Link>}
              {role === "admin" && <Link href="/admin" className="text-sm text-[var(--text-secondary)] hover:text-white transition">จัดการระบบ</Link>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
