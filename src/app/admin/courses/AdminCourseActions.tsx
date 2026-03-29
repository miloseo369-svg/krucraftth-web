"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toast";
import { showConfirm } from "@/components/ConfirmModal";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  instructor_id: string | null;
  is_published: boolean;
  instructor?: { full_name: string | null } | null;
}

interface Instructor {
  id: string;
  full_name: string | null;
  role: string;
}

export default function AdminCourseActions({ courses, instructors }: { courses: Course[]; instructors: Instructor[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [instructorId, setInstructorId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const resetForm = () => { setTitle(""); setDescription(""); setPrice(0); setInstructorId(""); setIsPublished(false); setThumbnailUrl(""); setShowForm(false); setEditingId(null); };

  const openEdit = (c: Course) => { setTitle(c.title); setDescription(c.description ?? ""); setPrice(c.price); setInstructorId(c.instructor_id ?? ""); setIsPublished(c.is_published); setThumbnailUrl(c.thumbnail_url ?? ""); setEditingId(c.id); setShowForm(true); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) { const d = await res.json(); setThumbnailUrl(d.url); }
    else showToast("อัพโหลดรูปไม่สำเร็จ", "error");
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = { title, description, price, instructor_id: instructorId || null, is_published: isPublished, thumbnail_url: thumbnailUrl || null };
    const res = editingId
      ? await fetch(`/api/admin/courses/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "เกิดข้อผิดพลาด", "error"); setLoading(false); return; }
    showToast(editingId ? "บันทึกคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ", "success"); resetForm(); setLoading(false); router.refresh();
  };

  const handleDelete = async (id: string, t: string) => {
    if (!(await showConfirm(`ลบคอร์ส "${t}"?\nโมดูลและบทเรียนทั้งหมดจะถูกลบด้วย`))) return;
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "ลบไม่สำเร็จ", "error"); return; }
    showToast("ลบคอร์สสำเร็จ", "success");
    router.refresh();
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/courses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_published: !current }) });
    if (res.ok) showToast(current ? "เปลี่ยนเป็นฉบับร่าง" : "เผยแพร่คอร์สแล้ว", "success");
    else showToast("เปลี่ยนสถานะไม่สำเร็จ", "error");
    router.refresh();
  };

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition" + " " + "bg-[var(--bg-primary)] border border-white/[0.07] text-white placeholder:text-[var(--text-muted)] focus:border-emerald-500/40";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">จัดการคอร์ส</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all">
          + สร้างคอร์สใหม่
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="rounded-2xl border border-white/[0.07] bg-[var(--bg-card)] backdrop-blur-md w-full max-w-lg p-6 space-y-5 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-semibold text-white">{editingId ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</h2>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ชื่อคอร์ส *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">รายละเอียด</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">รูปปก</label>
              {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/[0.07]" />}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" style={{ color: "var(--text-muted)" }} />
              {uploading && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กำลังอัพโหลด...</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">ราคา (บาท)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">ผู้สอน</label>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={inputClass}>
                  <option value="">-- ยังไม่ระบุ --</option>
                  {instructors.map((i) => (<option key={i.id} value={i.id}>{i.full_name || i.id}</option>))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-emerald-500" />
              <span className="text-sm text-white">เผยแพร่ทันที</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/[0.07] hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">{loading ? "กำลังบันทึก..." : editingId ? "บันทึก" : "สร้างคอร์ส"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>คอร์ส</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>ผู้สอน</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>ราคา</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>สถานะ</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-200">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/[0.07]" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">{course.title}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>{course.instructor?.full_name || "-"}</td>
                <td className="px-6 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>{course.price === 0 ? <span className="text-emerald-400">ฟรี</span> : `฿${course.price.toLocaleString()}`}</td>
                <td className="px-6 py-5">
                  <button onClick={() => handleTogglePublish(course.id, course.is_published)} className={`text-xs font-medium px-3 py-1 rounded-full border transition ${course.is_published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15"}`}>
                    {course.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/courses/${course.id}`} className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition">บทเรียน</Link>
                    <button onClick={() => openEdit(course)} className="p-1.5 hover:bg-white/5 rounded-lg transition" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(course.id, course.title)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-20 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-sm font-medium text-white">ยังไม่มีคอร์ส</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กดปุ่ม &quot;สร้างคอร์สใหม่&quot; เพื่อเริ่มต้น</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
