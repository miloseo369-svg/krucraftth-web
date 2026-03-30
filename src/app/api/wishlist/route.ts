import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);
  const { data } = await supabase.from("wishlists").select("course_id, courses(id, title, thumbnail_url, price)").eq("user_id", user.id);
  return NextResponse.json(data?.map((w) => w.courses) ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await request.json();
  const { data: existing } = await supabase.from("wishlists").select("user_id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
  if (existing) { await supabase.from("wishlists").delete().eq("user_id", user.id).eq("course_id", courseId); return NextResponse.json({ saved: false }); }
  await supabase.from("wishlists").insert({ user_id: user.id, course_id: courseId });
  return NextResponse.json({ saved: true });
}
