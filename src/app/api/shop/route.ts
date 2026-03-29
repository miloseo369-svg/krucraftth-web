import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/shop — รับสินค้าฟรี (สินค้าเสียเงินใช้ระบบส่งสลิป) */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_published", true)
    .single();

  if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

  if (product.price > 0) {
    return NextResponse.json({ error: "สินค้านี้ต้องชำระเงิน กรุณาส่งสลิป" }, { status: 400 });
  }

  // ตรวจซื้อแล้วหรือยัง
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "คุณรับสินค้านี้แล้ว" }, { status: 400 });

  await supabase.from("purchases").insert({
    user_id: user.id,
    product_id: productId,
    amount_paid: 0,
    seller_amount: 0,
    platform_amount: 0,
  });

  return NextResponse.json({ success: true, free: true });
}
