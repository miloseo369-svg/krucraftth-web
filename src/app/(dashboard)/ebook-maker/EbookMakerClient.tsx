"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";

interface PageItem {
  id: string;
  type: "text" | "image" | "title" | "toc";
  heading?: string;
  body?: string;
  image?: string;
  caption?: string;
}

const THEMES = [
  { id: "modern", name: "Modern", bg: "#0B1120", text: "#f1f5f9", accent: "#10b981", headingColor: "#10b981" },
  { id: "classic", name: "Classic", bg: "#1a1a2e", text: "#e0e0e0", accent: "#e94560", headingColor: "#e94560" },
  { id: "nature", name: "Nature", bg: "#1b2d1b", text: "#e8f5e9", accent: "#66bb6a", headingColor: "#a5d6a7" },
  { id: "ocean", name: "Ocean", bg: "#0d253f", text: "#e3f2fd", accent: "#42a5f5", headingColor: "#90caf9" },
  { id: "warm", name: "Warm", bg: "#2d1b00", text: "#fff3e0", accent: "#ff9800", headingColor: "#ffcc02" },
  { id: "minimal", name: "Minimal", bg: "#ffffff", text: "#1a1a1a", accent: "#000000", headingColor: "#000000" },
];

export default function EbookMakerClient() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [autoToc, setAutoToc] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const insertRef = useRef<HTMLInputElement>(null);
  const [insertPos, setInsertPos] = useState<number | null>(null);
  const { toast } = useToast();

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  // Page CRUD
  function addPage(type: PageItem["type"], position?: number) {
    const newPage: PageItem = { id: crypto.randomUUID(), type, heading: "", body: "", caption: "" };
    setPages((prev) => {
      if (position !== undefined && position <= prev.length) {
        const arr = [...prev];
        arr.splice(position, 0, newPage);
        return arr;
      }
      return [...prev, newPage];
    });
  }

  function updatePage(id: string, updates: Partial<PageItem>) {
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
  }

  function removePage(id: string) { setPages((prev) => prev.filter((p) => p.id !== id)); }

  function movePage(id: string, dir: -1 | 1) {
    setPages((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, pageId?: string) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (pageId) {
          updatePage(pageId, { image: reader.result as string });
        } else {
          const newPage: PageItem = { id: crypto.randomUUID(), type: "image", image: reader.result as string, caption: file.name.replace(/\.[^/.]+$/, "") };
          setPages((prev) => {
            if (insertPos !== null && insertPos <= prev.length) {
              const arr = [...prev];
              arr.splice(insertPos, 0, newPage);
              return arr;
            }
            return [...prev, newPage];
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
    setInsertPos(null);
  }

  function setCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Get headings for TOC
  const headings = pages.filter((p) => p.heading && (p.type === "text" || p.type === "title")).map((p, i) => ({ num: i + 1, text: p.heading! }));

  // Export PDF
  async function exportPDF() {
    if (pages.length === 0 && !title) { toast("กรุณาเพิ่มเนื้อหา", "error"); return; }
    toast("กำลังสร้าง PDF...", "info");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const t = theme;

    // Cover
    doc.setFillColor(t.bg);
    doc.rect(0, 0, 210, 297, "F");
    if (coverImage) {
      doc.addImage(coverImage, "JPEG", 30, 30, 150, 180);
    }
    doc.setTextColor(t.headingColor);
    doc.setFontSize(coverImage ? 20 : 32);
    doc.text(title || "Ebook", 105, coverImage ? 230 : 120, { align: "center" });
    if (subtitle) { doc.setFontSize(14); doc.setTextColor(t.text); doc.text(subtitle, 105, coverImage ? 242 : 138, { align: "center" }); }
    doc.setFontSize(12); doc.setTextColor(t.text);
    doc.text(author || "KruCraft", 105, coverImage ? 255 : 155, { align: "center" });

    // TOC
    if (autoToc && headings.length > 0) {
      doc.addPage();
      doc.setFillColor(t.bg); doc.rect(0, 0, 210, 297, "F");
      doc.setTextColor(t.headingColor); doc.setFontSize(20);
      doc.text("สารบัญ", 105, 30, { align: "center" });
      doc.setTextColor(t.text); doc.setFontSize(12);
      headings.forEach((h, i) => { doc.text(`${h.num}. ${h.text}`, 30, 50 + i * 10); });
    }

    // Content pages
    for (const page of pages) {
      doc.addPage();
      doc.setFillColor(t.bg); doc.rect(0, 0, 210, 297, "F");

      if (page.type === "image" && page.image) {
        doc.addImage(page.image, "JPEG", 15, 15, 180, 240);
        if (page.caption) { doc.setTextColor(t.text); doc.setFontSize(9); doc.text(page.caption, 105, 265, { align: "center" }); }
      } else if (page.type === "title") {
        doc.setTextColor(t.headingColor); doc.setFontSize(28);
        doc.text(page.heading || "", 105, 140, { align: "center" });
      } else {
        let y = 25;
        if (page.heading) { doc.setTextColor(t.headingColor); doc.setFontSize(18); doc.text(page.heading, 20, y); y += 12; }
        if (page.image) { doc.addImage(page.image, "JPEG", 20, y, 170, 100); y += 108; }
        if (page.body) {
          doc.setTextColor(t.text); doc.setFontSize(11);
          const lines = doc.splitTextToSize(page.body, 170);
          doc.text(lines, 20, y);
        }
      }
    }

    doc.save(`${title || "ebook"}.pdf`);
    toast("สร้าง PDF สำเร็จ!", "success");
  }

  // Export Doc
  function exportDoc() {
    if (pages.length === 0 && !title) { toast("กรุณาเพิ่มเนื้อหา", "error"); return; }
    const t = theme;
    let html = `<html><head><meta charset="utf-8"><style>
      body{font-family:'Segoe UI',sans-serif;margin:40px;background:${t.bg};color:${t.text};}
      h1{text-align:center;color:${t.headingColor};font-size:28px;margin-bottom:5px;}
      h2{color:${t.headingColor};font-size:20px;margin-top:30px;border-bottom:2px solid ${t.accent};padding-bottom:5px;}
      h3{text-align:center;color:${t.text};opacity:0.7;font-size:14px;}
      img{max-width:100%;height:auto;margin:15px 0;border-radius:8px;}
      .cover{text-align:center;page-break-after:always;padding-top:100px;}
      .page{page-break-after:always;padding:20px 0;}
      .caption{font-size:12px;color:${t.text};opacity:0.6;text-align:center;margin-top:5px;}
      .toc{page-break-after:always;} .toc h2{text-align:center;border:none;} .toc ul{list-style:none;padding:0;} .toc li{padding:5px 0;font-size:14px;}
      p{line-height:1.8;font-size:14px;}
    </style></head><body>`;

    // Cover
    html += `<div class="cover">`;
    if (coverImage) html += `<img src="${coverImage}" style="max-height:400px;margin-bottom:20px;" />`;
    html += `<h1>${title || "Ebook"}</h1>`;
    if (subtitle) html += `<h3>${subtitle}</h3>`;
    html += `<h3>${author || "KruCraft"}</h3></div>`;

    // TOC
    if (autoToc && headings.length > 0) {
      html += `<div class="toc"><h2>สารบัญ</h2><ul>`;
      headings.forEach((h) => { html += `<li>${h.num}. ${h.text}</li>`; });
      html += `</ul></div>`;
    }

    // Pages
    for (const page of pages) {
      html += `<div class="page">`;
      if (page.type === "title") {
        html += `<div style="text-align:center;padding-top:120px;"><h1>${page.heading || ""}</h1></div>`;
      } else if (page.type === "image") {
        html += `<div style="text-align:center;"><img src="${page.image}" /><p class="caption">${page.caption || ""}</p></div>`;
      } else {
        if (page.heading) html += `<h2>${page.heading}</h2>`;
        if (page.image) html += `<img src="${page.image}" />`;
        if (page.body) html += `<p>${page.body.replace(/\n/g, "<br/>")}</p>`;
      }
      html += `</div>`;
    }

    html += `</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title || "ebook"}.doc`; a.click();
    URL.revokeObjectURL(url);
    toast("สร้าง .doc สำเร็จ!", "success");
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">สร้างสรรค์ Ebook</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>สร้างหนังสือดิจิทัล → Export PDF / .doc</p>
        </div>
      </div>

      {/* Theme selector */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-4" style={{ background: "var(--bg-card)" }}>
        <h3 className="text-sm font-semibold text-white mb-3">สไตล์หนังสือ</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setTheme(t)} className={`shrink-0 rounded-xl p-3 w-20 text-center transition-all ${theme.id === t.id ? "border-2 border-emerald-500/50 scale-105" : "border border-white/[0.07] hover:border-white/[0.15]"}`} style={{ background: t.bg }}>
              <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: t.accent }} />
              <p className="text-[9px] font-medium" style={{ color: t.text }}>{t.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Book Info */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-4" style={{ background: "var(--bg-card)" }}>
        <h3 className="text-sm font-semibold text-white mb-3">ข้อมูลหนังสือ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">ชื่อเรื่อง *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น คู่มือการสอนคณิตศาสตร์" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">ชื่อผู้แต่ง</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="ชื่อผู้เขียน" className={inputClass} />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-white mb-1">คำโปรย / Subtitle</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="เช่น สำหรับครูประถมศึกษา ปีการศึกษา 2569" className={inputClass} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-white mb-1">รูปปก</label>
            <div className="flex items-center gap-3">
              {coverImage && <img src={coverImage} alt="cover" className="w-14 h-20 rounded-lg object-cover border border-white/[0.07]" />}
              <div>
                <input type="file" accept="image/*" onChange={setCover} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-pink-500/10 file:text-pink-400" style={{ color: "var(--text-muted)" }} />
                {coverImage && <button onClick={() => setCoverImage(null)} className="text-[10px] text-red-400 hover:underline ml-2">ลบปก</button>}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input type="checkbox" checked={autoToc} onChange={(e) => setAutoToc(e.target.checked)} className="accent-emerald-500" />
            <span className="text-xs text-white">สร้างสารบัญอัตโนมัติ</span>
          </label>
        </div>
      </div>

      {/* Pages — Content Editor */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-4" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">เนื้อหา ({pages.length} หน้า)</h3>
          <div className="flex gap-1.5">
            <button onClick={() => addPage("text")} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition">+ หน้าเนื้อหา</button>
            <button onClick={() => addPage("title")} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition">+ หน้าหัวข้อ</button>
            <button onClick={() => { setInsertPos(null); fileRef.current?.click(); }} className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition">+ รูปภาพ</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e)} className="hidden" />
          <input ref={insertRef} type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e)} className="hidden" />
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/[0.07] rounded-xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <p className="text-xs font-medium text-white">เริ่มสร้างเนื้อหา</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>กดปุ่มด้านบนเพื่อเพิ่มหน้าเนื้อหา หัวข้อ หรือรูปภาพ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, idx) => (
              <div key={page.id} className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                {/* Page header */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05]">
                  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${page.type === "text" ? "bg-emerald-500 text-black" : page.type === "title" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {page.type === "text" ? "หน้าเนื้อหา" : page.type === "title" ? "หน้าหัวข้อ" : "รูปภาพ"}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    {/* Insert after */}
                    <button onClick={() => { setInsertPos(idx + 1); insertRef.current?.click(); }} className="px-1.5 py-0.5 rounded text-[9px] font-medium text-blue-400 hover:bg-blue-500/10 transition" title="แทรกรูปหลังหน้านี้">+รูป</button>
                    <button onClick={() => addPage("text", idx + 1)} className="px-1.5 py-0.5 rounded text-[9px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition" title="แทรกเนื้อหาหลังหน้านี้">+เนื้อหา</button>
                    {idx > 0 && <button onClick={() => movePage(page.id, -1)} className="p-1 rounded hover:bg-white/5 transition" style={{ color: "var(--text-muted)" }}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>}
                    {idx < pages.length - 1 && <button onClick={() => movePage(page.id, 1)} className="p-1 rounded hover:bg-white/5 transition" style={{ color: "var(--text-muted)" }}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>}
                    <button onClick={() => removePage(page.id)} className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>

                {/* Page body */}
                <div className="p-4 space-y-2">
                  {page.type === "title" && (
                    <input value={page.heading || ""} onChange={(e) => updatePage(page.id, { heading: e.target.value })} placeholder="ชื่อบท / หัวข้อใหญ่" className={`${inputClass} text-base font-bold`} />
                  )}
                  {page.type === "text" && (
                    <>
                      <input value={page.heading || ""} onChange={(e) => updatePage(page.id, { heading: e.target.value })} placeholder="หัวข้อ (จะอยู่ในสารบัญ)" className={`${inputClass} font-semibold`} />
                      <textarea value={page.body || ""} onChange={(e) => updatePage(page.id, { body: e.target.value })} placeholder="เนื้อหา... พิมพ์ได้เลย" rows={5} className={inputClass} />
                      <div className="flex items-center gap-2">
                        {page.image ? (
                          <div className="flex items-center gap-2">
                            <img src={page.image} alt="" className="w-16 h-12 rounded-lg object-cover border border-white/[0.07]" />
                            <button onClick={() => updatePage(page.id, { image: undefined })} className="text-[10px] text-red-400 hover:underline">ลบรูป</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => document.getElementById(`img-${page.id}`)?.click()} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/[0.07] hover:bg-white/10 transition" style={{ color: "var(--text-secondary)" }}>+ แนบรูปประกอบ</button>
                            <input id={`img-${page.id}`} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, page.id)} className="hidden" />
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {page.type === "image" && (
                    <>
                      {page.image && <img src={page.image} alt="" className="w-full max-h-60 object-contain rounded-xl border border-white/[0.07]" />}
                      <input value={page.caption || ""} onChange={(e) => updatePage(page.id, { caption: e.target.value })} placeholder="คำอธิบายภาพ..." className={`${inputClass} text-xs`} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview bar */}
      {(title || pages.length > 0) && (
        <div className="rounded-xl border border-white/[0.07] p-4 mb-4 flex items-center gap-4" style={{ background: theme.bg }}>
          {coverImage && <img src={coverImage} alt="" className="w-10 h-14 rounded object-cover shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: theme.headingColor }}>{title || "ชื่อเรื่อง"}</p>
            <p className="text-[10px] truncate" style={{ color: theme.text, opacity: 0.6 }}>{subtitle} · {author || "KruCraft"} · {pages.length} หน้า{autoToc && headings.length > 0 ? " + สารบัญ" : ""}</p>
          </div>
          <div className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.accent, color: theme.bg }}>
            {theme.name}
          </div>
        </div>
      )}

      {/* Export */}
      {(title || pages.length > 0) && (
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
