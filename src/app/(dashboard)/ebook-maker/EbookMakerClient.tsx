"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";

interface PageItem {
  id: string;
  image: string; // data URL
  caption: string;
}

export default function EbookMakerClient() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function addImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPages((prev) => [...prev, { id: crypto.randomUUID(), image: reader.result as string, caption: file.name.replace(/\.[^/.]+$/, "") }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function setCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function updateCaption(id: string, caption: string) {
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, caption } : p));
  }

  function movePage(id: string, direction: -1 | 1) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }

  async function exportPDF() {
    if (pages.length === 0) { toast("กรุณาเพิ่มรูปอย่างน้อย 1 หน้า", "error"); return; }
    toast("กำลังสร้าง PDF...", "info");

    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Cover page
    if (coverImage) {
      doc.addImage(coverImage, "JPEG", 0, 0, 210, 297);
    } else {
      doc.setFillColor(11, 17, 32);
      doc.rect(0, 0, 210, 297, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text(title || "Ebook", 105, 130, { align: "center" });
      doc.setFontSize(14);
      doc.text(author || "KruCraft", 105, 150, { align: "center" });
    }

    // Content pages
    for (const page of pages) {
      doc.addPage();
      doc.addImage(page.image, "JPEG", 10, 10, 190, 250);
      if (page.caption) {
        doc.setFillColor(11, 17, 32);
        doc.rect(0, 270, 210, 27, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(page.caption, 105, 282, { align: "center" });
      }
    }

    doc.save(`${title || "ebook"}.pdf`);
    toast("สร้าง PDF สำเร็จ!", "success");
  }

  function exportDoc() {
    if (pages.length === 0) { toast("กรุณาเพิ่มรูปอย่างน้อย 1 หน้า", "error"); return; }

    let html = `<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;margin:40px;}h1{text-align:center;margin-bottom:10px;}h3{text-align:center;color:#666;margin-bottom:40px;}img{max-width:100%;height:auto;margin:10px 0;border:1px solid #eee;border-radius:8px;}.page{page-break-after:always;text-align:center;margin-bottom:20px;}.caption{color:#333;font-size:14px;margin-top:8px;}</style></head><body>`;
    html += `<h1>${title || "Ebook"}</h1><h3>${author || "KruCraft"}</h3>`;

    if (coverImage) {
      html += `<div class="page"><img src="${coverImage}" style="max-height:700px;" /></div>`;
    }

    for (const page of pages) {
      html += `<div class="page"><img src="${page.image}" /><p class="caption">${page.caption}</p></div>`;
    }

    html += `</body></html>`;

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "ebook"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast("สร้าง .doc สำเร็จ!", "success");
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">ทำปก Ebook</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>อัปโหลดรูป → จัดเรียง → Export เป็น PDF หรือ .doc</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-white mb-1.5">ชื่อ Ebook</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ใบงานคณิตศาสตร์ ป.3" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-white mb-1.5">ผู้เขียน</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="ชื่อผู้เขียน" className={inputClass} />
        </div>
      </div>

      {/* Cover */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
        <h3 className="text-sm font-semibold text-white mb-3">รูปปก (ไม่จำเป็น)</h3>
        {coverImage ? (
          <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.07] mb-3">
            <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
            <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : null}
        <input type="file" accept="image/*" onChange={setCover} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20" style={{ color: "var(--text-muted)" }} />
      </div>

      {/* Pages */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">หน้าเนื้อหา ({pages.length} หน้า)</h3>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 active:scale-95 transition-all">
            + เพิ่มรูป
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/[0.07] rounded-xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-xs font-medium text-white">ลากรูปมาวาง หรือกดปุ่มด้านบน</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>รองรับ JPG, PNG, WebP · เลือกได้หลายรูป</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((page, idx) => (
              <div key={page.id} className="relative group rounded-xl overflow-hidden border border-white/[0.07]" style={{ background: "var(--bg-primary)" }}>
                <div className="aspect-[3/4] relative">
                  <img src={page.image} alt={page.caption} className="w-full h-full object-cover" />
                  {/* Number */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">{idx + 1}</div>
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    {idx > 0 && (
                      <button onClick={() => movePage(page.id, -1)} className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-blue-500 transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                    )}
                    {idx < pages.length - 1 && (
                      <button onClick={() => movePage(page.id, 1)} className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-blue-500 transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    )}
                    <button onClick={() => removePage(page.id)} className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <input
                  value={page.caption}
                  onChange={(e) => updateCaption(page.id, e.target.value)}
                  placeholder="คำอธิบาย..."
                  className="w-full px-2 py-1.5 text-[10px] outline-none bg-transparent text-white border-t border-white/[0.05]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      {pages.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportPDF} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Export PDF
          </button>
          <button onClick={exportDoc} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export .doc
          </button>
        </div>
      )}
    </div>
  );
}
