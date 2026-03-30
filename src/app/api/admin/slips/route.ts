import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { addCredits } from "@/lib/credits";
import { logActivity } from "@/lib/log";
import crypto from "crypto";

/** GET /api/admin/slips?action=approve&id=xxx&sig=xxx — อนุมัติจาก Telegram */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const slipId = searchParams.get("id");
  const sig = searchParams.get("sig");

  if (!slipId || !sig) {
    return NextResponse.json({ error: "Invalid" }, { status: 403 });
  }

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.TELEGRAM_BOT_TOKEN!)
    .update(slipId)
    .digest("hex")
    .slice(0, 32);

  if (sig !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data: slip } = await supabase
    .from("payment_slips")
    .select("*")
    .eq("id", slipId)
    .single();

  if (!slip || slip.status !== "pending") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    return NextResponse.redirect(`${siteUrl}/admin/slips`);
  }

  if (action === "approve") {
    await supabase
      .from("payment_slips")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", slipId);

    if (slip.item_type === "course") {
      await supabase.from("enrollments").upsert(
        { user_id: slip.user_id, course_id: slip.item_id },
        { onConflict: "user_id,course_id" }
      );
    } else if (slip.item_type === "product") {
      const { data: product } = await supabase
        .from("products")
        .select("price, commission_rate")
        .eq("id", slip.item_id)
        .single();

      if (product) {
        const sellerAmount = slip.amount * product.commission_rate;
        const platformAmount = slip.amount - sellerAmount;
        await supabase.from("purchases").upsert(
          {
            user_id: slip.user_id,
            product_id: slip.item_id,
            amount_paid: slip.amount,
            seller_amount: sellerAmount,
            platform_amount: platformAmount,
          },
          { onConflict: "user_id,product_id" }
        );
      }
    } else if (slip.item_type === "credits") {
      const creditsAmount = parseInt(slip.item_id, 10);
      if (creditsAmount > 0) {
        await addCredits(slip.user_id, creditsAmount, `เติมเครดิต ${creditsAmount} (฿${slip.amount})`, "topup", "payment_slip", slip.id);
      }
    }

    // Credit affiliate commission
    await creditAffiliateCommission(supabase, slip);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return NextResponse.redirect(`${siteUrl}/admin/slips`);
}

/** PATCH /api/admin/slips — อนุมัติ/ปฏิเสธจากหน้า admin */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slipId, action, note } = await request.json();

  if (!slipId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  const { data: slip } = await serviceClient
    .from("payment_slips")
    .select("*")
    .eq("id", slipId)
    .single();

  if (!slip) return NextResponse.json({ error: "ไม่พบสลิป" }, { status: 404 });

  // อัพเดตสถานะ
  await serviceClient
    .from("payment_slips")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      admin_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", slipId);

  // ถ้าอนุมัติ ให้สิทธิ์
  if (action === "approve") {
    if (slip.item_type === "course") {
      await serviceClient.from("enrollments").upsert(
        { user_id: slip.user_id, course_id: slip.item_id },
        { onConflict: "user_id,course_id" }
      );
    } else if (slip.item_type === "product") {
      const { data: product } = await serviceClient
        .from("products")
        .select("price, commission_rate")
        .eq("id", slip.item_id)
        .single();

      if (product) {
        const sellerAmt = slip.amount * product.commission_rate;
        await serviceClient.from("purchases").upsert(
          {
            user_id: slip.user_id,
            product_id: slip.item_id,
            amount_paid: slip.amount,
            seller_amount: sellerAmt,
            platform_amount: slip.amount - sellerAmt,
          },
          { onConflict: "user_id,product_id" }
        );
      }
    } else if (slip.item_type === "credits") {
      const creditsAmount = parseInt(slip.item_id, 10);
      if (creditsAmount > 0) {
        await addCredits(slip.user_id, creditsAmount, `เติมเครดิต ${creditsAmount} (฿${slip.amount})`, "topup", "payment_slip", slip.id);
      }
    }
  }

  // Credit affiliate commission
  if (action === "approve") {
    await creditAffiliateCommission(serviceClient, slip);
  }

  const label = action === "approve" ? "อนุมัติ" : "ปฏิเสธ";
  await logActivity(user.id, `${label}_slip`, `${label}สลิป #${slipId} ของ user ${slip.user_id} (${slip.item_type}: ฿${slip.amount})`);

  // Notify user
  const itemLabel = slip.item_type === "course" ? "คอร์ส" : slip.item_type === "credits" ? "เครดิต" : "สินค้า";
  if (action === "approve") {
    await serviceClient.from("notifications").insert({
      user_id: slip.user_id,
      title: "ชำระเงินสำเร็จ",
      message: `การชำระเงิน${itemLabel} ฿${slip.amount} ได้รับการอนุมัติแล้ว`,
      type: "success",
      href: slip.item_type === "credits" ? "/credits" : slip.item_type === "course" ? `/courses/${slip.item_id}` : `/orders`,
    });
  } else {
    await serviceClient.from("notifications").insert({
      user_id: slip.user_id,
      title: "สลิปถูกปฏิเสธ",
      message: `การชำระเงิน${itemLabel} ฿${slip.amount} ถูกปฏิเสธ${note ? `: ${note}` : ""}`,
      type: "error",
      href: slip.item_type === "course" ? `/courses/${slip.item_id}` : "/orders",
    });
  }

  return NextResponse.json({ success: true });
}

/** Credit affiliate commission when a payment is approved */
async function creditAffiliateCommission(supabase: ReturnType<typeof createServiceClient>, slip: { referral_code?: string | null; amount: number; item_type: string; item_id: string; id: string }) {
  if (!slip.referral_code) return;

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, user_id, commission_rate")
    .eq("referral_code", slip.referral_code)
    .maybeSingle();

  if (!affiliate) return;

  const commission = Math.round(slip.amount * affiliate.commission_rate);
  if (commission <= 0) return;

  await supabase.from("affiliate_payouts").insert({
    affiliate_id: affiliate.id,
    order_id: slip.id,
    commission_amount: commission,
    status: "pending",
  });
}
