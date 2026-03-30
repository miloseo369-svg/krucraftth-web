"use client";

import { useEffect, useState } from "react";

interface CourseStat { course_id: string; title: string; total_students: number; avg_progress: number; completion_rate: number; total_revenue: number; total_lessons: number; }
interface LessonStat { lesson_id: string; title: string; total_views: number; completion_rate: number; }

export default function InstructorAnalyticsPage() {
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [lessonStats, setLessonStats] = useState<LessonStat[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/analytics").then((r) => r.json()).then((d) => {
      setCourseStats(d.courseStats ?? []);
      if (d.courseStats?.[0]) setSelected(d.courseStats[0].course_id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/instructor/analytics?courseId=${selected}`).then((r) => r.json()).then((d) => setLessonStats(d.lessonStats ?? []));
  }, [selected]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;

  const current = courseStats.find((c) => c.course_id === selected);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics คอร์สของฉัน</h1>

      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full sm:w-72 rounded-xl px-4 py-2.5 text-sm outline-none mb-6 bg-white/[0.05] border border-white/[0.07] text-white focus:border-emerald-500/40">
        {courseStats.map((c) => <option key={c.course_id} value={c.course_id} className="bg-[#0B1120]">{c.title}</option>)}
      </select>

      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "นักเรียน", value: current.total_students.toLocaleString(), color: "text-emerald-400", gradient: "from-emerald-500 to-teal-400" },
            { label: "เรียนจบ", value: `${current.completion_rate}%`, color: "text-blue-400", gradient: "from-blue-500 to-cyan-400" },
            { label: "ความคืบหน้าเฉลี่ย", value: `${current.avg_progress}%`, color: "text-amber-400", gradient: "from-amber-500 to-orange-400" },
            { label: "รายได้รวม", value: `฿${current.total_revenue.toLocaleString()}`, color: "text-purple-400", gradient: "from-purple-500 to-pink-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] p-4 bg-white/[0.03]">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lesson completion table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">บทเรียนที่นักเรียนติดขัด (เรียนน้อยสุด → มากสุด)</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {lessonStats.map((l) => (
            <div key={l.lesson_id} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{l.total_views} คนดู</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${l.completion_rate < 30 ? "bg-red-500" : l.completion_rate < 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${l.completion_rate}%` }} />
                </div>
                <span className={`text-xs font-medium w-10 text-right ${l.completion_rate < 30 ? "text-red-400" : l.completion_rate < 60 ? "text-amber-400" : "text-emerald-400"}`}>{l.completion_rate}%</span>
              </div>
            </div>
          ))}
          {lessonStats.length === 0 && <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>ยังไม่มีข้อมูล</p>}
        </div>
      </div>
    </div>
  );
}
