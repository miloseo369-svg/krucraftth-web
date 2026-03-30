import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
export const metadata: Metadata = { title: "แดชบอร์ดแอดมิน" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: usersCount },
    { count: newUsersWeek },
    { count: pendingSlips },
    { data: recentSlips },
    { data: monthlyPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("payment_slips").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payment_slips").select("*, user:profiles!user_id(full_name), course:courses(title)").order("created_at", { ascending: false }).limit(10),
    supabase.from("payment_slips").select("amount, status").gte("created_at", monthStart).eq("status", "approved"),
  ]);

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

  const thaiMonth = now.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">ภาพรวม</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{thaiMonth}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">รายได้เดือนนี้</p>
          <p className="text-3xl font-bold text-emerald-400">฿{monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">ผู้ใช้ทั้งหมด</p>
          <p className="text-3xl font-bold text-blue-400">{(usersCount ?? 0).toLocaleString()}</p>
          {(newUsersWeek ?? 0) > 0 && <p className="text-[10px] text-emerald-400 mt-1">+{newUsersWeek} สัปดาห์นี้</p>}
        </div>
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">สลิปรอตรวจ</p>
          <p className={`text-3xl font-bold ${(pendingSlips ?? 0) > 0 ? "text-yellow-400" : "text-emerald-400"}`}>{pendingSlips ?? 0}</p>
          {(pendingSlips ?? 0) > 0 && <p className="text-[10px] text-yellow-400 mt-1">รอดำเนินการ</p>}
        </div>
      </div>

      {/* Recent Slips Table */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">สลิปล่าสุด</h2>
          <Link href="/admin/slips" className="text-xs text-emerald-400 hover:text-emerald-300 transition">ดูทั้งหมด →</Link>
        </div>

        {recentSlips && recentSlips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-5 py-3">ผู้ใช้</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-5 py-3">คอร์ส</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-5 py-3">จำนวน</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-5 py-3">สถานะ</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-5 py-3">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {recentSlips.map((slip) => (
                  <tr key={slip.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3 text-white text-xs">{slip.user?.full_name || "—"}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)] text-xs truncate max-w-[200px]">{slip.course?.title || slip.item_type}</td>
                    <td className="px-5 py-3 text-white text-xs font-medium">฿{slip.amount}</td>
                    <td className="px-5 py-3">
                      {slip.status === "pending" ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">รอตรวจ</span>
                      ) : slip.status === "approved" ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">อนุมัติ</span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">ปฏิเสธ</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs whitespace-nowrap">{formatRelative(slip.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">ยังไม่มีรายการ</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "เมื่อกี้";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ชม.ที่แล้ว`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 0) return "วันนี้";
  if (diffD === 1) return "เมื่อวาน";
  return `${diffD} วันที่แล้ว`;
}
