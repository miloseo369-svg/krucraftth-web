import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

/** POST /api/payment — ส่งสลิปชำระเงิน */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 5 payment submissions per minute
  const rl = checkRateLimit(`payment:${user.id}`, 5, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: `กรุณารอ ${rl.resetIn} วินาที` }, { status: 429 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemType = formData.get("item_type") as string;
  const itemId = formData.get("item_id") as string;
  const amount = formData.get("amount") as string;

  if (!file || !itemType || !itemId || !amount) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  // Validate amount
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
  }

  // Validate file type (images only)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)" }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
  }

  // ตรวจว่า item มีอยู่จริง + ราคาตรง
  if (itemType === "course") {
    const { data: course } = await supabase.from("courses").select("id, price").eq("id", itemId).eq("is_published", true).maybeSingle();
    if (!course) return NextResponse.json({ error: "ไม่พบคอร์สนี้" }, { status: 404 });
    if (Math.abs(course.price - parsedAmount) > 1) return NextResponse.json({ error: "จำนวนเงินไม่ตรงกับราคาคอร์ส" }, { status: 400 });
  } else if (itemType === "product") {
    const { data: product } = await supabase.from("products").select("id, price").eq("id", itemId).eq("is_published", true).maybeSingle();
    if (!product) return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 });
    if (Math.abs(product.price - parsedAmount) > 1) return NextResponse.json({ error: "จำนวนเงินไม่ตรงกับราคาสินค้า" }, { status: 400 });
  } else {
    return NextResponse.json({ error: "ประเภทไม่ถูกต้อง" }, { status: 400 });
  }

  // ตรวจว่าส่งสลิปแล้วหรือยัง (pending)
  const { data: existing } = await supabase
    .from("payment_slips")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing?.status === "approved") {
    return NextResponse.json({ error: "คุณชำระเงินรายการนี้แล้ว" }, { status: 400 });
  }
  if (existing?.status === "pending") {
    return NextResponse.json({ error: "สลิปของคุณอยู่ระหว่างรอตรวจสอบ" }, { status: 400 });
  }

  // อัพโหลดสลิป
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("slips")
    .upload(fileName, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "อัพโหลดสลิปไม่สำเร็จ" }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("slips").getPublicUrl(fileName);

  // ดึง referral code จาก cookie + discount code จาก form
  const refCode = request.cookies.get("kc_ref")?.value || null;
  const discountCodeStr = formData.get("discount_code") as string | null;

  // Record discount code usage
  if (discountCodeStr) {
    const { data: dc } = await supabase.from("discount_codes").select("id, used_count").eq("code", discountCodeStr).eq("is_active", true).maybeSingle();
    if (dc) {
      await supabase.from("discount_code_usages").insert({ code_id: dc.id, user_id: user.id, item_type: itemType, item_id: itemId, discount_amount: 0 });
      await supabase.from("discount_codes").update({ used_count: (dc.used_count || 0) + 1 }).eq("id", dc.id);
    }
  }

  // บันทึกสลิป
  const { data: slip, error } = await supabase
    .from("payment_slips")
    .insert({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      amount: parsedAmount,
      slip_url: urlData.publicUrl,
      referral_code: refCode,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ส่ง Telegram แจ้ง admin (อ่านจาก DB ก่อน fallback env)
  const { data: tgSettings } = await supabase.from("site_settings").select("key, value").in("key", ["telegram_bot_token", "telegram_chat_id"]);
  const tgMap: Record<string, string> = {};
  tgSettings?.forEach((s) => { tgMap[s.key] = s.value; });
  const telegramToken = tgMap.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = tgMap.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

  if (telegramToken && telegramChatId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const itemLabel = itemType === "course" ? "คอร์ส" : "สินค้า";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const message = [
      `💰 *สลิปใหม่รอตรวจสอบ*`,
      ``,
      `👤 ผู้ส่ง: ${profile?.full_name || user.email}`,
      `📦 ประเภท: ${itemLabel}`,
      `💵 จำนวน: ฿${parseFloat(amount).toLocaleString()}`,
      ``,
      `🔗 [ตรวจสอบสลิป](${siteUrl}/admin/slips)`,
      `✅ [อนุมัติ](${siteUrl}/api/admin/slips?action=approve&id=${slip.id}&sig=${crypto.createHmac("sha256", telegramToken).update(slip.id).digest("hex").slice(0, 32)})`,
    ].join("\n");

    const fullMessage = message + `\n\nดูสลิป: ${urlData.publicUrl}`;

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: fullMessage,
        parse_mode: "Markdown",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, slip });
}
