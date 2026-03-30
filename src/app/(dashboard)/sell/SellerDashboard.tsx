"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string;
  price: number;
  category: string;
  is_published: boolean;
  approval_status: string;
  commission_rate: number;
  created_at: string;
}

interface Stats {
  totalEarned: number;
  pendingAmount: number;
  paidAmount: number;
  totalProducts: number;
}

const CATEGORIES = [
  { value: "worksheet", label: "ใบงาน" },
  { value: "ebook", label: "E-Book" },
  { value: "template", label: "Template" },
  { value: "material", label: "สื่อการสอน" },
];

export default function SellerDashboard({ products, stats }: { products: Product[]; stats: Stats }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("worksheet");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  function resetForm() {
    setTitle(""); setDescription(""); setPrice(0); setCategory("worksheet"); setThumbnailUrl(""); setFileUrl(""); setShowForm(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "file") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const d = await res.json();
      if (type === "thumbnail") setThumbnailUrl(d.url);
      else setFileUrl(d.url);
    } else showToast("อัพโหลดไม่สำเร็จ", "error");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileUrl) { showToast("กรุณาอัพโหลดไฟล์สินค้า", "error"); return; }
    setLoading(true);

    const res = await fetch("/api/seller/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price, category, thumbnail_url: thumbnailUrl, file_url: fileUrl }),
    });
    const data = await res.json();

    if (!res.ok) { showToast(data.error || "เกิดข้อผิดพลาด", "error"); setLoading(false); return; }
    showToast("ส่งสินค้าสำเร็จ! รอ Admin อนุมัติ", "success");
    resetForm();
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบสินค้านี้?")) return;
    const res = await fetch("/api/seller/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { showToast("ลบสำเร็จ", "success"); router.refresh(); }
    else { const d = await res.json(); showToast(d.error || "ลบไม่สำเร็จ", "error"); }
  }

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: "รออนุมัติ", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    approved: { text: "อนุมัติแล้ว", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { text: "ไม่อนุมัติ", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white placeholder:text-[var(--text-muted)] focus:border-emerald-500/40";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">ฝากขายสินค้า</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">อัพโหลดใบงาน, E-Book, Template แล้วรับรายได้ 70% จากทุกยอดขาย</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">
          + เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "สินค้าทั้งหมด", value: String(stats.totalProducts), color: "text-blue-400" },
          { label: "รายได้ทั้งหมด", value: `฿${stats.totalEarned.toLocaleString()}`, color: "text-emerald-400" },
          { label: "รอจ่าย", value: `฿${stats.pendingAmount.toLocaleString()}`, color: "text-amber-400" },
          { label: "จ่ายแล้ว", value: `฿${stats.paidAmount.toLocaleString()}`, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-sm font-semibold text-white mb-3">ขั้นตอนการฝากขาย</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: "1", title: "อัพโหลดไฟล์", desc: "ใบงาน, E-Book หรือ Template" },
            { step: "2", title: "ตั้งราคา", desc: "ตั้งราคาตามต้องการ" },
            { step: "3", title: "Admin อนุมัติ", desc: "ตรวจสอบคุณภาพก่อนเผยแพร่" },
            { step: "4", title: "รับรายได้ 70%", desc: "รับเงินทุกครั้งที่มีคนซื้อ" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center justify-center shrink-0">{s.step}</div>
              <div>
                <p className="text-xs font-medium text-white">{s.title}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] p-12 text-center" style={{ background: "var(--bg-card)" }}>
          <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่มีสินค้า</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">เริ่มอัพโหลดสินค้าชิ้นแรกได้เลย</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const status = statusLabel[p.approval_status] || statusLabel.pending;
            return (
              <div key={p.id} className="rounded-xl border border-white/[0.07] p-4 flex items-center gap-4" style={{ background: "var(--bg-card)" }}>
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.07]" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{p.title}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.color}`}>{status.text}</span>
                    {p.is_published && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">เผยแพร่</span>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{CATEGORIES.find((c) => c.value === p.category)?.label || p.category} · ฿{p.price.toLocaleString()} · รับ ฿{Math.round(p.price * p.commission_rate).toLocaleString()}/ชิ้น</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/shop/${p.id}`} className="px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition">ดู</Link>
                  {!p.is_published && (
                    <button onClick={() => handleDelete(p.id)} className="px-2 py-1 rounded text-xs font-medium text-red-400 hover:bg-red-500/10 transition">ลบ</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="rounded-2xl border border-white/[0.1] w-full max-w-lg p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto" style={{ background: "var(--bg-card)" }}>
            <h2 className="text-lg font-semibold text-white">เพิ่มสินค้าใหม่</h2>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ชื่อสินค้า *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="เช่น ใบงานคณิตศาสตร์ ป.3" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">รายละเอียด</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="อธิบายสินค้าของคุณ" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">ราคา (บาท) *</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
                {price > 0 && <p className="text-[10px] text-emerald-400 mt-1">คุณจะได้รับ ฿{Math.round(price * 0.7).toLocaleString()} (70%)</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">ประเภท</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">รูปปก</label>
              {thumbnailUrl && <img src={thumbnailUrl} alt="ปกสินค้า" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/[0.07]" />}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "thumbnail")} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400" style={{ color: "var(--text-muted)" }} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ไฟล์สินค้า (PDF, ZIP) *</label>
              {fileUrl && <p className="text-xs text-emerald-400 mb-1.5">อัพโหลดแล้ว ✓</p>}
              <input type="file" accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={(e) => handleUpload(e, "file")} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-400" style={{ color: "var(--text-muted)" }} />
              {uploading && <p className="text-xs text-[var(--text-muted)] mt-1">กำลังอัพโหลด...</p>}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-400">หลังส่งสินค้า Admin จะตรวจสอบคุณภาพก่อนอนุมัติเผยแพร่ (ภายใน 24 ชม.)</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/[0.07] hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
              <button type="submit" disabled={loading || uploading} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">
                {loading ? "กำลังส่ง..." : "ส่งสินค้า"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
