"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

import Logo from "@/components/Logo";

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  created_at: string;
}

interface Payout {
  id: string;
  order_id: string;
  commission_amount: number;
  status: string;
  created_at: string;
}

interface Props {
  affiliate: Affiliate | null;
  payouts: Payout[];
  stats: { totalEarned: number; pendingAmount: number; paidAmount: number; totalReferrals: number };
  userName: string;
  role: string;
}

export default function AffiliateDashboard({ affiliate, payouts, stats, userName, role }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleJoin() {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      toast("สมัครเป็น Affiliate สำเร็จ!", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!affiliate) return;
    const link = `${window.location.origin}?ref=${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast("คัดลอกลิงก์แล้ว!", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  const statCards = [
    { label: "รายได้ทั้งหมด", value: `฿${stats.totalEarned.toLocaleString()}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "รอจ่าย", value: `฿${stats.pendingAmount.toLocaleString()}`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "จ่ายแล้ว", value: `฿${stats.paidAmount.toLocaleString()}`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "การแนะนำ", value: stats.totalReferrals.toString(), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="text-sm font-medium text-white">Affiliate Program</span>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            แดชบอร์ด
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!affiliate ? (
          /* Not yet affiliate — Join page */
          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-white">แนะนำเพื่อน รับส่วนแบ่ง</h1>
            <p className="text-sm mt-3 max-w-sm mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
              สมัครเป็น Affiliate แชร์ลิงก์แนะนำ เมื่อเพื่อนซื้อคอร์สหรือสินค้าผ่านลิงก์ของคุณ คุณจะได้รับค่าคอมมิชชัน 30%
            </p>

            <div className="grid grid-cols-3 gap-4 mt-10 mb-10">
              {[
                { step: "1", title: "สมัคร", desc: "กดสมัครเป็น Affiliate" },
                { step: "2", title: "แชร์ลิงก์", desc: "คัดลอกลิงก์ส่งให้เพื่อน" },
                { step: "3", title: "รับเงิน", desc: "ได้ค่าคอมมิชชัน 30%" },
              ].map((s) => (
                <div key={s.step} className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center justify-center mx-auto mb-2">{s.step}</div>
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={handleJoin} disabled={loading} className="px-8 py-3 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {loading ? "กำลังสมัคร..." : "สมัครเป็น Affiliate →"}
            </button>
          </div>
        ) : (
          /* Dashboard */
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white">Affiliate Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>สวัสดี, {userName}</p>
            </div>

            {/* Referral Link */}
            <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white">ลิงก์แนะนำของคุณ</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">คอมมิชชัน {(affiliate.commission_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono truncate" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  {typeof window !== "undefined" ? `${window.location.origin}?ref=${affiliate.referral_code}` : `https://yoursite.com?ref=${affiliate.referral_code}`}
                </div>
                <button onClick={copyLink} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${copied ? "bg-emerald-500 text-black" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"}`}>
                  {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                รหัสแนะนำ: <span className="font-mono text-emerald-400">{affiliate.referral_code}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Payout History */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-sm font-medium text-white">ประวัติค่าคอมมิชชัน</h2>
              </div>
              {payouts.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm font-medium text-white">ยังไม่มีรายการ</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>แชร์ลิงก์แนะนำเพื่อเริ่มสร้างรายได้</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>วันที่</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>รายการ</th>
                        <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>จำนวน</th>
                        <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-[var(--bg-hover)] transition">
                          <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                            {new Date(p.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                          </td>
                          <td className="px-5 py-3 text-white">#{p.order_id?.slice(0, 8) || "—"}</td>
                          <td className="px-5 py-3 text-right font-medium text-emerald-400">฿{p.commission_amount.toLocaleString()}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              p.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.status === "rejected"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}>
                              {p.status === "paid" ? "จ่ายแล้ว" : p.status === "rejected" ? "ปฏิเสธ" : "รอจ่าย"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
