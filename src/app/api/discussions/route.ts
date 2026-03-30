import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json([]);
  const { data } = await supabase.from("lesson_discussions").select("*, profiles:user_id(full_name, avatar_url, role)").eq("lesson_id", lessonId).order("is_pinned", { ascending: false }).order("created_at");
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId, courseId, content, parentId } = await request.json();
  const { data, error } = await supabase.from("lesson_discussions").insert({ lesson_id: lessonId, course_id: courseId, user_id: user.id, content, parent_id: parentId || null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
