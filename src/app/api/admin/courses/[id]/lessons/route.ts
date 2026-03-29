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

/** POST /api/admin/courses/[id]/lessons — สร้าง module หรือ lesson */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  if (!(await checkAdmin(supabase)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  // สร้าง module
  if (body.type === "module") {
    const { title, sequence } = body;
    if (!title?.trim())
      return NextResponse.json(
        { error: "กรุณาระบุชื่อโมดูล" },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: courseId,
        title: title.trim(),
        sequence: sequence ?? 0,
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ module: data }, { status: 201 });
  }

  // สร้าง lesson
  if (body.type === "lesson") {
    const { module_id, title, lesson_type, bunny_video_path, sequence, is_free_preview } = body;
    if (!title?.trim() || !module_id)
      return NextResponse.json(
        { error: "กรุณาระบุชื่อบทเรียนและโมดูล" },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        module_id,
        course_id: courseId,
        title: title.trim(),
        type: lesson_type ?? "video",
        bunny_video_path: bunny_video_path || null,
        sequence: sequence ?? 0,
        is_free_preview: is_free_preview ?? false,
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ lesson: data }, { status: 201 });
  }

  return NextResponse.json({ error: "ระบุ type: module หรือ lesson" }, { status: 400 });
}

/** PATCH /api/admin/courses/[id]/lessons — แก้ไข module หรือ lesson */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const supabase = await createClient();
  if (!(await checkAdmin(supabase)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  if (body.type === "module") {
    const { id, title, sequence } = body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (sequence !== undefined) updates.sequence = sequence;

    const { data, error } = await supabase
      .from("modules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ module: data });
  }

  if (body.type === "lesson") {
    const { id, title, lesson_type, bunny_video_path, sequence, is_free_preview } = body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (lesson_type !== undefined) updates.type = lesson_type;
    if (bunny_video_path !== undefined) updates.bunny_video_path = bunny_video_path || null;
    if (sequence !== undefined) updates.sequence = sequence;
    if (is_free_preview !== undefined) updates.is_free_preview = is_free_preview;

    const { data, error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ lesson: data });
  }

  return NextResponse.json({ error: "ระบุ type: module หรือ lesson" }, { status: 400 });
}

/** DELETE /api/admin/courses/[id]/lessons — ลบ module หรือ lesson */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const supabase = await createClient();
  if (!(await checkAdmin(supabase)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const table = body.type === "module" ? "modules" : "lessons";

  const { error } = await supabase.from(table).delete().eq("id", body.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
