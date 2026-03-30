"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

interface SavedDoc { id: string; title: string; template_type: string; status: string; updated_at: string; }
interface SectionData { text: string; images: string[]; }

const TEMPLATES = [
  { id: "research", name: "วิจัยในชั้นเรียน 5 บท", desc: "โครงสร้างครบตามมาตรฐานราชการ", icon: "📄", gradient: "from-blue-500 to-indigo-500", category: "academic",
    sections: ["บทที่ 1 บทนำ", "บทที่ 2 เอกสารและงานวิจัยที่เกี่ยวข้อง", "บทที่ 3 วิธีดำเนินการวิจัย", "บทที่ 4 ผลการวิเคราะห์ข้อมูล", "บทที่ 5 สรุป อภิปราย และข้อเสนอแนะ", "บรรณานุกรม", "ภาคผนวก"] },
  { id: "worksheet", name: "ใบงาน / ใบกิจกรรม", desc: "หัวกระดาษ + ตัวชี้วัด + รูปประกอบ", icon: "📝", gradient: "from-emerald-500 to-teal-500", category: "academic",
    sections: ["หัวกระดาษ", "จุดประสงค์การเรียนรู้", "ตัวชี้วัด", "คำชี้แจง", "เนื้อหา/กิจกรรม", "เฉลย"] },
  { id: "lesson_plan", name: "แผนการจัดการเรียนรู้", desc: "แผนการสอนตามหลักสูตร", icon: "📋", gradient: "from-purple-500 to-pink-500", category: "academic",
    sections: ["ข้อมูลทั่วไป", "มาตรฐาน/ตัวชี้วัด", "สาระสำคัญ", "จุดประสงค์การเรียนรู้", "สาระการเรียนรู้", "กิจกรรมการเรียนรู้", "สื่อ/แหล่งเรียนรู้", "การวัดและประเมินผล", "บันทึกหลังสอน"] },
  { id: "report", name: "รายงาน SAR / ผลงาน", desc: "รายงานผลการปฏิบัติงาน", icon: "📊", gradient: "from-red-500 to-rose-500", category: "academic",
    sections: ["ปกรายงาน", "บทสรุปผู้บริหาร", "ข้อมูลทั่วไป", "ผลการดำเนินงาน", "ผลลัพธ์/ตัวชี้วัด", "ปัญหาและอุปสรรค", "แนวทางพัฒนา", "ภาคผนวก"] },
  // Ebook styles
  { id: "ebook-knowledge", name: "E-book ความรู้ทั่วไป", desc: "คู่มือ / หนังสือเรียน / ความรู้", icon: "📖", gradient: "from-amber-500 to-orange-500", category: "ebook",
    sections: ["ปกหน้า", "คำนำ", "สารบัญ", "บทที่ 1", "บทที่ 2", "บทที่ 3", "บทที่ 4", "บทที่ 5", "บรรณานุกรม"] },
  { id: "ebook-novel", name: "E-book นิยาย/เรื่องสั้น", desc: "นิยาย เรื่องสั้น วรรณกรรม", icon: "📕", gradient: "from-pink-500 to-rose-600", category: "ebook",
    sections: ["ปกหน้า", "คำนำผู้เขียน", "บทที่ 1", "บทที่ 2", "บทที่ 3", "บทที่ 4", "บทที่ 5", "บทส่งท้าย", "เกี่ยวกับผู้เขียน"] },
  { id: "ebook-sales", name: "E-book เทคนิคการขาย", desc: "คู่มือขาย การตลาด ธุรกิจ", icon: "💰", gradient: "from-green-500 to-emerald-600", category: "ebook",
    sections: ["ปกหน้า", "ทำไมต้องอ่านเล่มนี้", "บทที่ 1: พื้นฐานการขาย", "บทที่ 2: เข้าใจลูกค้า", "บทที่ 3: เทคนิคปิดการขาย", "บทที่ 4: Case Studies", "สรุปและ Action Plan", "เกี่ยวกับผู้เขียน"] },
  { id: "ebook-realestate", name: "E-book อสังหาริมทรัพย์", desc: "คู่มือลงทุน ซื้อ-ขาย อสังหา", icon: "🏠", gradient: "from-sky-500 to-blue-600", category: "ebook",
    sections: ["ปกหน้า", "บทนำ: ทำไมต้องลงทุนอสังหา", "บทที่ 1: พื้นฐานที่ต้องรู้", "บทที่ 2: วิเคราะห์ทำเลทอง", "บทที่ 3: กลยุทธ์ซื้อ-ขาย", "บทที่ 4: การเงินและสินเชื่อ", "บทที่ 5: กฎหมายที่ต้องรู้", "สรุปและเริ่มต้น"] },
  { id: "ebook-course", name: "E-book ประกอบคอร์สสอน", desc: "เอกสารประกอบการสอน", icon: "🎓", gradient: "from-violet-500 to-purple-600", category: "ebook",
    sections: ["ปกหน้า", "วัตถุประสงค์คอร์ส", "สิ่งที่จะได้เรียนรู้", "Module 1", "Module 2", "Module 3", "Module 4", "แบบฝึกหัด", "ภาคผนวก"] },
];

