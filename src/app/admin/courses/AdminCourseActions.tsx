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

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">จัดการคอร์ส</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition">
          + สร้างคอร์สใหม่
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">{editingId ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">ชื่อคอร์ส *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">รายละเอียด</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">รูปปก</label>
              {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20" />
              {uploading && <p className="text-xs text-gray-500 mt-1">กำลังอัพโหลด...</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ราคา (บาท)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ผู้สอน</label>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={inputClass}>
                  <option value="">-- ยังไม่ระบุ --</option>
                  {instructors.map((i) => (<option key={i.id} value={i.id}>{i.full_name || i.id}</option>))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-gray-600 bg-gray-700 text-indigo-600" />
              <span className="text-sm text-white">เผยแพร่ทันที</span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">ยกเลิก</button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition">{loading ? "กำลังบันทึก..." : editingId ? "บันทึก" : "สร้างคอร์ส"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">คอร์ส</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้สอน</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-800/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">{course.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{course.instructor?.full_name || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleTogglePublish(course.id, course.is_published)} className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${course.is_published ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"}`}>
                    {course.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/courses/${course.id}`} className="px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition">บทเรียน</Link>
                    <button onClick={() => openEdit(course)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(course.id, course.title)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-600">ยังไม่มีคอร์ส</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
