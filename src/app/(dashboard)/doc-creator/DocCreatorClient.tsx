"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

interface SavedDoc { id: string; title: string; template_type: string; status: string; updated_at: string; }

const TEMPLATES = [
  { id: "research", name: "วิจัยในชั้นเรียน 5 บท", desc: "โครงสร้างครบตามมาตรฐานราชการ", icon: "📄", gradient: "from-blue-500 to-indigo-500",
    sections: ["บทที่ 1 บทนำ", "บทที่ 2 เอกสารและงานวิจัยที่เกี่ยวข้อง", "บทที่ 3 วิธีดำเนินการวิจัย", "บทที่ 4 ผลการวิเคราะห์ข้อมูล", "บทที่ 5 สรุป อภิปราย และข้อเสนอแนะ", "บรรณานุกรม", "ภาคผนวก"] },
  { id: "worksheet", name: "ใบงาน / ใบกิจกรรม", desc: "หัวกระดาษ + ตัวชี้วัด + เนื้อหา", icon: "📝", gradient: "from-emerald-500 to-teal-500",
    sections: ["หัวกระดาษ", "จุดประสงค์การเรียนรู้", "ตัวชี้วัด", "คำชี้แจง", "เนื้อหา/กิจกรรม", "เฉลย"] },
  { id: "lesson_plan", name: "แผนการจัดการเรียนรู้", desc: "แผนการสอนตามหลักสูตร", icon: "📋", gradient: "from-purple-500 to-pink-500",
    sections: ["ข้อมูลทั่วไป", "มาตรฐาน/ตัวชี้วัด", "สาระสำคัญ", "จุดประสงค์การเรียนรู้", "สาระการเรียนรู้", "กิจกรรมการเรียนรู้", "สื่อ/แหล่งเรียนรู้", "การวัดและประเมินผล", "บันทึกหลังสอน"] },
  { id: "ebook", name: "E-book / คู่มือ", desc: "Layout อ่านง่ายบนทุกอุปกรณ์", icon: "📖", gradient: "from-amber-500 to-orange-500",
    sections: ["ปกหน้า", "คำนำ", "สารบัญ", "บทที่ 1", "บทที่ 2", "บทที่ 3", "บรรณานุกรม", "ปกหลัง"] },
  { id: "report", name: "รายงาน SAR / ผลงาน", desc: "รายงานผลการปฏิบัติงาน", icon: "📊", gradient: "from-red-500 to-rose-500",
    sections: ["ปกรายงาน", "บทสรุปผู้บริหาร", "ข้อมูลทั่วไป", "ผลการดำเนินงาน", "ผลลัพธ์/ตัวชี้วัด", "ปัญหาและอุปสรรค", "แนวทางพัฒนา", "ภาคผนวก"] },
];

const AI_PROMPTS: Record<string, Record<string, string>> = {
  research: {
    "บทที่ 1 บทนำ": "เขียนบทนำวิจัยในชั้นเรียน ประกอบด้วย ความเป็นมาและความสำคัญของปัญหา วัตถุประสงค์ ขอบเขต นิยามศัพท์ สมมติฐาน ประโยชน์ที่ได้รับ สำหรับวิชา {subject} ระดับ {grade}",
    "บทที่ 3 วิธีดำเนินการวิจัย": "เขียนบทที่ 3 วิธีดำเนินการวิจัย ประกอบด้วย ประชากรและกลุ่มตัวอย่าง เครื่องมือที่ใช้ วิธีดำเนินการ การเก็บรวบรวมข้อมูล การวิเคราะห์ข้อมูล สำหรับวิชา {subject} ระดับ {grade}",
    "บทที่ 5 สรุป อภิปราย และข้อเสนอแนะ": "เขียนบทที่ 5 สรุปผลการวิจัย อภิปรายผล และข้อเสนอแนะ สำหรับวิจัยเรื่อง {title}",
  },
  worksheet: {
    "คำชี้แจง": "เขียนคำชี้แจงสำหรับใบงาน เรื่อง {title} วิชา {subject} ระดับ {grade}",
    "เนื้อหา/กิจกรรม": "สร้างเนื้อหาใบงานพร้อมคำถาม 5-10 ข้อ เรื่อง {title} วิชา {subject} ระดับ {grade}",
  },
  lesson_plan: {
    "สาระสำคัญ": "เขียนสาระสำคัญสำหรับแผนการสอน เรื่อง {title} วิชา {subject} ระดับ {grade}",
    "กิจกรรมการเรียนรู้": "เขียนกิจกรรมการเรียนรู้ (ขั้นนำ ขั้นสอน ขั้นสรุป) สำหรับ เรื่อง {title} วิชา {subject} ระดับ {grade} จำนวน 1 ชั่วโมง",
  },
};