interface GemLink { id: string; title: string; url: string; }

const AI_PROMPTS: Record<string, Record<string, string>> = {
  research: {
    "บทที่ 1 บทนำ": "เขียนบทนำวิจัยในชั้นเรียน: ความเป็นมา วัตถุประสงค์ ขอบเขต นิยามศัพท์ สมมติฐาน ประโยชน์ สำหรับวิชา {subject} ระดับ {grade} เรื่อง {title}",
    "บทที่ 3 วิธีดำเนินการวิจัย": "เขียนบทที่ 3 วิธีดำเนินการวิจัย: ประชากร เครื่องมือ วิธีดำเนินการ การเก็บข้อมูล การวิเคราะห์ สำหรับเรื่อง {title}",
    "บทที่ 5 สรุป อภิปราย และข้อเสนอแนะ": "เขียนบทที่ 5 สรุปผล อภิปราย ข้อเสนอแนะ สำหรับวิจัยเรื่อง {title}",
  },
  worksheet: {
    "คำชี้แจง": "เขียนคำชี้แจงใบงาน เรื่อง {title} วิชา {subject} ระดับ {grade}",
    "เนื้อหา/กิจกรรม": "สร้างเนื้อหาใบงานพร้อมคำถาม 5-10 ข้อ เรื่อง {title} วิชา {subject} ระดับ {grade} ให้มีกิจกรรมที่หลากหลาย เช่น ระบายสี เติมคำ จับคู่ เรียงลำดับ",
  },
  lesson_plan: {
    "กิจกรรมการเรียนรู้": "เขียนกิจกรรมการเรียนรู้ (ขั้นนำ ขั้นสอน ขั้นสรุป) เรื่อง {title} วิชา {subject} ระดับ {grade}",
  },
  "ebook-sales": {
    "ทำไมต้องอ่านเล่มนี้": "เขียน intro ที่ทำให้คนอยากอ่าน สำหรับ ebook เรื่อง {title} โดย {teacher}",
    "บทที่ 3: เทคนิคปิดการขาย": "เขียนเนื้อหาบทเทคนิคปิดการขาย 5 วิธี สำหรับ {title}",
  },
};

interface Props { userName: string; role: string; savedDocs: SavedDoc[]; gemLinks: GemLink[]; }

