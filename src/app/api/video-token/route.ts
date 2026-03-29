import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSignedUrl } from "@/lib/bunny";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoPath, lessonId } = await request.json();

  if (!videoPath || !lessonId) {
    return NextResponse.json(
      { error: "videoPath and lessonId are required" },
      { status: 400 }
    );
  }

  // ตรวจสอบว่า lesson มีอยู่จริงและดึง course_id
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id, is_free_preview")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // ถ้าไม่ใช่ free preview ต้องลงทะเบียนแล้ว
  if (!lesson.is_free_preview) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", lesson.course_id)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }
  }

  const url = generateSignedUrl({ videoPath, expiresIn: 3600 });

  // Log token generation
  await supabase.from("video_token_logs").insert({
    user_id: user.id,
    lesson_id: lessonId,
    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
  });

  return NextResponse.json({ url });
}
