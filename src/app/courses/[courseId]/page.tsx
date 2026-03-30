import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import ReviewStars from "@/components/ReviewStars";
import CourseReviews from "@/components/CourseReviews";
import TrustBadges from "@/components/TrustBadges";
import FAQAccordion from "@/components/FAQAccordion";
import CourseSalesClient from "./CourseSalesClient";
import WishlistButton from "@/components/WishlistButton";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("title, description, thumbnail_url").eq("id", courseId).single();
  if (!course) return { title: "ไม่พบคอร์ส" };
  return { title: `${course.title} — KruCraft`, description: course.description || `เรียน ${course.title}`, openGraph: { title: course.title, description: course.description || undefined, images: course.thumbnail_url ? [course.thumbnail_url] : undefined } };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*, instructor:profiles(full_name, avatar_url)").eq("id", courseId).single();
  if (!course) notFound();

  const { data: modules } = await supabase.from("modules").select("*, lessons(*)").eq("course_id", courseId).order("sequence");
  const { data: { user } } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
    isEnrolled = !!enrollment;
  }

  const { data: reviews } = await supabase.from("reviews").select("*, user:profiles(full_name, avatar_url)").eq("course_id", courseId).order("created_at", { ascending: false });

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;
  const saleActive = course.sale_ends_at && new Date(course.sale_ends_at) > new Date();
  const discount = saleActive && course.original_price ? Math.round(((course.original_price - course.price) / course.original_price) * 100) : 0;
  const savings = saleActive && course.original_price ? course.original_price - course.price : 0;
  const whatYouLearn = (course.what_you_learn as string[]) || [];
  const faqItems = (course.faq as { q: string; a: string }[]) || [];
  const viewerCount = 15 + Math.floor(Math.random() * 20);

  const defaultFaq = [
    { q: "เรียนได้นานแค่ไหน?", a: "เรียนได้ตลอดชีพ ไม่มีหมดอายุ ย้อนดูได้ไม่จำกัด" },
    { q: "ได้ใบประกาศนียบัตรไหม?", a: "ได้ครับ เรียนจบทุกบทเรียนจะได้รับใบเซอร์อัตโนมัติ" },
    { q: "ชำระเงินยังไง?", a: "โอนเงินผ่านบัญชีธนาคาร/PromptPay แล้วส่งสลิป Admin ตรวจสอบภายใน 30 นาที" },
    { q: "มีนโยบายคืนเงินไหม?", a: "รับประกัน 7 วัน ถ้าเรียนแล้วไม่พอใจ ติดต่อ admin เพื่อขอคืนเงิน" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Announcement */}
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14">
          <Logo />

          <Link href="/courses" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            คอร์สทั้งหมด
          </Link>
        </div>
      </nav>

      {/* Social Proof */}
      <div className="border-b py-3" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-4 justify-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400">
            👥 {course.enrolled_count || 0} คนลงทะเบียนแล้ว
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-amber-500/10 text-amber-400">
            ⭐ {(course.review_avg || 5).toFixed(1)}/5 ({course.review_count || 0} รีวิว)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-blue-500/10 text-blue-400">
            👀 {viewerCount} คนกำลังดูหน้านี้
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero — 2 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT — Visual */}
          <div className="lg:col-span-5">
            <div className="max-w-xs mx-auto lg:mx-0 sticky top-24">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ transform: "perspective(1000px) rotateY(-5deg)", transition: "transform 0.3s" }}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-emerald-900/40 to-teal-800/20 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{discount}%</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Sales */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium mb-3">🎓 คอร์สออนไลน์</span>

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-white" style={{ lineHeight: "1.3" }}>{course.title}</h1>
              {user && <WishlistButton courseId={courseId} />}
            </div>

            <div className="mt-3">
              <ReviewStars avg={course.review_avg || 5} count={course.review_count || 0} />
            </div>

            {course.description && (
              <p className="mt-3 text-base" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{course.description}</p>
            )}

            {/* What You Learn */}
            {whatYouLearn.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-white mb-2">สิ่งที่คุณจะได้เรียนรู้</p>
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex gap-2 text-sm mt-1.5">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust */}
            <div className="mt-5">
              <TrustBadges badges={["⏰ เรียนได้ตลอดชีพ", "🔄 ย้อนดูได้ไม่จำกัด", "🏆 ใบประกาศนียบัตร", `📚 ${totalLessons} บทเรียน`]} />
            </div>

            {/* Countdown + Price + CTA */}
            {isEnrolled ? (
              <div className="mt-6">
                {(() => {
                  const first = modules?.flatMap((m) => m.lessons ?? [])?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)?.[0];
                  return first ? (
                    <Link href={`/courses/${courseId}/lessons/${first.id}`} className="flex items-center justify-center w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all">
                      เข้าเรียนต่อ
                    </Link>
                  ) : (
                    <div className="w-full text-center py-3 rounded-lg text-sm" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>ยังไม่มีบทเรียน</div>
                  );
                })()}
              </div>
            ) : (
              <CourseSalesClient
                courseId={courseId}
                courseTitle={course.title}
                price={course.price}
                originalPrice={course.original_price}
                saleEndsAt={course.sale_ends_at}
                savings={savings}
                discount={discount}
              />
            )}
          </div>
        </div>

        {/* Course Content Accordion */}
        {modules && modules.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">เนื้อหาคอร์ส · {modules.length} โมดูล · {totalLessons} บทเรียน</h2>
            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="rounded-xl overflow-hidden border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
                  <div className="px-5 py-3.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{mod.title}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{mod.lessons?.length ?? 0} บทเรียน</span>
                  </div>
                  <div className="border-t border-white/[0.05]">
                    {mod.lessons?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence).map((lesson: { id: string; title: string; is_free_preview: boolean; type: string }) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition">
                        {isEnrolled || lesson.is_free_preview ? (
                          <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="flex items-center gap-3 flex-1 text-sm hover:text-emerald-400 transition" style={{ color: "var(--text-secondary)" }}>
                            <span className="text-xs">{lesson.type === "video" ? "🎬" : lesson.type === "pdf" ? "📄" : lesson.type === "quiz" ? "📝" : "📡"}</span>
                            {lesson.title}
                            {lesson.is_free_preview && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ดูฟรี</span>}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 flex-1 text-sm opacity-40">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {lesson.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructor Card */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">ผู้สอน</h2>
          <div className="rounded-2xl p-6 border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center gap-4">
              {course.instructor?.avatar_url ? (
                <img src={course.instructor.avatar_url} alt={course.instructor?.full_name || "ผู้สอน"} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-xl font-bold">
                  {(course.instructor?.full_name || "K")[0]}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-white">{course.instructor?.full_name || "KruCraft"}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ผู้สอนบน KruCraft</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <CourseReviews courseId={courseId} reviews={reviews ?? []} isEnrolled={isEnrolled} userId={user?.id} />
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">คำถามที่พบบ่อย</h2>
          <FAQAccordion items={faqItems.length > 0 ? faqItems : defaultFaq} />
        </div>

        {/* Final CTA */}
        {!isEnrolled && (
          <div className="mt-12 rounded-2xl p-8 text-center border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 to-[var(--bg-secondary)]">
            <h2 className="text-xl font-bold text-white">พร้อมเริ่มเรียนแล้วหรือยัง?</h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>เริ่มเรียนได้ทันทีหลังลงทะเบียน · เรียนได้ตลอดชีพ</p>
            <div className="mt-5 max-w-sm mx-auto">
              <EnrollButton courseId={courseId} courseTitle={course.title} price={course.price} creditPrice={course.credit_price ?? 0} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
