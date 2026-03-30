import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { discussionId, pin } = await request.json();

  // Check if user is instructor/admin of the course
  const { data: disc } = await supabase.from("lesson_discussions").select("course_id, is_pinned").eq("id", discussionId).single();
  if (!disc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: course } = await supabase.from("courses").select("instructor_id").eq("id", disc.course_id).single();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (course?.instructor_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("lesson_discussions").update({ is_pinned: pin }).eq("id", discussionId);
  return NextResponse.json({ success: true });
}
