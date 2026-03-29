import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { purchaseId, fileIndex } = await request.json();
  if (!purchaseId) return NextResponse.json({ error: "ไม่พบรหัสคำสั่งซื้อ" }, { status: 400 });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*, product:products(*)")
    .eq("id", purchaseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!purchase) return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });

  const maxDl = purchase.max_downloads || 40;
  const currentDl = purchase.download_count || 0;
  if (currentDl >= maxDl) return NextResponse.json({ error: "ดาวน์โหลดครบจำนวนสูงสุดแล้ว" }, { status: 403 });

  // Increment download count
  await supabase.from("purchases").update({ download_count: currentDl + 1 }).eq("id", purchaseId);

  // Increment product download count
  if (purchase.product_id) {
    await supabase.from("products").update({ download_count: (purchase.product?.download_count || 0) + 1 }).eq("id", purchase.product_id);
  }

  // Return file URL
  const fileItems = (purchase.product?.file_items as { title: string; url: string; thumbnail?: string }[]) || [];
  const targetFile = fileItems[fileIndex ?? 0];
  const url = targetFile?.url || purchase.product?.file_url;

  if (!url) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 404 });

  return NextResponse.json({ url });
}
