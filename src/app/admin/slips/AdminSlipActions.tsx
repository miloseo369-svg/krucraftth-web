"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import { showConfirm } from "@/components/ConfirmModal";

interface Slip {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  amount: number;
  slip_url: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  user?: { full_name: string | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
};

export default function AdminSlipActions({ slips }: { slips: Slip[] }) {
  const router = useRouter();
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? slips : slips.filter((s) => s.status === filter);

  const handleAction = async (slipId: string, action: "approve" | "reject") => {
    const label = action === "approve" ? "อนุมัติ" : "ปฏิเสธ";
    if (!(await showConfirm(`${label}สลิปนี้?`))) return;

    setLoadingId(slipId);
    const res = await fetch("/api/admin/slips", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slipId, action }),
    });

    if (res.ok) {
      showToast(`${label}สลิปสำเร็จ`, "success");
    } else {
      const d = await res.json();
      showToast(d.error || "เกิดข้อผิดพลาด", "error");
    }

    setLoadingId(null);
    router.refresh();
  };

  const pendingCount = slips.filter((s) => s.status === "pending").length;

  return (
    <>
      {/* Lightbox */}
      {viewUrl && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setViewUrl(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative max-w-2xl w-full animate-fade-in">
            <img src={viewUrl} alt="slip" className="w-full max-h-[85vh] rounded-2xl object-contain" />
            <button onClick={() => setViewUrl(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>คลิกนอกรูปเพื่อปิด · ซูมด้วย Ctrl+Scroll</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "all", label: "ทั้งหมด", count: slips.length },
          { key: "pending", label: "รอตรวจ", count: pendingCount },
          { key: "approved", label: "อนุมัติแล้ว", count: slips.filter((s) => s.status === "approved").length },
          { key: "rejected", label: "ปฏิเสธ", count: slips.filter((s) => s.status === "rejected").length },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "border border-white/[0.07] hover:bg-white/5"}`} style={filter !== f.key ? { color: "var(--text-secondary)" } : {}}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Slip list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-20 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-sm font-medium text-white">ไม่มีรายการ</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ลองเปลี่ยนตัวกรองเพื่อดูรายการอื่น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((slip) => (
            <div key={slip.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-5 flex flex-col sm:flex-row gap-4 hover:border-white/[0.12] transition-all duration-300">
              {/* Thumbnail — click to lightbox */}
              <button onClick={() => setViewUrl(slip.slip_url)} className="shrink-0 group relative">
                <img src={slip.slip_url} alt="slip" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover group-hover:brightness-75 transition-all duration-300" />
                <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  </div>
                </div>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-white">{slip.user?.full_name || "ไม่ทราบชื่อ"}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    slip.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : slip.status === "rejected"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {STATUS_LABELS[slip.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                    {slip.item_type === "course" ? "คอร์ส" : "สินค้า"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-white">
                    ฿{slip.amount.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(slip.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })} {new Date(slip.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {slip.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0 sm:self-center">
                  <button
                    onClick={() => handleAction(slip.id, "approve")}
                    disabled={loadingId === slip.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => handleAction(slip.id, "reject")}
                    disabled={loadingId === slip.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ปฏิเสธ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
