"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import { showConfirm } from "@/components/ConfirmModal";

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = { admin: "ผู้ดูแล", instructor: "ผู้สอน", student: "ผู้เรียน" };
const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-400 border border-purple-500/20",
  instructor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  student: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/20",
};

export default function AdminUserActions({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userId === currentUserId) { showToast("ไม่สามารถเปลี่ยน role ตัวเองได้", "error"); return; }
    const user = users.find((u) => u.id === userId);
    if (!(await showConfirm(`เปลี่ยน ${user?.full_name || "ผู้ใช้"} เป็น "${ROLE_LABELS[newRole]}" ใช่หรือไม่?`))) return;
    setLoadingId(userId);
    const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: newRole }) });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "เปลี่ยน role ไม่สำเร็จ", "error"); }
    if (res.ok) showToast("เปลี่ยนบทบาทสำเร็จ", "success");
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
      <table className="w-full text-left">
        <thead className="border-b border-white/[0.07]">
          <tr>
            <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ผู้ใช้</th>
            <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">บทบาท</th>
            <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">สมัครเมื่อ</th>
            <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">เปลี่ยนบทบาท</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-white/[0.03] transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-[var(--text-muted)] text-xs font-bold">
                      {(u.full_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">
                      {u.full_name || "-"}
                      {u.id === currentUserId && <span className="text-xs text-[var(--text-muted)] ml-2">(คุณ)</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[u.role] || ROLE_STYLES.student}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                {new Date(u.created_at).toLocaleDateString("th-TH")}
              </td>
              <td className="px-6 py-4">
                {u.id === currentUserId ? (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>-</span>
                ) : (
                  <select
                    value={u.role}
                    disabled={loadingId === u.id}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className="text-sm border border-white/[0.07] text-white rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:opacity-50 bg-[var(--bg-primary)]"
                  >
                    <option value="student">ผู้เรียน</option>
                    <option value="instructor">ผู้สอน</option>
                    <option value="admin">ผู้ดูแล</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-20 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <p className="text-sm font-medium text-white">ยังไม่มีผู้ใช้</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ผู้ใช้จะปรากฏเมื่อมีการสมัครสมาชิก</p>
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
