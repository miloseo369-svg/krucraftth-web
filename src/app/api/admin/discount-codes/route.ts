import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, supabase: null as never, user: null as never };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403, supabase: null as never, user: null as never };
  return { error: null, status: 200, supabase, user };
}

/** GET /api/admin/discount-codes — ดึงโค้ดส่วนลดทั้งหมด */
export async function GET() {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}

/** POST /api/admin/discount-codes — สร้างโค้ดส่วนลดใหม่ */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { code, discount_type, discount_value, min_price, max_uses, applies_to, is_active, expires_at } = body;

  if (!code?.trim()) return NextResponse.json({ error: "กรุณาระบุโค้ด" }, { status: 400 });
  if (!discount_value || discount_value <= 0) return NextResponse.json({ error: "กรุณาระบุส่วนลด" }, { status: 400 });
  if (discount_type === "percent" && discount_value > 100) return NextResponse.json({ error: "ส่วนลดเกิน 100%" }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("discount_codes")
    .insert({
      code: code.trim().toUpperCase(),
      discount_type: discount_type || "percent",
      discount_value,
      min_price: min_price ?? 0,
      max_uses: max_uses || null,
      applies_to: applies_to || "all",
      is_active: is_active ?? true,
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "โค้ดนี้มีอยู่แล้ว" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}

/** PUT /api/admin/discount-codes — อัปเดตโค้ดส่วนลด */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (updates.code) updates.code = updates.code.trim().toUpperCase();

  const { data, error } = await auth.supabase
    .from("discount_codes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}

/** DELETE /api/admin/discount-codes — ลบโค้ดส่วนลด */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await auth.supabase.from("discount_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
