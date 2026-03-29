import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin" ? user : null;
}

/** PATCH /api/admin/courses/[id] — แก้ไขคอร์ส */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await checkAdmin(supabase)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = String(body.title || "").trim();
  if (body.description !== undefined)
    updates.description = body.description?.trim() || null;
  if (body.price !== undefined) updates.price = body.price;
  if (body.instructor_id !== undefined)
    updates.instructor_id = body.instructor_id || null;
  if (body.is_published !== undefined) updates.is_published = body.is_published;
  if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url || null;

  const { data: course, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ course });
}

/** DELETE /api/admin/courses/[id] — ลบคอร์ส (cascade modules/lessons) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await checkAdmin(supabase)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
