import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "คอร์สเรียนทั้งหมด",
  description: "เรียนรู้ทักษะใหม่ผ่านคอร์สเรียนออนไลน์คุณภาพสูง จาก KruCraft",
};
import Badge2 from "@/components/ui/Badge2";
import PremiumCourseCard from "@/components/PremiumCourseCard";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { q, filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("courses").select("*, instructor:profiles(full_name)").eq("is_published", true).order("created_at", { ascending: false });
  if (q?.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  if (filter === "free") query = query.eq("price", 0);
  else if (filter === "paid") query = query.gt("price", 0);

  const { data: courses } = await query;

  const filters = [
    { value: "", label: "ทั้งหมด" },
    { value: "free", label: "ฟรี" },
    { value: "paid", label: "มีค่าใช้จ่าย" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav active="courses" />

      {/* Sticky Filter Bar */}
      <div className="sticky top-14 z-40 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <form className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" name="q" defaultValue={q ?? ""} placeholder="ค้นหาคอร์ส..." className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {filters.map((f) => (
                <button key={f.value} type="submit" name="filter" value={f.value} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${filter === f.value || (!filter && f.value === "") ? "bg-emerald-500 text-black" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`} style={filter !== f.value && (filter || f.value !== "") ? { border: "1px solid var(--border)" } : {}}>
                  {f.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {q && (
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            ผลการค้นหา &quot;{q}&quot; — {courses?.length ?? 0} คอร์ส
            <Link href="/courses" className="text-emerald-400 ml-2 hover:underline">ล้าง</Link>
          </p>
        )}

        {!courses || courses.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={q ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"} /></svg>
            <p className="text-sm font-medium text-white">{q ? "ไม่พบคอร์สที่ค้นหา" : "ยังไม่มีคอร์ส"}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{q ? "ลองค้นหาด้วยคำอื่น" : "กลับมาใหม่เร็วๆ นี้"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <PremiumCourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                price={course.price}
                imageUrl={course.thumbnail_url}
                href={`/courses/${course.id}`}
                instructor={course.instructor?.full_name || "KruCraft"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
