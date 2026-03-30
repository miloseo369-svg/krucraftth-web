import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true, supabase, user: null as never };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return { error: true, supabase, user };
  return { error: false, supabase, user };
}

/** GET — active announcements (public) */
export async function GET() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ announcements: data ?? [] });
}

/** POST — create announcement */
export async function POST(request: NextRequest) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, message, type, bg_color, href, is_active, starts_at, ends_at } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุหัวข้อและข้อความ" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("announcements")
    .insert({
      title: title.trim(),
      message: message.trim(),
      type: type || "info",
      bg_color: bg_color || "emerald",
      href: href || null,
      is_active: is_active ?? true,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ announcement: data }, { status: 201 });
}

/** PATCH — update announcement */
export async function PATCH(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error: dbError } = await supabase.from("announcements").update(updates).eq("id", id).select().single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ announcement: data });
}

/** DELETE — delete announcement */
export async function DELETE(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await supabase.from("announcements").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
