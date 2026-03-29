import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = { robots: "noindex, nofollow" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar — desktop */}
      <AdminSidebar />

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar — mobile only shows hamburger handled by sidebar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b lg:hidden" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
          <div className="flex items-center justify-between px-4 h-12">
            <Logo href="/admin" />
            <Link href="/dashboard" className="text-xs text-emerald-400 hover:text-emerald-300 transition">← กลับ</Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
