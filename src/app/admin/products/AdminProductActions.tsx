"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import { showConfirm } from "@/components/ConfirmModal";

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string;
  price: number;
  category: string;
  is_published: boolean;
  commission_rate: number;
  seller?: { full_name: string | null } | null;
}

const CATEGORIES = [
  { value: "worksheet", label: "ใบงาน" },
  { value: "ebook", label: "E-Book" },
  { value: "template", label: "Template" },
  { value: "resource", label: "สื่อการสอน" },
];

export default function AdminProductActions({ products }: { products: Product[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("worksheet");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const inputClass = "w-full border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" + " placeholder:text-[var(--text-muted)]" + " bg-[var(--bg-primary)]";

  const resetForm = () => { setTitle(""); setDescription(""); setPrice(0); setCategory("worksheet"); setFileUrl(""); setThumbnailUrl(""); setIsPublished(false); setShowForm(false); setEditingId(null); };

  const openEdit = (p: Product) => { setTitle(p.title); setDescription(p.description ?? ""); setPrice(p.price); setCategory(p.category); setFileUrl(p.file_url); setThumbnailUrl(p.thumbnail_url ?? ""); setIsPublished(p.is_published); setEditingId(p.id); setShowForm(true); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "file") => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = editingId
      ? { id: editingId, title, description, price, category, file_url: fileUrl, thumbnail_url: thumbnailUrl || null, is_published: isPublished }
      : { title, description, price, category, file_url: fileUrl, thumbnail_url: thumbnailUrl || null, is_published: isPublished };

    const res = await fetch("/api/admin/products", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "เกิดข้อผิดพลาด", "error"); setLoading(false); return; }
    showToast(editingId ? "บันทึกสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ", "success"); resetForm(); setLoading(false); router.refresh();
  };

  const handleDelete = async (id: string, t: string) => {
    if (!(await showConfirm(`ลบสินค้า "${t}"?`))) return;
    const res = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) showToast("ลบสินค้าสำเร็จ", "success");
    else showToast("ลบไม่สำเร็จ", "error");
    router.refresh();
  };

  const handleToggle = async (p: Product) => {
    const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, is_published: !p.is_published }) });
    if (res.ok) showToast(p.is_published ? "เปลี่ยนเป็นร่าง" : "เผยแพร่สินค้าแล้ว", "success");
    else showToast("เปลี่ยนสถานะไม่สำเร็จ", "error");
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">จัดการสินค้า</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 bg-emerald-500 text-black text-sm font-medium rounded-xl hover:bg-emerald-400 transition">
          + เพิ่มสินค้า
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="border border-white/[0.07] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)" }}>
            <h2 className="text-lg font-semibold text-white">{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>ชื่อสินค้า *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>รายละเอียด</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>ราคา (บาท)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>หมวดหมู่</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>รูปปก</label>
              {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "thumbnail")} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400" style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>ไฟล์สินค้า (PDF/ZIP) *</label>
              {fileUrl && <p className="text-xs text-emerald-400 mb-1 truncate">{fileUrl}</p>}
              <input type="file" accept=".pdf,.zip,.epub,.doc,.docx" onChange={(e) => handleUpload(e, "file")} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400" style={{ color: "var(--text-muted)" }} />
              {uploading && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กำลังอัพโหลด...</p>}
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ backgroundColor: "var(--bg-primary)" }}>
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-white/[0.07] bg-white/[0.05] text-emerald-500" />
              <span className="text-sm text-white">เผยแพร่ทันที</span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm hover:text-white transition" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
              <button type="submit" disabled={loading || !fileUrl} className="px-5 py-2 bg-emerald-500 text-black text-sm font-medium rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition">{loading ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
        <table className="w-full text-left">
          <thead className="border-b border-white/[0.07]">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">สินค้า</th>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">หมวด</th>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ราคา</th>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ผู้ขาย</th>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.03] transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">{p.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{CATEGORIES.find((c) => c.value === p.category)?.label || p.category}</td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}</td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.seller?.full_name || "-"}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggle(p)} className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${p.is_published ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/20 text-amber-400 border border-amber-500/20"}`}>
                    {p.is_published ? "เผยแพร่" : "ร่าง"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-[var(--text-muted)] hover:text-white hover:bg-white/[0.03] rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-20 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p className="text-sm font-medium text-white">ยังไม่มีสินค้า</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กดปุ่ม &quot;เพิ่มสินค้า&quot; เพื่อเริ่มต้น</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
