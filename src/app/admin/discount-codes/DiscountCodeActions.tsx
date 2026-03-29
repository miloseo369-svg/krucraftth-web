"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface DiscountCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_price: number;
  max_uses: number | null;
  used_count: number;
  applies_to: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const APPLIES_LABELS: Record<string, string> = { all: "ทั้งหมด", course: "คอร์ส", product: "สินค้า" };

export default function DiscountCodeActions({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: 10,
    min_price: 0,
    max_uses: "" as string | number,
    applies_to: "all",
    is_active: true,
    expires_at: "",
  });

  function resetForm() {
    setForm({ code: "", discount_type: "percent", discount_value: 10, min_price: 0, max_uses: "", applies_to: "all", is_active: true, expires_at: "" });
    setEditingCode(null);
    setShowForm(false);
  }

  function openEdit(c: DiscountCode) {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_price: c.min_price,
      max_uses: c.max_uses ?? "",
      applies_to: c.applies_to,
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setEditingCode(c);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        max_uses: form.max_uses === "" ? null : Number(form.max_uses),
        expires_at: form.expires_at || null,
      };

      const method = editingCode ? "PUT" : "POST";
      const body = editingCode ? { id: editingCode.id, ...payload } : payload;

      const res = await fetch("/api/admin/discount-codes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      toast(editingCode ? "อัปเดตโค้ดสำเร็จ" : "สร้างโค้ดสำเร็จ", "success");
      resetForm();
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ยืนยันลบโค้ดนี้?")) return;
    try {
      const res = await fetch("/api/admin/discount-codes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      toast("ลบโค้ดสำเร็จ", "success");
      setCodes(codes.filter((c) => c.id !== id));
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    }
  }

  async function toggleActive(c: DiscountCode) {
    try {
      const res = await fetch("/api/admin/discount-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
      });
      if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ");
      setCodes(codes.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
      toast(!c.is_active ? "เปิดใช้งานโค้ด" : "ปิดใช้งานโค้ด", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    }
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "KC-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  }

  return (
    <div>
      {/* Create Button */}
      <button onClick={() => { resetForm(); setShowForm(true); }} className="mb-6 px-5 py-2.5 rounded-lg bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-95 transition-all">
        + สร้างโค้ดส่วนลด
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => resetForm()}>
          <div className="w-full max-w-lg rounded-xl border p-6 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-white mb-5">{editingCode ? "แก้ไขโค้ดส่วนลด" : "สร้างโค้ดส่วนลดใหม่"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-medium text-white block mb-1.5">โค้ด</label>
                <div className="flex gap-2">
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="เช่น SAVE20" required className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <button type="button" onClick={generateCode} className="px-3 py-2 rounded-lg text-xs font-medium border hover:bg-[var(--bg-hover)] transition" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>สุ่ม</button>
                </div>
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">ประเภท</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">{form.discount_type === "percent" ? "ส่วนลด (%)" : "ส่วนลด (฿)"}</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} min={1} max={form.discount_type === "percent" ? 100 : undefined} required className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>

              {/* Min Price + Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">ยอดขั้นต่ำ (฿)</label>
                  <input type="number" value={form.min_price} onChange={(e) => setForm({ ...form, min_price: Number(e.target.value) })} min={0} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">จำนวนสูงสุด (ว่าง = ไม่จำกัด)</label>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} min={1} placeholder="ไม่จำกัด" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>

              {/* Applies to + Expires */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">ใช้ได้กับ</label>
                  <select value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="all">ทั้งหมด</option>
                    <option value="course">คอร์สเท่านั้น</option>
                    <option value="product">สินค้าเท่านั้น</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white block mb-1.5">วันหมดอายุ</label>
                  <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-emerald-500" />
                <span className="text-sm text-white">เปิดใช้งาน</span>
              </label>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "กำลังบันทึก..." : editingCode ? "อัปเดต" : "สร้างโค้ด"}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-[var(--bg-hover)] transition" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Codes Table */}
      {codes.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่มีโค้ดส่วนลด</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กดปุ่ม &quot;สร้างโค้ดส่วนลด&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>โค้ด</th>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>ส่วนลด</th>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>ใช้ได้กับ</th>
                  <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>ใช้แล้ว</th>
                  <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>สถานะ</th>
                  <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {codes.map((c) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isMaxed = c.max_uses !== null && c.used_count >= c.max_uses;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--bg-hover)] transition">
                      <td className="px-5 py-3">
                        <span className="font-mono text-sm font-medium text-emerald-400">{c.code}</span>
                      </td>
                      <td className="px-5 py-3 text-white">
                        {c.discount_type === "percent" ? `${c.discount_value}%` : `฿${c.discount_value.toLocaleString()}`}
                        {c.min_price > 0 && <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>(ขั้นต่ำ ฿{c.min_price})</span>}
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                        {APPLIES_LABELS[c.applies_to] || c.applies_to}
                      </td>
                      <td className="px-5 py-3 text-center text-white">
                        {c.used_count}{c.max_uses !== null ? `/${c.max_uses}` : ""}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isExpired ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">หมดอายุ</span>
                        ) : isMaxed ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">ใช้ครบแล้ว</span>
                        ) : c.is_active ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ใช้งานได้</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">ปิดใช้งาน</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => toggleActive(c)} className={`px-2 py-1 rounded text-xs font-medium transition ${c.is_active ? "text-yellow-400 hover:bg-yellow-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}>
                            {c.is_active ? "ปิด" : "เปิด"}
                          </button>
                          <button onClick={() => openEdit(c)} className="px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition">แก้ไข</button>
                          <button onClick={() => handleDelete(c.id)} className="px-2 py-1 rounded text-xs font-medium text-red-400 hover:bg-red-500/10 transition">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