export default function DocCreatorClient({ userName, savedDocs, gemLinks }: Props) {
  const [step, setStep] = useState<"select" | "info" | "edit" | "preview">("select");
  const [templateCategory, setTemplateCategory] = useState("academic");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [info, setInfo] = useState({ title: "", teacherName: userName, schoolName: "", subjectGroup: "", gradeLevel: "", academicYear: "2569" });
  const [sections, setSections] = useState<Record<string, SectionData>>({});
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  function startTemplate(t: typeof TEMPLATES[0]) {
    setTemplate(t);
    const s: Record<string, SectionData> = {};
    t.sections.forEach((sec) => { s[sec] = { text: "", images: [] }; });
    setSections(s);
    setCoverImage(null);
    setActiveSection(0);
    setStep("info");
  }

  function updateText(section: string, text: string) {
    setSections((p) => ({ ...p, [section]: { ...p[section], text } }));
  }

  function addImage(section: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSections((p) => ({ ...p, [section]: { ...p[section], images: [...(p[section]?.images || []), reader.result as string] } }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeImage(section: string, idx: number) {
    setSections((p) => ({ ...p, [section]: { ...p[section], images: p[section].images.filter((_, i) => i !== idx) } }));
  }

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function askAI(sectionName: string) {
    const prompts = AI_PROMPTS[template.id] || {};
    const promptTemplate = prompts[sectionName];
    if (!promptTemplate) { toast("ไม่มี AI prompt สำหรับส่วนนี้", "info"); return; }
    setAiLoading(true);
    try {
      const prompt = promptTemplate.replace(/{title}/g, info.title).replace(/{subject}/g, info.subjectGroup).replace(/{grade}/g, info.gradeLevel).replace(/{teacher}/g, info.teacherName);
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "doc-assist", input: { prompt } }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateText(sectionName, typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2));
      toast("AI สร้างเนื้อหาสำเร็จ!", "success");
    } catch (err) { toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error"); }
    finally { setAiLoading(false); }
  }

  async function saveDocument() {
    setSaving(true);
    try {
      const content: Record<string, unknown> = {};
      Object.entries(sections).forEach(([k, v]) => { content[k] = v; });
      const doc = { template_type: template.id, title: info.title, teacher_name: info.teacherName, school_name: info.schoolName, subject_group: info.subjectGroup, grade_level: info.gradeLevel, academic_year: info.academicYear, content, updated_at: new Date().toISOString() };
      if (docId) { await supabase.from("user_documents").update(doc).eq("id", docId); }
      else { const { data: { user } } = await supabase.auth.getUser(); const { data } = await supabase.from("user_documents").insert({ ...doc, user_id: user!.id }).select("id").single(); if (data) setDocId(data.id); }
      toast("บันทึกสำเร็จ!", "success");
    } catch { toast("บันทึกไม่สำเร็จ", "error"); }
    finally { setSaving(false); }
  }

  function exportDoc() {
    let html = `<html><head><meta charset="utf-8"><style>@page{margin:2.54cm 3.17cm;}body{font-family:'TH Sarabun New',sans-serif;font-size:16pt;line-height:1.5;color:#000;margin:0;padding:40px;}h1{font-size:20pt;font-weight:bold;text-align:center;}h2{font-size:18pt;font-weight:bold;margin-top:24px;}p{text-indent:1cm;margin:5px 0;text-align:justify;}img{max-width:100%;height:auto;margin:10px 0;border-radius:4px;}.cover{text-align:center;page-break-after:always;padding-top:4cm;}.section{page-break-before:always;}</style></head><body>`;
    // Cover
    html += `<div class="cover">`;
    if (coverImage) html += `<img src="${coverImage}" style="max-height:400px;margin-bottom:20px;" />`;
    html += `<h1>${info.title}</h1>`;
    if (info.subjectGroup) html += `<p style="text-indent:0;text-align:center">${info.subjectGroup} ชั้น${info.gradeLevel}</p>`;
    html += `<p style="text-indent:0;text-align:center;margin-top:3cm">โดย</p><p style="text-indent:0;text-align:center;font-size:18pt;font-weight:bold">${info.teacherName}</p>`;
    if (info.schoolName) html += `<p style="text-indent:0;text-align:center">${info.schoolName}</p>`;
    html += `<p style="text-indent:0;text-align:center;margin-top:2cm">ปีการศึกษา ${info.academicYear}</p></div>`;
    // Sections
    template.sections.forEach((sec) => {
      const d = sections[sec];
      if (!d?.text?.trim() && !d?.images?.length) return;
      html += `<div class="section"><h2>${sec}</h2>`;
      if (d.text) d.text.split("\n").forEach((line) => { if (line.trim()) html += `<p>${line}</p>`; });
      d.images?.forEach((img) => { html += `<div style="text-align:center;margin:15px 0;"><img src="${img}" style="max-height:500px;" /></div>`; });
      html += `</div>`;
    });
    html += `</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${info.title || "document"}.doc`; a.click();
    toast("Export .doc สำเร็จ!", "success");
  }

  async function exportPDF() {
    toast("กำลังสร้าง PDF...", "info");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    // Cover
    if (coverImage) { doc.addImage(coverImage, "JPEG", 20, 20, 170, 200); doc.setFontSize(18); doc.text(info.title, 105, 240, { align: "center" }); }
    else { doc.setFontSize(22); doc.text(info.title || "เอกสาร", 105, 100, { align: "center" }); doc.setFontSize(14); doc.text(info.teacherName, 105, 160, { align: "center" }); }
    // Sections
    template.sections.forEach((sec) => {
      const d = sections[sec];
      if (!d?.text?.trim() && !d?.images?.length) return;
      doc.addPage();
      doc.setFontSize(16); doc.text(sec, 105, 20, { align: "center" });
      let y = 35;
      if (d.text) { doc.setFontSize(12); const lines = doc.splitTextToSize(d.text, 170); doc.text(lines, 20, y); y += lines.length * 5 + 10; }
      d.images?.forEach((img) => { if (y > 200) { doc.addPage(); y = 20; } doc.addImage(img, "JPEG", 20, y, 170, 100); y += 110; });
    });
    doc.save(`${info.title || "document"}.pdf`);
    toast("สร้าง PDF สำเร็จ!", "success");
  }

  const filledSections = template.sections.filter((s) => sections[s]?.text?.trim() || sections[s]?.images?.length);
  const currentSection = template.sections[activeSection];
  const currentData = sections[currentSection] || { text: "", images: [] };
  const hasAI = (AI_PROMPTS[template.id] || {})[currentSection];
  const filteredTemplates = TEMPLATES.filter((t) => t.category === templateCategory);

  // === STEP 1: SELECT ===
  if (step === "select") return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">สร้างเอกสาร</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>เลือก Template → กรอกข้อมูล → AI ช่วยเขียน → แนบรูป → Preview → Export</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4">
        {[{ id: "academic", label: "📄 วิชาการ" }, { id: "ebook", label: "📖 E-book" }].map((c) => (
          <button key={c.id} onClick={() => setTemplateCategory(c.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${templateCategory === c.id ? "bg-emerald-500 text-black" : "border border-white/[0.07] hover:bg-white/5"}`} style={templateCategory !== c.id ? { color: "var(--text-secondary)" } : {}}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {filteredTemplates.map((t) => (
          <button key={t.id} onClick={() => startTemplate(t)} className="text-left rounded-2xl border border-white/[0.07] p-5 hover:border-white/[0.15] hover:-translate-y-0.5 transition-all" style={{ background: "var(--bg-card)" }}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xl mb-3 shadow-lg`}>{t.icon}</div>
            <h3 className="text-sm font-semibold text-white">{t.name}</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>{t.sections.length} ส่วน</p>
          </button>
        ))}
      </div>

      {savedDocs.length > 0 && (<>
        <h2 className="text-sm font-semibold text-white mb-3">เอกสารที่บันทึกไว้</h2>
        <div className="space-y-2">
          {savedDocs.map((d) => (
            <div key={d.id} className="rounded-xl border border-white/[0.07] p-4 flex items-center gap-3" style={{ background: "var(--bg-card)" }}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">{TEMPLATES.find((t) => t.id === d.template_type)?.icon || "📄"}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{d.title}</p><p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{new Date(d.updated_at).toLocaleDateString("th-TH")}</p></div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{d.status === "completed" ? "เสร็จ" : "แบบร่าง"}</span>
            </div>
          ))}
        </div>
      </>)}
    </div>
  );

  // === STEP 2: INFO ===
  if (step === "info") return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <button onClick={() => setStep("select")} className="text-xs text-emerald-400 hover:text-emerald-300 mb-4 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>เลือกเทมเพลตอื่น</button>
      <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-xl shadow-lg`}>{template.icon}</div>
          <div><h2 className="text-base font-semibold text-white">{template.name}</h2><p className="text-xs" style={{ color: "var(--text-muted)" }}>{template.desc}</p></div>
        </div>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-white mb-1">ชื่อเอกสาร / เรื่อง *</label><input value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} placeholder="เช่น การพัฒนาทักษะการอ่าน..." className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-white mb-1">ผู้เขียน</label><input value={info.teacherName} onChange={(e) => setInfo({ ...info, teacherName: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">โรงเรียน/สังกัด</label><input value={info.schoolName} onChange={(e) => setInfo({ ...info, schoolName: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-white mb-1">วิชา/กลุ่มสาระ</label><input value={info.subjectGroup} onChange={(e) => setInfo({ ...info, subjectGroup: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">ระดับชั้น</label><input value={info.gradeLevel} onChange={(e) => setInfo({ ...info, gradeLevel: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">ปีการศึกษา</label><input value={info.academicYear} onChange={(e) => setInfo({ ...info, academicYear: e.target.value })} className={inputClass} /></div>
          </div>
          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium text-white mb-1">ภาพปก</label>
            <div className="flex items-center gap-3">
              {coverImage && <img src={coverImage} alt="" className="w-14 h-20 rounded-lg object-cover border border-white/[0.07]" />}
              <div className="flex flex-col gap-1.5">
                <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-pink-500/10 file:text-pink-400" style={{ color: "var(--text-muted)" }} />
                {gemLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {gemLinks.slice(0, 3).map((g) => (
                      <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12" /></svg>
                        {g.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => { if (!info.title.trim()) { toast("กรุณาระบุชื่อ", "error"); return; } setStep("edit"); }} className="w-full mt-5 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all">เริ่มเขียน →</button>
      </div>
    </div>
  );

  // === STEP 4: PREVIEW ===
  if (step === "preview") return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setStep("edit")} className="text-xs text-emerald-400 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>กลับแก้ไข</button>
        <div className="flex gap-2">
          <button onClick={exportDoc} className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition">Export .doc</button>
          <button onClick={exportPDF} className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">Export PDF</button>
        </div>
      </div>

      {/* Preview document */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#fff", color: "#000" }}>
        {/* Cover */}
        <div className="p-10 text-center border-b" style={{ minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {coverImage && <img src={coverImage} alt="" className="max-h-64 rounded-lg mb-6 shadow-lg" />}
          <h1 style={{ fontFamily: "'TH Sarabun New', sans-serif", fontSize: "24pt", fontWeight: "bold" }}>{info.title}</h1>
          {info.subjectGroup && <p style={{ fontSize: "14pt" }}>{info.subjectGroup} ชั้น{info.gradeLevel}</p>}
          <p style={{ marginTop: "40px", fontSize: "12pt" }}>โดย</p>
          <p style={{ fontSize: "16pt", fontWeight: "bold" }}>{info.teacherName}</p>
          {info.schoolName && <p style={{ fontSize: "12pt" }}>{info.schoolName}</p>}
          <p style={{ marginTop: "30px", fontSize: "12pt" }}>ปีการศึกษา {info.academicYear}</p>
        </div>

        {/* Sections */}
        {template.sections.map((sec) => {
          const d = sections[sec];
          if (!d?.text?.trim() && !d?.images?.length) return null;
          return (
            <div key={sec} className="p-8 border-b" style={{ fontFamily: "'TH Sarabun New', 'Prompt', sans-serif" }}>
              <h2 style={{ fontSize: "18pt", fontWeight: "bold", marginBottom: "12px" }}>{sec}</h2>
              {d.text && d.text.split("\n").map((line, i) => line.trim() ? <p key={i} style={{ fontSize: "14pt", textIndent: "1cm", lineHeight: "1.5", margin: "4px 0" }}>{line}</p> : null)}
              {d.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {d.images.map((img, i) => <img key={i} src={img} alt="" className="max-h-48 rounded-lg shadow" />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // === STEP 3: EDITOR ===
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setStep("info")} className="p-1.5 rounded-lg hover:bg-white/5 transition shrink-0" style={{ color: "var(--text-muted)" }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <h1 className="text-sm font-semibold text-white truncate">{info.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={saveDocument} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/[0.07] hover:bg-white/10 transition text-white disabled:opacity-50">{saving ? "..." : "บันทึก"}</button>
          <button onClick={() => setStep("preview")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">Preview ({filledSections.length}/{template.sections.length})</button>
          <button onClick={exportDoc} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition">.doc</button>
          <button onClick={exportPDF} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-white/[0.07] overflow-hidden sticky top-20" style={{ background: "var(--bg-card)" }}>
            <div className="px-3 py-2.5 border-b border-white/[0.06]"><p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>โครงสร้าง</p></div>
            <div className="py-1">
              {template.sections.map((sec, i) => {
                const hasContent = sections[sec]?.text?.trim() || sections[sec]?.images?.length;
                return (
                  <button key={sec} onClick={() => setActiveSection(i)} className={`w-full text-left px-3 py-2 text-xs transition flex items-center gap-2 ${activeSection === i ? "bg-emerald-500/10 text-emerald-400 font-medium" : "hover:bg-white/[0.03]"}`} style={activeSection !== i ? { color: "var(--text-secondary)" } : {}}>
                    <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${hasContent ? "bg-emerald-500 text-black" : "bg-white/10 text-white/40"}`}>{i + 1}</span>
                    <span className="truncate">{sec}</span>
                    {sections[sec]?.images?.length > 0 && <span className="text-[8px] ml-auto shrink-0" style={{ color: "var(--text-muted)" }}>🖼 {sections[sec].images.length}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-9">
          <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">{currentSection}</h2>
              <div className="flex items-center gap-2">
                {hasAI && (
                  <button onClick={() => askAI(currentSection)} disabled={aiLoading} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition disabled:opacity-50 flex items-center gap-1.5">
                    <svg className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
                    {aiLoading ? "AI กำลังเขียน..." : "AI ช่วยเขียน"}
                  </button>
                )}
              </div>
            </div>

            <textarea value={currentData.text} onChange={(e) => updateText(currentSection, e.target.value)} placeholder={`เขียนเนื้อหา "${currentSection}" ที่นี่...\n\nหรือกดปุ่ม "AI ช่วยเขียน" ให้ AI ร่างเนื้อหาให้`} rows={14} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40 resize-none" style={{ lineHeight: "1.8" }} />

            {/* Images for this section */}
            <div className="mt-3 border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-white">รูปประกอบ ({currentData.images.length})</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => imgRef.current?.click()} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/[0.07] hover:bg-white/10 transition" style={{ color: "var(--text-secondary)" }}>+ แนบรูป</button>
                  {gemLinks.length > 0 && (
                    <div className="relative group/gem">
                      <button className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12" /></svg>
                        สร้างภาพด้วย AI ▾
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/[0.1] py-1 shadow-xl z-20 hidden group-hover/gem:block" style={{ background: "var(--bg-card)" }}>
                        {gemLinks.map((g) => (
                          <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-[10px] text-white hover:bg-white/[0.04] transition">
                            {g.title} →
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <input ref={imgRef} type="file" accept="image/*" onChange={(e) => addImage(currentSection, e)} className="hidden" />
                </div>
              </div>
              {currentData.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentData.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="h-20 rounded-lg object-cover border border-white/[0.07]" />
                      <button onClick={() => removeImage(currentSection, i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nav */}
            <div className="flex justify-between mt-4">
              <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0} className="px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.07] hover:bg-white/5 transition disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>← ก่อนหน้า</button>
              {activeSection === template.sections.length - 1 ? (
                <button onClick={() => setStep("preview")} className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition">Preview ทั้งเล่ม →</button>
              ) : (
                <button onClick={() => setActiveSection(activeSection + 1)} className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">ถัดไป →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
