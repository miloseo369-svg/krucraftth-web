import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["instructor", "admin"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  // ดึงคอร์สของ instructor
  const { data: courses } = await supabase.from("courses").select("id, title, price, is_published").eq("instructor_id", user.id);
  const courseIds = courses?.map((c) => c.id) ?? [];
  if (courseIds.length === 0) return NextResponse.json({ courseStats: [], lessonStats: [], trend: [] });

  // Enrollments per course
  const { data: enrollments } = await supabase.from("enrollments").select("course_id, user_id, enrolled_at").in("course_id", courseIds);

  // Progress
  const { data: progress } = await supabase.from("user_progress").select("lesson_id, is_completed, user_id").in("lesson_id",
    (await supabase.from("lessons").select("id").in("course_id", courseIds)).data?.map((l) => l.id) ?? []
  );

  // Lessons per course
  const { data: lessons } = await supabase.from("lessons").select("id, course_id, title, module_id").in("course_id", courseIds);

  // Revenue from payment slips
  const { data: slips } = await supabase.from("payment_slips").select("item_id, amount").eq("item_type", "course").eq("status", "approved").in("item_id", courseIds);

  // Build course stats
  const courseStats = courses?.map((c) => {
    const enrolled = enrollments?.filter((e) => e.course_id === c.id) ?? [];
    const courseLessons = lessons?.filter((l) => l.course_id === c.id) ?? [];
    const lessonIds = courseLessons.map((l) => l.id);
    const courseProgress = progress?.filter((p) => lessonIds.includes(p.lesson_id)) ?? [];
    const completedUsers = new Set(courseProgress.filter((p) => p.is_completed).map((p) => p.user_id));

    // Avg progress per student
    const studentProgress: Record<string, number> = {};
    enrolled.forEach((e) => {
      const done = courseProgress.filter((p) => p.user_id === e.user_id && p.is_completed).length;
      studentProgress[e.user_id] = courseLessons.length > 0 ? Math.round((done / courseLessons.length) * 100) : 0;
    });
    const avgProgress = enrolled.length > 0 ? Math.round(Object.values(studentProgress).reduce((a, b) => a + b, 0) / enrolled.length) : 0;

    const revenue = slips?.filter((s) => s.item_id === c.id).reduce((sum, s) => sum + s.amount, 0) ?? 0;
    const completionRate = enrolled.length > 0 ? Math.round((Array.from(completedUsers).filter((uid) => studentProgress[uid] === 100).length / enrolled.length) * 100) : 0;

    return { course_id: c.id, title: c.title, price: c.price, is_published: c.is_published, total_students: enrolled.length, avg_progress: avgProgress, completion_rate: completionRate, total_revenue: revenue, total_lessons: courseLessons.length };
  }) ?? [];

  // Lesson stats for selected course
  let lessonStats: { lesson_id: string; title: string; total_views: number; completion_rate: number }[] = [];
  if (courseId) {
    const courseLessons = lessons?.filter((l) => l.course_id === courseId) ?? [];
    const courseEnrolled = enrollments?.filter((e) => e.course_id === courseId).length ?? 0;
    lessonStats = courseLessons.map((l) => {
      const lProgress = progress?.filter((p) => p.lesson_id === l.id) ?? [];
      const views = new Set(lProgress.map((p) => p.user_id)).size;
      const completed = lProgress.filter((p) => p.is_completed).length;
      const rate = courseEnrolled > 0 ? Math.round((completed / courseEnrolled) * 100) : 0;
      return { lesson_id: l.id, title: l.title, total_views: views, completion_rate: rate };
    }).sort((a, b) => a.completion_rate - b.completion_rate);
  }

  // Enrollment trend (30 days)
  const trend = enrollments?.filter((e) => new Date(e.enrolled_at) > new Date(Date.now() - 30 * 86400000)).reduce((acc, e) => {
    const day = new Date(e.enrolled_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return NextResponse.json({ courseStats, lessonStats, trend });
}
