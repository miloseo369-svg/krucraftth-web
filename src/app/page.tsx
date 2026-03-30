import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PublicNav from "@/components/PublicNav";
import PremiumCourseCard from "@/components/PremiumCourseCard";

export const metadata: Metadata = {
  title: "KruCraft — แพลตฟอร์มเรียนออนไลน์สำหรับครูไทย",
  description: "สร้างสื่อการสอน คอร์สเรียน และเอกสารอัจฉริยะ บนแพลตฟอร์มที่ออกแบบมาเพื่อครูไทย",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featuredCourses }, { count: courseCount }, { count: studentCount }] = await Promise.all([
    supabase.from("courses").select("id, title, description, thumbnail_url, price, instructor:profiles!instructor_id(full_name)").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ lineHeight: "1.2" }}>
            พัฒนาทักษะ
            <span className="text-emerald-400"> ที่ใช้ได้จริง</span>
            <br />
            <span className="text-emerald-400">สำหรับครูไทย</span>ยุคใหม่
          </h1>

          <p className="text-lg mt-6 max-w-xl mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
            คอร์สเรียน · สื่อการสอน · AI เครื่องมือ — ทุกอย่างที่ครูต้องการ ในที่เดียว
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-lg active:scale-95 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110">
              เริ่มเรียนฟรี — ไม่มีค่าใช้จ่าย
            </Link>
          </div>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>สมัครด้วย Google Account · ไม่ต้องใช้บัตรเครดิต · เข้าเรียนได้ทันที</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mt-16">
            {[
              { value: `${studentCount ?? 0}+`, label: "ผู้เรียน" },
              { value: `${courseCount ?? 0}+`, label: "คอร์ส" },
              { value: "24/7", label: "เรียนได้ตลอด" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why KruCraft ─── */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🎯", title: "เนื้อหาตรงจุด", desc: "ออกแบบโดยผู้เชี่ยวชาญ ใช้งานได้จริง ตรงหลักสูตร" },
              { icon: "🤖", title: "AI ช่วยสร้างสื่อ", desc: "สร้างแผนการสอน ใบงาน ข้อสอบ วิจัย ด้วย AI ในคลิกเดียว" },
              { icon: "🏆", title: "ใบประกาศนียบัตร", desc: "เรียนจบรับใบเซอร์ทันที ยืนยันการพัฒนาตนเอง" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.07] p-6 text-center hover:-translate-y-1 hover:border-emerald-500/20 transition-all duration-300" style={{ background: "var(--bg-card)" }}>
                <span className="text-4xl">{item.icon}</span>
                <h3 className="text-base font-semibold text-white mt-4">{item.title}</h3>
                <p className="text-sm mt-2" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      {featuredCourses && featuredCourses.length > 0 && (
        <section style={{ background: "var(--bg-secondary)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white">คอร์สยอดนิยม</h2>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>เลือกเรียนได้ตามความสนใจ เรียนซ้ำได้ไม่จำกัด</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <PremiumCourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                  imageUrl={course.thumbnail_url}
                  href={`/courses/${course.id}`}
                  instructor={(course.instructor as unknown as { full_name: string } | null)?.full_name || "KruCraft"}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/courses" className="text-sm text-emerald-400 hover:text-emerald-300 transition font-medium">ดูคอร์สทั้งหมด →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">เสียงจากผู้เรียน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "ครูแอน", role: "คุณครูประถมศึกษา", text: "ได้ใบงานและสื่อการสอนคุณภาพ ประหยัดเวลาเตรียมสอนมาก เนื้อหาตรงหลักสูตร" },
              { name: "ครูเบส", role: "อาจารย์มัธยม", text: "คอร์สเข้าใจง่าย เรียนได้ตามเวลาที่สะดวก ได้ใบเซอร์ไปอ้างอิงด้วย" },
              { name: "คุณมิว", role: "นักศึกษา", text: "ราคาไม่แพง เนื้อหาครบถ้วน AI ช่วยสร้างเอกสารสะดวกมาก" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA — Full Width ─── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(6,78,59,0.5), var(--bg-primary), rgba(6,78,59,0.3))" }}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ lineHeight: "1.3" }}>
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-base mt-4" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
            เข้าร่วมกับครูไทยกว่า {studentCount ?? 0}+ คนที่เลือกใช้ KruCraft<br />สมัครฟรี เรียนได้ทันที ไม่มีข้อผูกมัด
          </p>
          <Link href="/login" className="inline-block mt-8 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-lg active:scale-95 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110">
            สมัครฟรีเลย →
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>✓ สมัครฟรี</span>
            <span>✓ ไม่ต้องใช้บัตรเครดิต</span>
            <span>✓ เรียนได้ทันที</span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>© 2026 KruCraft — แพลตฟอร์มเรียนออนไลน์สำหรับครูไทย</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/refund-policy" className="hover:text-white transition">นโยบายการคืนเงิน</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
