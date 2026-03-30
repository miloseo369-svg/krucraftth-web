"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Option { text: string; is_correct: boolean; }
interface Question { id: string; question: string; type: string; options: Option[]; explanation: string; }

export default function QuizBuilderPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [title, setTitle] = useState("แบบทดสอบ");
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/instructor/quiz?lessonId=${lessonId}`).then((r) => r.json()).then((data) => {
      if (data?.[0]) {
        setQuizId(data[0].id);
        setTitle(data[0].title);
        setPassScore(data[0].pass_score);
        setQuestions(data[0].quiz_questions?.map((q: Question & { order_num: number }) => ({ ...q, id: q.id || crypto.randomUUID() })) ?? []);
      }
      setLoading(false);
    });
  }, [lessonId]);

  function addQuestion() {
    setQuestions((prev) => [...prev, { id: crypto.randomUUID(), question: "", type: "single", options: [{ text: "", is_correct: true }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }], explanation: "" }]);
  }

  function updateQ(idx: number, field: string, value: string) { setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q)); }

  function updateOpt(qIdx: number, oIdx: number, field: string, value: string | boolean) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = q.options.map((o, j) => {
        if (field === "is_correct") return { ...o, is_correct: j === oIdx };
        return j === oIdx ? { ...o, [field]: value } : o;
      });
      return { ...q, options: opts };
    }));
  }

  function removeQ(idx: number) { setQuestions((prev) => prev.filter((_, i) => i !== idx)); }

  async function save() {
    if (questions.length === 0) { toast("เพิ่มคำถามอย่างน้อย 1 ข้อ", "error"); return; }
    setSaving(true);
    const method = quizId ? "PATCH" : "POST";
    const body = quizId ? { quizId, title, passScore, questions } : { lessonId, courseId, title, passScore, questions };
    const res = await fetch("/api/instructor/quiz", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast("บันทึกข้อสอบสำเร็จ!", "success"); if (!quizId) { const data = await res.json(); setQuizId(data.id); } }
    else toast("บันทึกไม่สำเร็จ", "error");
    setSaving(false);
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-sm font-medium text-white">สร้างข้อสอบ</span>
          </div>
          <Link href={`/admin/courses/${courseId}`} className="text-xs text-emerald-400 hover:text-emerald-300">← กลับ</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อแบบทดสอบ" className={`flex-1 ${inputClass}`} />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>เกณฑ์ผ่าน</span>
            <input type="number" min={0} max={100} value={passScore} onChange={(e) => setPassScore(Number(e.target.value))} className={`w-16 text-center ${inputClass}`} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>%</span>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <div key={q.id} className="rounded-2xl border border-white/[0.07] p-5 space-y-3" style={{ background: "var(--bg-card)" }}>
            <div className="flex gap-3">
              <span className="text-emerald-400 text-sm font-bold mt-2.5 shrink-0">{qIdx + 1}.</span>
              <textarea value={q.question} onChange={(e) => updateQ(qIdx, "question", e.target.value)} placeholder="คำถาม..." rows={2} className={`flex-1 resize-none ${inputClass}`} />
              <button onClick={() => removeQ(qIdx)} className="text-red-400/60 hover:text-red-400 text-xs mt-2 shrink-0">ลบ</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
              {q.options.map((o, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input type="radio" name={`q-${q.id}`} checked={o.is_correct} onChange={() => updateOpt(qIdx, oIdx, "is_correct", true)} className="accent-emerald-500" />
                  <input value={o.text} onChange={(e) => updateOpt(qIdx, oIdx, "text", e.target.value)} placeholder={`ตัวเลือก ${oIdx + 1}`} className={`flex-1 text-xs py-1.5 ${inputClass}`} />
                </div>
              ))}
            </div>
            <input value={q.explanation} onChange={(e) => updateQ(qIdx, "explanation", e.target.value)} placeholder="คำอธิบายเฉลย (ไม่บังคับ)" className={`pl-6 text-xs ${inputClass}`} />
          </div>
        ))}

        <div className="flex gap-3">
          <button onClick={addQuestion} className="flex-1 border border-dashed border-white/20 rounded-2xl py-3 text-sm hover:border-emerald-500 hover:text-emerald-400 transition" style={{ color: "var(--text-muted)" }}>+ เพิ่มคำถาม</button>
          <button onClick={save} disabled={saving || questions.length === 0} className="px-8 rounded-2xl py-3 text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">{saving ? "กำลังบันทึก..." : "บันทึก"}</button>
        </div>
      </div>
    </div>
  );
}
