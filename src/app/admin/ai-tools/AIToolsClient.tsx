"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

interface Tool {
  id: string;
  name: string;
  desc: string;
  gradient: string;
  svg: string;
  category: "teaching" | "business" | "analysis";
  access: "all" | "admin";
}

const TOOLS: Tool[] = [
  // Teaching
  { id: "lesson-plan", name: "สร้างแผนการสอน", desc: "ออกแบบแผนการสอนตามหลักสูตร", gradient: "from-blue-500 to-cyan-400", svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", category: "teaching", access: "all" },
  { id: "worksheet", name: "สร้างใบงาน", desc: "ใบงานอัตโนมัติ พร้อมเฉลย", gradient: "from-purple-500 to-pink-400", svg: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", category: "teaching", access: "all" },
  { id: "summarize", name: "สรุปเนื้อหา", desc: "สรุปเป็น Mind Map / Key Points", gradient: "from-emerald-500 to-teal-400", svg: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", category: "teaching", access: "all" },
  { id: "exam", name: "สร้างข้อสอบ", desc: "ปรนัย อัตนัย พร้อมเกณฑ์คะแนน", gradient: "from-amber-500 to-orange-400", svg: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", category: "teaching", access: "all" },
  { id: "translate", name: "แปลเนื้อหา", desc: "แปลสื่อการสอนเป็นภาษาอื่น", gradient: "from-rose-500 to-red-400", svg: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129", category: "teaching", access: "all" },
  { id: "student-analysis", name: "วิเคราะห์ผู้เรียน", desc: "วิเคราะห์จุดแข็ง/อ่อน แนะนำ", gradient: "from-indigo-500 to-blue-400", svg: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", category: "teaching", access: "all" },
  // Business
  { id: "sales-page", name: "สร้าง Sales Page", desc: "เขียน Copy ปิดการขาย", gradient: "from-pink-500 to-rose-500", svg: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z", category: "business", access: "all" },
  { id: "email-marketing", name: "สร้าง Email Marketing", desc: "Email Sequence อัตโนมัติ", gradient: "from-violet-500 to-purple-600", svg: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", category: "business", access: "all" },
  { id: "content-calendar", name: "วางแผน Content Calendar", desc: "แผนโพสต์ Social Media", gradient: "from-teal-500 to-emerald-500", svg: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", category: "business", access: "all" },
  // Analysis (admin only)
  { id: "business-analysis", name: "วิเคราะห์ธุรกิจคอร์ส", desc: "วิเคราะห์รายได้ + engagement", gradient: "from-blue-600 to-cyan-500", svg: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", category: "analysis", access: "admin" },
  { id: "competitor-analysis", name: "วิเคราะห์คู่แข่ง", desc: "SWOT + กลยุทธ์แข่งขัน", gradient: "from-amber-500 to-orange-500", svg: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", category: "analysis", access: "admin" },
  { id: "risk-analysis", name: "วิเคราะห์ความเสี่ยง", desc: "ประเมินความเสี่ยงธุรกิจ", gradient: "from-red-500 to-rose-600", svg: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", category: "analysis", access: "admin" },
];

const TABS = [
  { id: "teaching", label: "🎓 การสอน" },
  { id: "business", label: "💼 ธุรกิจ" },
  { id: "analysis", label: "📊 วิเคราะห์" },
];

interface Props {
  role: string;
  courses: { id: string; title: string }[];
  products: { id: string; title: string; price: number }[];
}

export default function AIToolsClient({ role, courses, products }: Props) {
  const [tab, setTab] = useState("teaching");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const filtered = TOOLS.filter((t) => t.category === tab);

  const setInput = (key: string, value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: activeTool.id, input: inputs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      setResult(data.result);
      toast("สร้างสำเร็จ!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  function openTool(tool: Tool) {
    if (tool.access === "admin" && role !== "admin") {
      toast("เฉพาะ Admin เท่านั้น", "error");
      return;
    }
    setActiveTool(tool);
    setInputs({});
    setResult(null);
  }

  function copyResult() {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast("คัดลอกแล้ว!", "success");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">AI Tools</span>
              <span className="text-white"> ศูนย์กลาง</span>
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>เครื่องมือ AI ช่วยจัดการธุรกิจและการสอน</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          Powered by Claude AI
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-emerald-500 text-black" : "border border-white/[0.07] hover:bg-white/5"}`} style={tab !== t.id ? { color: "var(--text-secondary)" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => {
          const locked = tool.access === "admin" && role !== "admin";
          return (
            <button key={tool.id} onClick={() => openTool(tool)} disabled={locked} className={`text-left rounded-2xl border border-white/[0.07] p-5 transition-all duration-200 ${locked ? "opacity-50 cursor-not-allowed" : "hover:border-white/[0.15] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] cursor-pointer"}`} style={{ background: "var(--bg-card)" }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.svg} /></svg>
              </div>
              <h3 className="font-semibold text-sm text-white mt-3">{tool.name}</h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>{tool.desc}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">Powered by Claude</span>
                {locked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Admin Only</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setActiveTool(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.1] p-6 animate-fade-in" style={{ background: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTool.gradient} flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activeTool.svg} /></svg>
                </div>
                <h2 className="text-lg font-semibold text-white">{activeTool.name}</h2>
              </div>
              <button onClick={() => setActiveTool(null)} className="p-2 rounded-lg hover:bg-white/5 transition" style={{ color: "var(--text-muted)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Dynamic form based on tool */}
            <div className="space-y-4">
              {renderToolForm(activeTool, inputs, setInput, courses, products)}
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSubmit} disabled={loading} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    AI กำลังคิด...
                  </span>
                ) : "สร้างด้วย AI →"}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-6 rounded-xl border border-emerald-500/20 p-4" style={{ background: "rgba(16,185,129,0.05)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-emerald-400">ผลลัพธ์</span>
                  <button onClick={copyResult} className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/[0.07] hover:bg-white/10 transition" style={{ color: "var(--text-secondary)" }}>คัดลอก</button>
                </div>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40 transition";

function renderToolForm(
  tool: Tool,
  inputs: Record<string, string>,
  setInput: (key: string, value: string) => void,
  courses: { id: string; title: string }[],
  products: { id: string; title: string; price: number }[]
) {
  switch (tool.id) {
    case "lesson-plan":
      return (<>
        <Field label="วิชา" value={inputs.subject || ""} onChange={(v) => setInput("subject", v)} placeholder="เช่น คณิตศาสตร์ ป.3" />
        <Field label="ระดับชั้น" value={inputs.grade || ""} onChange={(v) => setInput("grade", v)} placeholder="เช่น ป.3, ม.1" />
        <Field label="จำนวนชั่วโมง" value={inputs.hours || ""} onChange={(v) => setInput("hours", v)} placeholder="เช่น 2" />
      </>);
    case "worksheet":
      return (<>
        <Field label="หัวข้อ" value={inputs.topic || ""} onChange={(v) => setInput("topic", v)} placeholder="เช่น การบวกลบเลขสองหลัก" />
        <Field label="ระดับชั้น" value={inputs.grade || ""} onChange={(v) => setInput("grade", v)} placeholder="เช่น ป.2" />
        <Field label="จำนวนข้อ" value={inputs.count || ""} onChange={(v) => setInput("count", v)} placeholder="เช่น 10" />
      </>);
    case "summarize":
      return (<>
        <FieldTextarea label="เนื้อหาที่ต้องการสรุป" value={inputs.content || ""} onChange={(v) => setInput("content", v)} placeholder="วางเนื้อหาที่ต้องการสรุป..." />
        <FieldSelect label="รูปแบบ" value={inputs.format || ""} onChange={(v) => setInput("format", v)} options={[["สรุปย่อ", "สรุปย่อ"], ["Key Points", "Key Points"], ["Mind Map", "Mind Map"]]} />
      </>);
    case "exam":
      return (<>
        <Field label="วิชา" value={inputs.subject || ""} onChange={(v) => setInput("subject", v)} placeholder="เช่น วิทยาศาสตร์" />
        <Field label="ระดับชั้น" value={inputs.grade || ""} onChange={(v) => setInput("grade", v)} placeholder="เช่น ม.3" />
        <Field label="จำนวนข้อ" value={inputs.count || ""} onChange={(v) => setInput("count", v)} placeholder="เช่น 20" />
        <FieldSelect label="ประเภท" value={inputs.type || ""} onChange={(v) => setInput("type", v)} options={[["ปรนัย", "ปรนัย"], ["อัตนัย", "อัตนัย"], ["ผสม", "ผสม"]]} />
      </>);
    case "translate":
      return (<>
        <FieldTextarea label="เนื้อหาที่ต้องการแปล" value={inputs.content || ""} onChange={(v) => setInput("content", v)} placeholder="วางเนื้อหาที่ต้องการแปล..." />
        <FieldSelect label="ภาษาปลายทาง" value={inputs.targetLang || ""} onChange={(v) => setInput("targetLang", v)} options={[["อังกฤษ", "อังกฤษ"], ["จีน", "จีน"], ["ญี่ปุ่น", "ญี่ปุ่น"], ["เกาหลี", "เกาหลี"]]} />
      </>);
    case "student-analysis":
      return (<>
        <Field label="คะแนนเฉลี่ย (0-100)" value={inputs.avgScore || ""} onChange={(v) => setInput("avgScore", v)} placeholder="75" />
        <Field label="อัตราเรียนจบ (%)" value={inputs.completionRate || ""} onChange={(v) => setInput("completionRate", v)} placeholder="65" />
        <Field label="จำนวนผู้เรียน" value={inputs.studentCount || ""} onChange={(v) => setInput("studentCount", v)} placeholder="50" />
      </>);
    case "business-analysis":
      return (<>
        <FieldSelect label="เลือกคอร์ส" value={inputs.courseName || ""} onChange={(v) => setInput("courseName", v)} options={courses.map((c) => [c.title, c.title])} />
        <Field label="จำนวนผู้เรียน" value={inputs.enrolledCount || ""} onChange={(v) => setInput("enrolledCount", v)} placeholder="100" />
        <Field label="รายได้รวม (฿)" value={inputs.revenue || ""} onChange={(v) => setInput("revenue", v)} placeholder="50000" />
        <Field label="อัตราเรียนจบ (%)" value={inputs.completionRate || ""} onChange={(v) => setInput("completionRate", v)} placeholder="70" />
        <FieldSelect label="ระยะเวลา" value={inputs.days || ""} onChange={(v) => setInput("days", v)} options={[["30", "30 วัน"], ["60", "60 วัน"], ["90", "90 วัน"]]} />
      </>);
    case "sales-page":
      return (<>
        <Field label="ชื่อสินค้า/คอร์ส" value={inputs.name || ""} onChange={(v) => setInput("name", v)} placeholder="ชื่อที่ต้องการเขียน Sales Page" />
        <Field label="กลุ่มเป้าหมาย" value={inputs.targetAudience || ""} onChange={(v) => setInput("targetAudience", v)} placeholder="เช่น ครูประถมศึกษา" />
        <Field label="จุดเด่น (คั่นด้วยคอมมา)" value={inputs.features || ""} onChange={(v) => setInput("features", v)} placeholder="เช่น ใช้ง่าย, ตรงหลักสูตร, อัปเดตฟรี" />
        <Field label="ราคา (฿)" value={inputs.price || ""} onChange={(v) => setInput("price", v)} placeholder="299" />
        <FieldSelect label="Tone" value={inputs.tone || ""} onChange={(v) => setInput("tone", v)} options={[["เป็นกันเอง", "เป็นกันเอง"], ["มืออาชีพ", "มืออาชีพ"], ["กระตุ้นอารมณ์", "กระตุ้นอารมณ์"]]} />
      </>);
    case "competitor-analysis":
      return (<>
        <Field label="สินค้าของเรา" value={inputs.ourProduct || ""} onChange={(v) => setInput("ourProduct", v)} placeholder="ชื่อคอร์ส/สินค้า" />
        <Field label="ราคาของเรา (฿)" value={inputs.ourPrice || ""} onChange={(v) => setInput("ourPrice", v)} placeholder="499" />
        <Field label="จุดเด่นของเรา" value={inputs.ourFeatures || ""} onChange={(v) => setInput("ourFeatures", v)} placeholder="เช่น เนื้อหาครบ, ราคาถูก" />
        <FieldTextarea label="คู่แข่ง (ชื่อ - ราคา - จุดเด่น แต่ละรายขึ้นบรรทัดใหม่)" value={inputs.competitorsRaw || ""} onChange={(v) => setInput("competitorsRaw", v)} placeholder="คู่แข่ง A - 599 - เนื้อหาดี&#10;คู่แข่ง B - 399 - ราคาถูก" />
      </>);
    case "email-marketing":
      return (<>
        <FieldSelect label="เป้าหมาย" value={inputs.goal || ""} onChange={(v) => setInput("goal", v)} options={[["โปรโมทคอร์สใหม่", "โปรโมทคอร์สใหม่"], ["ดึงคนกลับมา", "ดึงคนกลับมา"], ["แจ้งโปรโมชัน", "แจ้งโปรโมชัน"]]} />
        <Field label="ชื่อสินค้า/คอร์ส" value={inputs.productName || ""} onChange={(v) => setInput("productName", v)} placeholder="ชื่อสินค้า" />
        <Field label="ราคา (฿)" value={inputs.price || ""} onChange={(v) => setInput("price", v)} placeholder="299" />
        <Field label="กลุ่มเป้าหมาย" value={inputs.targetAudience || ""} onChange={(v) => setInput("targetAudience", v)} placeholder="เช่น ครูมัธยม" />
        <FieldSelect label="จำนวน Email" value={inputs.count || ""} onChange={(v) => setInput("count", v)} options={[["3", "3 ฉบับ"], ["5", "5 ฉบับ"], ["7", "7 ฉบับ"]]} />
      </>);
    case "content-calendar":
      return (<>
        <Field label="ชื่อสินค้า/คอร์ส" value={inputs.productName || ""} onChange={(v) => setInput("productName", v)} placeholder="ชื่อสินค้า" />
        <Field label="แพลตฟอร์ม (คั่นด้วยคอมมา)" value={inputs.platforms || ""} onChange={(v) => setInput("platforms", v)} placeholder="Facebook, Line, TikTok" />
        <FieldSelect label="ระยะเวลา" value={inputs.duration || ""} onChange={(v) => setInput("duration", v)} options={[["2 สัปดาห์", "2 สัปดาห์"], ["1 เดือน", "1 เดือน"]]} />
        <FieldSelect label="เป้าหมาย" value={inputs.goal || ""} onChange={(v) => setInput("goal", v)} options={[["สร้าง Awareness", "สร้าง Awareness"], ["กระตุ้นซื้อ", "กระตุ้นซื้อ"], ["Build Community", "Build Community"]]} />
        <FieldSelect label="Posts/สัปดาห์" value={inputs.postsPerWeek || ""} onChange={(v) => setInput("postsPerWeek", v)} options={[["3", "3 โพสต์"], ["5", "5 โพสต์"], ["7", "7 โพสต์"]]} />
      </>);
    case "risk-analysis":
      return (<>
        <Field label="รายได้เดือน 1 (฿)" value={inputs.rev1 || ""} onChange={(v) => setInput("rev1", v)} placeholder="10000" />
        <Field label="รายได้เดือน 2 (฿)" value={inputs.rev2 || ""} onChange={(v) => setInput("rev2", v)} placeholder="12000" />
        <Field label="รายได้เดือน 3 (฿)" value={inputs.rev3 || ""} onChange={(v) => setInput("rev3", v)} placeholder="15000" />
        <Field label="Active Users" value={inputs.activeUsers || ""} onChange={(v) => setInput("activeUsers", v)} placeholder="50" />
        <Field label="Churn Rate (%)" value={inputs.churnRate || ""} onChange={(v) => setInput("churnRate", v)} placeholder="10" />
        <Field label="ค่าใช้จ่าย/เดือน (฿)" value={inputs.expenses || ""} onChange={(v) => setInput("expenses", v)} placeholder="5000" />
        <Field label="คอร์สขายดี" value={inputs.bestCourse || ""} onChange={(v) => setInput("bestCourse", v)} placeholder="ชื่อคอร์ส" />
        <Field label="คอร์สขายแย่" value={inputs.worstCourse || ""} onChange={(v) => setInput("worstCourse", v)} placeholder="ชื่อคอร์ส" />
        <FieldTextarea label="แผน 6 เดือน" value={inputs.plan || ""} onChange={(v) => setInput("plan", v)} placeholder="แผนธุรกิจระยะ 6 เดือนข้างหน้า..." />
      </>);
    default:
      return <p className="text-sm" style={{ color: "var(--text-muted)" }}>ไม่พบฟอร์มสำหรับ tool นี้</p>;
  }
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={inputClass} />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">-- เลือก --</option>
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  );
}
