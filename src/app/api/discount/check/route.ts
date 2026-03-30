import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { code, itemType, price } = await request.json();
  if (!code) return NextResponse.json({ error: "กรุณาระบุโค้ด" }, { status: 400 });

  const { data: discountCode } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (!discountCode) return NextResponse.json({ error: "ไม่พบโค้ดส่วนลดนี้", valid: false }, { status: 400 });

  // Check expiry
  if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "โค้ดส่วนลดหมดอายุแล้ว", valid: false }, { status: 400 });
  }

  // Check max uses
  if (discountCode.max_uses !== null && discountCode.used_count >= discountCode.max_uses) {
    return NextResponse.json({ error: "โค้ดส่วนลดถูกใช้ครบจำนวนแล้ว", valid: false }, { status: 400 });
  }

  // Check applies_to
  if (discountCode.applies_to !== "all" && discountCode.applies_to !== itemType) {
    return NextResponse.json({ error: `โค้ดนี้ใช้ได้กับ${discountCode.applies_to === "course" ? "คอร์ส" : "สินค้า"}เท่านั้น`, valid: false }, { status: 400 });
  }

  // Check min price
  if (price < discountCode.min_price) {
    return NextResponse.json({ error: `ยอดขั้นต่ำ ฿${discountCode.min_price.toLocaleString()}`, valid: false }, { status: 400 });
  }

  // Check if user already used this code
  const { data: usage } = await supabase
    .from("discount_code_usages")
    .select("id")
    .eq("code_id", discountCode.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (usage) return NextResponse.json({ error: "คุณใช้โค้ดนี้ไปแล้ว", valid: false }, { status: 400 });

  // Calculate discount
  let discount = 0;
  if (discountCode.discount_type === "percent") {
    discount = Math.round(price * (discountCode.discount_value / 100));
  } else {
    discount = discountCode.discount_value;
  }
  discount = Math.min(discount, price);

  return NextResponse.json({ valid: true, discount, discountType: discountCode.discount_type, discountValue: discountCode.discount_value });
}
