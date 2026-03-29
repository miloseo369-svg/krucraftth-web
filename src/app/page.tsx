import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Badge2 from "@/components/ui/Badge2";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featuredCourses }, { data: shopProducts }, { count: courseCount }, { count: studentCount }] = await Promise.all([
    supabase.from("courses").select("id, title, description, thumbnail_url, price, instructor:profiles!instructor_id(full_name)").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("products").select("id, title, thumbnail_url, price, category").eq("is_published", true).order("created_at", { ascending: false }).limit(6),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-semibold text-emerald-400">KruCraft</Link>
          <div className="flex items-center gap-5">
            <Link href="/courses" className="text-sm text-[var(--text-secondary)] hover:text-white transition">คอร์สเรียน</Link>
            <Link href="/shop" className="text-sm text-[var(--text-secondary)] hover:text-white transition">ร้านค้า</Link>
            <Link href="/login" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs mb-8" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            แพลตฟอร์มเรียนออนไลน์ภาษาไทย
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight" style={{ lineHeight: "1.35" }}>
            เรียนรู้ทักษะใหม่
            <br />
            <span className="text-emerald-400">ในแบบที่ใช่สำหรับคุณ</span>
          </h1>

          <p className="text-base sm:text-lg mt-6 max-w-lg mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
            คอร์สเรียนคุณภาพจากผู้สอนมืออาชีพ พร้อมใบประกาศนียบัตร เรียนได้ทุกที่ทุกเวลา
          </p>

          <div className="flex items-center justify-center gap-3 mt-10">
            <Link href="/login" className="px-6 py-3 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
              เริ่มเรียนฟรี
            </Link>
            <Link href="/courses" className="px-6 py-3 rounded-lg border text-sm font-medium hover:bg-white/5 transition-all" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              ดูคอร์สทั้งหมด
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div><span className="text-xl font-semibold text-white">{studentCount ?? 0}+</span><span className="ml-1.5">ผู้เรียน</span></div>
            <div className="w-px h-5" style={{ background: "var(--border)" }} />
            <div><span className="text-xl font-semibold text-white">{courseCount ?? 0}+</span><span className="ml-1.5">คอร์ส</span></div>
            <div className="w-px h-5" style={{ background: "var(--border)" }} />
            <div><span className="text-xl font-semibold text-white">24/7</span><span className="ml-1.5">เรียนได้ตลอด</span></div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses && featuredCourses.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-medium text-white">คอร์สแนะนำ</h2>
            <Link href="/courses" className="text-sm text-emerald-400 hover:text-emerald-300 transition">ดูทั้งหมด →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group rounded-xl overflow-hidden border hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-200" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="aspect-video relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-emerald-700/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge2 variant={course.price === 0 ? "free" : "paid"}>
                      {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                    </Badge2>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white text-sm group-hover:text-emerald-400 transition">{course.title}</h3>
                  {course.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{course.description}</p>}
                  <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                    {(course.instructor as unknown as { full_name: string } | null)?.full_name || "KruCraft"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop Preview */}
      {shopProducts && shopProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-medium text-white">ดิจิทัลคอนเทนต์</h2>
            <Link href="/shop" className="text-sm text-emerald-400 hover:text-emerald-300 transition">ดูร้านค้า →</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {shopProducts.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="shrink-0 w-48 rounded-xl overflow-hidden border hover:-translate-y-0.5 transition-all duration-200 group" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-purple-700/20" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition">{p.title}</p>
                  <p className="text-xs mt-1.5 font-medium text-emerald-400">
                    {p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why KruCraft — Social Proof */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white">ทำไมต้อง KruCraft?</h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>ผู้เรียนกว่า {studentCount ?? 0}+ คนเลือกเรียนกับเรา</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "🎯", title: "เนื้อหาตรงจุด", desc: "ออกแบบโดยผู้เชี่ยวชาญ ตรงประเด็น ไม่เยิ่นเย้อ" },
              { icon: "📱", title: "เรียนได้ทุกที่ทุกเวลา", desc: "รองรับทุกอุปกรณ์ เรียนซ้ำได้ไม่จำกัด ตลอดชีพ" },
              { icon: "🏆", title: "ใบประกาศนียบัตร", desc: "เรียนจบรับใบเซอร์ทันที ยืนยันผลการเรียนรู้ได้" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border p-6 text-center hover:-translate-y-0.5 transition-all" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-sm font-medium text-white mt-3">{item.title}</h3>
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-semibold text-white text-center mb-10">เสียงจากผู้เรียน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "ครูแอน", role: "คุณครูประถมศึกษา", text: "ได้ใบงานและสื่อการสอนคุณภาพ ประหยัดเวลาเตรียมสอนมาก เนื้อหาตรงหลักสูตร" },
              { name: "ครูเบส", role: "อาจารย์มัธยม", text: "คอร์สออนไลน์เข้าใจง่าย เรียนได้ตามเวลาที่สะดวก ได้ใบเซอร์ไปอ้างอิงด้วย" },
              { name: "คุณมิว", role: "นักศึกษา", text: "ราคาไม่แพง เนื้อหาครบถ้วน ดีกว่าหลายแพลตฟอร์มที่เคยใช้มา" },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
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

      {/* Urgency CTA Banner */}
      <section className="border-t border-b" style={{ borderColor: "rgba(16,185,129,0.15)", background: "linear-gradient(135deg, rgba(6,78,59,0.4), var(--bg-primary), rgba(6,78,59,0.2))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs text-emerald-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            สมัครวันนี้ เริ่มเรียนได้ทันที
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">อย่ารอช้า — เริ่มพัฒนาตัวเองวันนี้</h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
            สมัครฟรีด้วย Google Account ไม่มีค่าใช้จ่ายในการสมัคร เข้าถึงคอร์สฟรีได้ทันที
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/login" className="px-8 py-3 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/25">
              สมัครฟรีเลย →
            </Link>
          </div>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>ไม่ต้องใช้บัตรเครดิต · สมัครฟรี · เรียนได้ทันที</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          © 2026 KruCraft — ระบบเรียนออนไลน์
        </div>
      </footer>
    </div>
  );
}
