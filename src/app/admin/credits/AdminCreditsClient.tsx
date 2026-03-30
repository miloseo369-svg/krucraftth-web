"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface User { id: string; full_name: string | null; balance: number; total_earned: number; total_spent: number; }
interface Pricing { id: string; action: string; credits_cost: number; label: string; is_active: boolean; }

export default function AdminCreditsClient({ users, pricing }: { users: User[]; pricing: Pricing[] }) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const filtered = search ? users.filter((u) => u.full_name?.toLowerCase().includes(search.toLowerCase())) : users;
  const totalCredits = users.reduce((sum, u) => sum + u.balance, 0);

  async function handleAdjust(type: "add" | "deduct") {
    if (!selectedUser || !amount) { toast("กรุณาเลือกผู้ใช้และจำนวน", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/credits/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, amount: type === "add" ? amount : -amount, note: note || `Admin ${type === "add" ? "เติม" : "หัก"} ${amount} เครดิต` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(`${type === "add" ? "เติม" : "หัก"} ${amount} เครดิตสำเร็จ`, "success");
      setAmount(0); setNote(""); setSelectedUser("");
      router.refresh();
    } catch (err) { toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error"); }
    finally { setLoading(false); }
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>เครดิตรวมในระบบ</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalCredits.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>ผู้ใช้มีเครดิต</p>
          <p className="text-2xl font-bold text-white mt-1">{users.filter((u) => u.balance > 0).length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
          <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>ผู้ใช้ทั้งหมด</p>
          <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
        </div>
      </div>

      {/* Adjust credits */}
      <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-sm font-semibold text-white mb-4">เติม/หักเครดิต</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">เลือกผู้ใช้</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={inputClass}>
              <option value="">-- เลือก --</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.id} ({u.balance} เครดิต)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">จำนวนเครดิต</label>
            <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} min={1} placeholder="เช่น 100" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">หมายเหตุ</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ชำระเงิน ฿79" className={inputClass} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAdjust("add")} disabled={loading} className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">+ เติมเครดิต</button>
          <button onClick={() => handleAdjust("deduct")} disabled={loading} className="px-5 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50">- หักเครดิต</button>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">ผู้ใช้ทั้งหมด</h2>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อ..." className="px-3 py-1.5 rounded-lg text-xs outline-none bg-[var(--bg-primary)] border border-white/[0.07] text-white w-40" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filtered.slice(0, 20).map((u) => (
            <div key={u.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-xs font-bold shrink-0">{(u.full_name || "U")[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.full_name || "ไม่ทราบชื่อ"}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>ใช้ไป {u.total_spent} · เติมแล้ว {u.total_earned}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">{u.balance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-sm font-semibold text-white mb-3">ตั้งราคาเครดิต</h2>
        <p className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>แก้ไขได้ที่ Supabase Dashboard &gt; Table: credit_pricing</p>
        <div className="space-y-2">
          {pricing.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.05]" style={{ background: "var(--bg-primary)" }}>
              <span className="text-xs text-white">{p.label}</span>
              <span className="text-sm font-bold text-emerald-400">{p.credits_cost} เครดิต</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
