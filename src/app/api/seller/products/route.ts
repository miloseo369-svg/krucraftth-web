import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/seller/products — list seller's own products */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("products")
    .select("*, purchases(count)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ products: data ?? [] });
}

/** POST /api/seller/products — create new product for review */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, price, category, thumbnail_url, file_url } = body;

  if (!title?.trim()) return NextResponse.json({ error: "กรุณาระบุชื่อสินค้า" }, { status: 400 });
  if (!file_url?.trim()) return NextResponse.json({ error: "กรุณาอัพโหลดไฟล์" }, { status: 400 });
  if (price < 0) return NextResponse.json({ error: "ราคาไม่ถูกต้อง" }, { status: 400 });

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      price: price ?? 0,
      category: category || "worksheet",
      thumbnail_url: thumbnail_url || null,
      file_url: file_url.trim(),
      seller_id: user.id,
      is_published: false,
      approval_status: "pending",
      commission_rate: 0.7,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ product }, { status: 201 });
}

/** PATCH /api/seller/products — update own product */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, title, description, price, category, thumbnail_url, file_url } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabase.from("products").select("seller_id").eq("id", id).maybeSingle();
  if (!existing || existing.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (price !== undefined) updates.price = price;
  if (category !== undefined) updates.category = category;
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null;
  if (file_url !== undefined) updates.file_url = file_url;

  const { data: product, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ product });
}

/** DELETE /api/seller/products — delete own unpublished product */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: existing } = await supabase.from("products").select("seller_id, is_published").eq("id", id).maybeSingle();
  if (!existing || existing.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (existing.is_published) return NextResponse.json({ error: "ไม่สามารถลบสินค้าที่เผยแพร่แล้วได้" }, { status: 400 });

  await supabase.from("products").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
