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
  admin: "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30",
  instructor: "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30",
  student: "bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30",
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
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-gray-800">
          <tr>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">สมัครเมื่อ</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">เปลี่ยนบทบาท</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-800/50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold">
                      {(u.full_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">
                      {u.full_name || "-"}
                      {u.id === currentUserId && <span className="text-xs text-gray-500 ml-2">(คุณ)</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[u.role] || ROLE_STYLES.student}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(u.created_at).toLocaleDateString("th-TH")}
              </td>
              <td className="px-6 py-4">
                {u.id === currentUserId ? (
                  <span className="text-xs text-gray-600">-</span>
                ) : (
                  <select
                    value={u.role}
                    disabled={loadingId === u.id}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className="text-sm bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
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
            <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-600">ยังไม่มีผู้ใช้</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
