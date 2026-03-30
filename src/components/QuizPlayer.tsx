"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

interface Question { id: string; question: string; options: { text: string; is_correct: boolean }[]; explanation: string; }
interface Props { quizId: string; title: string; passScore: number; questions: Question[]; }

export default function QuizPlayer({ quizId, title, passScore, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number; results: Record<string, boolean> } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function submit() {
    if (Object.keys(answers).length < questions.length) { toast("กรุณาตอบให้ครบทุกข้อ", "error"); return; }
    setLoading(true);
    const res = await fetch("/api/quiz/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId, answers }) });
    const data = await res.json();
    if (res.ok) setResult(data);
    else toast(data.error || "เกิดข้อผิดพลาด", "error");
    setLoading(false);
  }

  if (result) return (
    <div className="rounded-2xl border border-white/[0.07] p-6 text-center" style={{ background: "var(--bg-card)" }}>
      <div className={`text-5xl mb-4 ${result.passed ? "text-emerald-400" : "text-red-400"}`}>{result.passed ? "✓" : "✗"}</div>
      <h3 className="text-xl font-bold text-white">{result.passed ? "ผ่าน!" : "ไม่ผ่าน"}</h3>
      <p className="text-3xl font-bold mt-2" style={{ color: result.passed ? "#10b981" : "#ef4444" }}>{result.score}%</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ตอบถูก {result.correct}/{result.total} ข้อ (เกณฑ์ผ่าน {passScore}%)</p>
      {/* Show answers */}
      <div className="mt-6 text-left space-y-3">
        {questions.map((q, i) => {
          const isCorrect = result.results[q.id];
          return (
            <div key={q.id} className={`rounded-xl p-4 border ${isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <p className="text-sm text-white font-medium">{i + 1}. {q.question}</p>
              <div className="mt-2 space-y-1">
                {q.options.map((o, j) => (
                  <p key={j} className={`text-xs px-2 py-1 rounded ${answers[q.id] === j ? (o.is_correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400") : o.is_correct ? "text-emerald-400" : ""}`} style={answers[q.id] !== j && !o.is_correct ? { color: "var(--text-muted)" } : {}}>
                    {o.is_correct ? "✓" : answers[q.id] === j ? "✗" : "○"} {o.text}
                  </p>
                ))}
              </div>
              {q.explanation && <p className="text-xs mt-2 px-2" style={{ color: "var(--text-secondary)" }}>💡 {q.explanation}</p>}
            </div>
          );
        })}
      </div>
      <button onClick={() => { setResult(null); setAnswers({}); }} className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-95 transition-all">ทำใหม่</button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>{questions.length} ข้อ · เกณฑ์ผ่าน {passScore}%</p>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border border-white/[0.05] p-4" style={{ background: "var(--bg-primary)" }}>
            <p className="text-sm font-medium text-white mb-3">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((o, j) => (
                <label key={j} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${answers[q.id] === j ? "bg-emerald-500/10 border border-emerald-500/30" : "hover:bg-white/[0.03]"}`}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === j} onChange={() => setAnswers((p) => ({ ...p, [q.id]: j }))} className="accent-emerald-500" />
                  <span className="text-sm text-white">{o.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={submit} disabled={loading || Object.keys(answers).length < questions.length} className="w-full mt-5 h-12 rounded-xl bg-emerald-500 text-black font-medium hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50">{loading ? "กำลังตรวจ..." : `ส่งคำตอบ (${Object.keys(answers).length}/${questions.length})`}</button>
    </div>
  );
}
