import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "KruCraft — แพลตฟอร์มเรียนออนไลน์สำหรับครูไทย",
  description: "สร้างสื่อการสอน คอร์สเรียน และเอกสารอัจฉริยะ บนแพลตฟอร์มที่ออกแบบมาเพื่อครูไทย",
};
import Badge2 from "@/components/ui/Badge2";
import PremiumCourseCard from "@/components/PremiumCourseCard";
import PublicNav from "@/components/PublicNav";

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
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs mb-8" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            🎓 แพลตฟอร์มเรียนออนไลน์ภาษาไทย
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
            <Link href="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium active:scale-95 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110">
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
              <Link key={p.id} href={`/shop/${p.id}`} className="shrink-0 w-52 rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-md hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-white/[0.12] transition-all duration-500 group">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-teal-800/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
                <div className="p-3.5">
                  <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition-colors duration-300">{p.title}</p>
                  <p className="text-xs mt-2 font-semibold text-emerald-400">
                    {p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mockup Showcase — only show if enough items */}
      {((featuredCourses?.length ?? 0) + (shopProducts?.length ?? 0)) >= 3 && <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 text-xs text-emerald-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ผลงานจริงจากผู้สอน
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">สื่อการสอนคุณภาพกว่า 20+ รายการ</h2>
            <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>ใบงาน, E-Book, Template และคอร์สเรียนที่ออกแบบมาเพื่อครูไทย</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => {
              const allItems = [...(featuredCourses || []), ...(shopProducts || [])];
              const item = allItems[i % allItems.length];
              if (!item) return (
                <div key={i} className="aspect-[3/4] rounded-2xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center group hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-500">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center mx-auto">{i + 1}</div>
                    <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>เร็วๆ นี้</p>
                  </div>
                </div>
              );
              return (
                <Link key={`${item.id}-${i}`} href={item.price !== undefined ? `/shop/${item.id}` : `/courses/${item.id}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.07] hover:border-emerald-500/30 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] transition-all duration-500">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-teal-800/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">{i + 1}</div>
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-medium text-white line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">{item.price === 0 ? "ฟรี" : `฿${item.price?.toLocaleString()}`}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-95 transition-all">
              ดูสินค้าทั้งหมด
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>}

      {/* Big CTA — Urgency */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), var(--bg-primary), rgba(20,184,166,0.1))" }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 text-xs text-red-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                โปรโมชันพิเศษ
              </span>
              <h2 className="text-3xl font-bold text-white" style={{ lineHeight: "1.3" }}>สมัครวันนี้ เข้าถึงคอร์สฟรีทันที</h2>
              <p className="text-sm mt-3" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
                ไม่ต้องใช้บัตรเครดิต สมัครด้วย Google Account เรียนคอร์สฟรีได้ทันที พร้อมรับส่วนลดสำหรับสมาชิกใหม่
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-95 transition-all">
                  สมัครฟรีเลย →
                </Link>
                <Link href="/courses" className="px-6 py-3 rounded-xl border border-white/[0.1] font-medium text-sm hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>
                  ดูคอร์สก่อน
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">✓ สมัครฟรี</span>
                <span className="flex items-center gap-1">✓ ไม่ต้องใช้บัตรเครดิต</span>
                <span className="flex items-center gap-1">✓ เรียนได้ทันที</span>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {(featuredCourses || []).slice(0, 4).map((c, i) => (
                <div key={c.id} className={`rounded-2xl overflow-hidden border border-white/[0.07] ${i === 0 ? "col-span-2" : ""}`}>
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.title} className={`w-full object-cover ${i === 0 ? "h-40" : "h-28"}`} />
                  ) : (
                    <div className={`w-full bg-gradient-to-br from-emerald-900/30 to-teal-800/20 ${i === 0 ? "h-40" : "h-28"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
              <div key={item.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6 text-center hover:-translate-y-1 hover:border-white/[0.12] transition-all duration-300">
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
              <div key={t.name} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6">
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
            🔥 สมัครวันนี้ เริ่มเรียนได้ทันที
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">อย่ารอช้า — เริ่มพัฒนาตัวเองวันนี้</h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
            สมัครฟรีด้วย Google Account ไม่มีค่าใช้จ่ายในการสมัคร เข้าถึงคอร์สฟรีได้ทันที
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/login" className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium active:scale-95 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110">
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
