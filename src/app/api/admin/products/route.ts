import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST — สร้างสินค้าใหม่ (admin/instructor) */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["admin", "instructor"].includes(profile.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, description, price, file_url, thumbnail_url, category, is_published, commission_rate } = body;

  if (!title?.trim() || !file_url)
    return NextResponse.json({ error: "กรุณาระบุชื่อสินค้าและไฟล์" }, { status: 400 });

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      price: price ?? 0,
      file_url,
      thumbnail_url: thumbnail_url || null,
      seller_id: user.id,
      category: category || "worksheet",
      is_published: profile.role === "admin" ? (is_published ?? false) : false,
      commission_rate: profile.role === "admin" ? 1.0 : (commission_rate ?? 0.7),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product }, { status: 201 });
}

/** PATCH — แก้ไขสินค้า */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["admin", "instructor"].includes(profile.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id } = body;

  // Whitelist fields ที่แก้ไขได้
  const allowedFields = ["title", "description", "price", "file_url", "thumbnail_url", "category", "is_published"];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  // admin เท่านั้นที่แก้ commission_rate ได้
  if (profile.role === "admin" && body.commission_rate !== undefined) {
    updates.commission_rate = body.commission_rate;
  }

  let query = supabase.from("products").update(updates).eq("id", id);
  if (profile.role !== "admin") query = query.eq("seller_id", user.id);

  const { data, error } = await query.select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

/** DELETE — ลบสินค้า */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