interface Props {
  userName: string;
  role: string;
  savedDocs: SavedDoc[];
}

export default function DocCreatorClient({ userName, savedDocs }: Props) {
  const [step, setStep] = useState<"select" | "info" | "edit">("select");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [info, setInfo] = useState({ title: "", teacherName: userName, schoolName: "", subjectGroup: "", gradeLevel: "", academicYear: "2569" });
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  function startTemplate(t: typeof TEMPLATES[0]) {
    setTemplate(t);
    const s: Record<string, string> = {};
    t.sections.forEach((sec) => { s[sec] = ""; });
    setSections(s);
    setActiveSection(0);
    setStep("info");
  }

  function startEditing() {
    if (!info.title.trim()) { toast("กรุณาระบุชื่อเอกสาร", "error"); return; }
    setStep("edit");
  }

  async function askAI(sectionName: string) {
    const promptTemplate = AI_PROMPTS[template.id]?.[sectionName];
    if (!promptTemplate) { toast("ไม่มี AI prompt สำหรับส่วนนี้", "info"); return; }

    setAiLoading(true);
    try {
      const prompt = promptTemplate
        .replace("{title}", info.title)
        .replace("{subject}", info.subjectGroup)
        .replace("{grade}", info.gradeLevel);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "doc-assist",
          input: { prompt, format: "text" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const text = typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2);
      setSections((prev) => ({ ...prev, [sectionName]: text }));
      toast("AI สร้างเนื้อหาสำเร็จ!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    } finally {
      setAiLoading(false);
    }
  }

  async function saveDocument() {
    setSaving(true);
    try {
      const doc = {
        template_type: template.id,
        title: info.title,
        subtitle: info.subjectGroup ? `${info.subjectGroup} ${info.gradeLevel}` : null,
        teacher_name: info.teacherName,
        school_name: info.schoolName,
        subject_group: info.subjectGroup,
        grade_level: info.gradeLevel,
        academic_year: info.academicYear,
        content: sections,
        updated_at: new Date().toISOString(),
      };

      if (docId) {
        await supabase.from("user_documents").update(doc).eq("id", docId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase.from("user_documents").insert({ ...doc, user_id: user!.id }).select("id").single();
        if (data) setDocId(data.id);
      }
      toast("บันทึกสำเร็จ!", "success");
    } catch {
      toast("บันทึกไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  }

  function exportDoc() {
    const t = template;
    let html = `<html><head><meta charset="utf-8"><style>
      @page{margin:2.54cm 3.17cm 2.54cm 3.17cm;}
      body{font-family:'TH Sarabun New',sans-serif;font-size:16pt;line-height:1.5;color:#000;margin:0;padding:40px;}
      h1{font-size:18pt;font-weight:bold;text-align:center;margin-bottom:10px;}
      h2{font-size:16pt;font-weight:bold;margin-top:20px;}
      h3{font-size:16pt;font-weight:bold;margin-top:15px;}
      p{text-indent:1cm;margin:5px 0;text-align:justify;}
      .cover{text-align:center;page-break-after:always;padding-top:5cm;}
      .cover h1{font-size:20pt;}
      .section{page-break-before:always;}
      .header{text-align:center;margin-bottom:20px;}
      table{width:100%;border-collapse:collapse;margin:10px 0;}
      td,th{border:1px solid #000;padding:5px 8px;font-size:14pt;}
    </style></head><body>`;

    // Cover
    html += `<div class="cover">`;
    html += `<h1>${info.title}</h1>`;
    if (info.subjectGroup) html += `<p style="text-indent:0;text-align:center">${info.subjectGroup} ชั้น${info.gradeLevel}</p>`;
    html += `<p style="text-indent:0;text-align:center;margin-top:3cm">โดย</p>`;
    html += `<p style="text-indent:0;text-align:center;font-size:18pt;font-weight:bold">${info.teacherName}</p>`;
    if (info.schoolName) html += `<p style="text-indent:0;text-align:center">${info.schoolName}</p>`;
    html += `<p style="text-indent:0;text-align:center;margin-top:2cm">ปีการศึกษา ${info.academicYear}</p>`;
    html += `</div>`;

    // Sections
    t.sections.forEach((sec) => {
      const content = sections[sec] || "";
      if (!content.trim()) return;
      html += `<div class="section"><h2>${sec}</h2>`;
      content.split("\n").forEach((line) => {
        if (line.trim()) html += `<p>${line}</p>`;
      });
      html += `</div>`;
    });

    html += `</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${info.title || "document"}.doc`; a.click();
    URL.revokeObjectURL(url);
    toast("Export .doc สำเร็จ!", "success");
  }

  async function exportPDF() {
    toast("กำลังสร้าง PDF...", "info");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Cover
    doc.setFontSize(20);
    doc.text(info.title || "เอกสาร", 105, 80, { align: "center" });
    doc.setFontSize(14);
    if (info.subjectGroup) doc.text(`${info.subjectGroup} ${info.gradeLevel}`, 105, 95, { align: "center" });
    doc.text("โดย", 105, 140, { align: "center" });
    doc.setFontSize(16);
    doc.text(info.teacherName || "", 105, 155, { align: "center" });
    doc.setFontSize(12);
    if (info.schoolName) doc.text(info.schoolName, 105, 170, { align: "center" });
    doc.text(`ปีการศึกษา ${info.academicYear}`, 105, 250, { align: "center" });

    // Content pages
    template.sections.forEach((sec) => {
      const content = sections[sec] || "";
      if (!content.trim()) return;
      doc.addPage();
      doc.setFontSize(16);
      doc.text(sec, 105, 20, { align: "center" });
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, 35);
    });

    doc.save(`${info.title || "document"}.pdf`);
    toast("สร้าง PDF สำเร็จ!", "success");
  }

  // === RENDER ===

  // Step 1: Select template
  if (step === "select") return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">สร้างเอกสารวิชาการ</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>เลือก Template → กรอกข้อมูล → AI ช่วยเขียน → Export</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-white mb-3">เลือกเทมเพลต</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => startTemplate(t)} className="text-left rounded-2xl border border-white/[0.07] p-5 hover:border-white/[0.15] hover:-translate-y-0.5 transition-all" style={{ background: "var(--bg-card)" }}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xl mb-3 shadow-lg`}>{t.icon}</div>
            <h3 className="text-sm font-semibold text-white">{t.name}</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>{t.sections.length} ส่วน</p>
          </button>
        ))}
      </div>

      {/* Saved docs */}
      {savedDocs.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-white mb-3">เอกสารที่บันทึกไว้</h2>
          <div className="space-y-2">
            {savedDocs.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/[0.07] p-4 flex items-center gap-3" style={{ background: "var(--bg-card)" }}>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">
                  {TEMPLATES.find((t) => t.id === d.template_type)?.icon || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{d.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{TEMPLATES.find((t) => t.id === d.template_type)?.name} · {new Date(d.updated_at).toLocaleDateString("th-TH")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {d.status === "completed" ? "เสร็จ" : "แบบร่าง"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Step 2: Fill info
  if (step === "info") return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <button onClick={() => setStep("select")} className="text-xs text-emerald-400 hover:text-emerald-300 mb-4 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        เลือกเทมเพลตอื่น
      </button>

      <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-xl shadow-lg`}>{template.icon}</div>
          <div>
            <h2 className="text-base font-semibold text-white">{template.name}</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{template.desc}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-white mb-1">ชื่อเอกสาร / เรื่อง *</label><input value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} placeholder="เช่น การพัฒนาทักษะการอ่าน..." className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-white mb-1">ชื่อผู้เขียน</label><input value={info.teacherName} onChange={(e) => setInfo({ ...info, teacherName: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">โรงเรียน</label><input value={info.schoolName} onChange={(e) => setInfo({ ...info, schoolName: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-white mb-1">กลุ่มสาระ/วิชา</label><input value={info.subjectGroup} onChange={(e) => setInfo({ ...info, subjectGroup: e.target.value })} placeholder="เช่น วิทยาศาสตร์" className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">ระดับชั้น</label><input value={info.gradeLevel} onChange={(e) => setInfo({ ...info, gradeLevel: e.target.value })} placeholder="เช่น ป.3" className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-white mb-1">ปีการศึกษา</label><input value={info.academicYear} onChange={(e) => setInfo({ ...info, academicYear: e.target.value })} className={inputClass} /></div>
          </div>
        </div>

        <button onClick={startEditing} className="w-full mt-5 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all">
          เริ่มเขียน →
        </button>
      </div>
    </div>
  );

  // Step 3: Editor
  const currentSection = template.sections[activeSection];
  const hasAI = AI_PROMPTS[template.id]?.[currentSection];

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setStep("info")} className="p-1.5 rounded-lg hover:bg-white/5 transition shrink-0" style={{ color: "var(--text-muted)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-sm font-semibold text-white truncate">{info.title}</h1>
          <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r ${template.gradient} text-white`}>{template.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={saveDocument} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/[0.07] hover:bg-white/10 transition text-white disabled:opacity-50">
            {saving ? "..." : "บันทึก"}
          </button>
          <button onClick={exportDoc} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition">.doc</button>
          <button onClick={exportPDF} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar — sections */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-white/[0.07] overflow-hidden sticky top-20" style={{ background: "var(--bg-card)" }}>
            <div className="px-3 py-2.5 border-b border-white/[0.06]">
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>โครงสร้าง</p>
            </div>
            <div className="py-1">
              {template.sections.map((sec, i) => (
                <button key={sec} onClick={() => setActiveSection(i)} className={`w-full text-left px-3 py-2 text-xs transition flex items-center gap-2 ${activeSection === i ? "bg-emerald-500/10 text-emerald-400 font-medium" : "hover:bg-white/[0.03]"}`} style={activeSection !== i ? { color: "var(--text-secondary)" } : {}}>
                  <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${sections[sec]?.trim() ? "bg-emerald-500 text-black" : "bg-white/10 text-white/40"}`}>{i + 1}</span>
                  <span className="truncate">{sec}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-9">
          <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">{currentSection}</h2>
              {hasAI && (
                <button onClick={() => askAI(currentSection)} disabled={aiLoading} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition disabled:opacity-50 flex items-center gap-1.5">
                  <svg className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  {aiLoading ? "AI กำลังเขียน..." : "AI ช่วยเขียน"}
                </button>
              )}
            </div>
            <textarea
              value={sections[currentSection] || ""}
              onChange={(e) => setSections((prev) => ({ ...prev, [currentSection]: e.target.value }))}
              placeholder={`เขียนเนื้อหาสำหรับ "${currentSection}" ที่นี่...\n\nหรือกดปุ่ม "AI ช่วยเขียน" เพื่อให้ AI ร่างเนื้อหาให้`}
              rows={18}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40 resize-none"
              style={{ lineHeight: "1.8", fontFamily: "'TH Sarabun New', 'Prompt', sans-serif" }}
            />

            {/* Nav buttons */}
            <div className="flex justify-between mt-4">
              <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0} className="px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.07] hover:bg-white/5 transition disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                ← ส่วนก่อนหน้า
              </button>
              <button onClick={() => setActiveSection(Math.min(template.sections.length - 1, activeSection + 1))} disabled={activeSection === template.sections.length - 1} className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-30">
                ส่วนถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
