import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("course_bundles").select("*, bundle_courses(course_id, courses(id, title, thumbnail_url, price))").eq("is_active", true).order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["instructor", "admin"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, thumbnailUrl, originalPrice, bundlePrice, courseIds } = await request.json();
  const { data: bundle, error } = await supabase.from("course_bundles").insert({ title, description, thumbnail_url: thumbnailUrl, original_price: originalPrice, bundle_price: bundlePrice, instructor_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (courseIds?.length) { await supabase.from("bundle_courses").insert(courseIds.map((cid: string) => ({ bundle_id: bundle.id, course_id: cid }))); }
  return NextResponse.json(bundle, { status: 201 });
}
