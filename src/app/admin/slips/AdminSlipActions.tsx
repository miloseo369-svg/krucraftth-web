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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 ring-1 ring-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
};

export default function AdminSlipActions({ slips }: { slips: Slip[] }) {
  const router = useRouter();
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
    <>
      {/* Slip image viewer */}
      {viewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] p-4" onClick={() => setViewUrl(null)}>
          <img src={viewUrl} alt="slip" className="max-w-lg max-h-[80vh] rounded-2xl object-contain" />
        </div>
      )}

      <div className="space-y-4">
        {slips.length === 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center text-gray-600">
            ยังไม่มีสลิปรอตรวจสอบ
          </div>
        )}

        {slips.map((slip) => (
          <div key={slip.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex gap-5">
            {/* Thumbnail */}
            <button onClick={() => setViewUrl(slip.slip_url)} className="shrink-0">
              <img src={slip.slip_url} alt="slip" className="w-20 h-20 rounded-xl object-cover hover:opacity-80 transition" />
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-white">{slip.user?.full_name || "ไม่ทราบชื่อ"}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[slip.status]}`}>
                  {STATUS_LABELS[slip.status]}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-x-3">
                <span>{slip.item_type === "course" ? "คอร์ส" : "สินค้า"}</span>
                <span>฿{slip.amount.toLocaleString()}</span>
                <span>{new Date(slip.created_at).toLocaleDateString("th-TH")} {new Date(slip.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Actions */}
            {slip.status === "pending" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(slip.id, "approve")}
                  disabled={loadingId === slip.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  อนุมัติ
                </button>
                <button
                  onClick={() => handleAction(slip.id, "reject")}
                  disabled={loadingId === slip.id}
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                >
                  ปฏิเสธ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
