import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = { robots: "noindex, nofollow" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = await requireAdmin();

  const { count: pendingSlips } = await supabase.from("payment_slips").select("*", { count: "exact", head: true }).eq("status", "pending");

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      <AdminSidebar pendingSlips={pendingSlips ?? 0} />

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b lg:hidden" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
          <div className="flex items-center justify-between px-4 h-12">
            <Logo href="/admin" />
            <Link href="/dashboard" className="text-xs text-emerald-400 hover:text-emerald-300 transition">← กลับ</Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
