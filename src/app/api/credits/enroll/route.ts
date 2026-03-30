import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getBalance } from "@/lib/credits";

/** POST /api/credits/enroll — ลงทะเบียนคอร์สด้วยเครดิต */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: "กรุณาระบุคอร์ส" }, { status: 400 });

  const { data: course } = await supabase.from("courses").select("id, title, credit_price").eq("id", courseId).eq("is_published", true).maybeSingle();
  if (!course) return NextResponse.json({ error: "ไม่พบคอร์สนี้" }, { status: 404 });
  if (!course.credit_price || course.credit_price <= 0) return NextResponse.json({ error: "คอร์สนี้ไม่รองรับการซื้อด้วยเครดิต" }, { status: 400 });

  // ตรวจว่าลงทะเบียนแล้วหรือยัง
  const { data: existing } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
  if (existing) return NextResponse.json({ error: "คุณลงทะเบียนคอร์สนี้แล้ว" }, { status: 400 });

  // ตรวจ balance
  const balance = await getBalance(user.id);
  if (balance < course.credit_price) {
    return NextResponse.json({ error: `เครดิตไม่เพียงพอ (ต้องการ ${course.credit_price} มี ${balance})`, needCredits: true }, { status: 402 });
  }

  // หักเครดิต atomic ผ่าน service client
  const serviceClient = createServiceClient();
  const { data: rpcResult, error: rpcError } = await serviceClient.rpc("spend_credits", {
    p_user_id: user.id,
    p_amount: course.credit_price,
    p_description: `ลงทะเบียน: ${course.title} (-${course.credit_price} เครดิต)`,
    p_ref_type: "course",
    p_ref_id: courseId,
  });

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
  const result = rpcResult?.[0];
  if (!result?.success) return NextResponse.json({ error: result?.error_message || "เครดิตไม่เพียงพอ", needCredits: true }, { status: 402 });

  // ลงทะเบียน — ถ้า fail ให้คืนเครดิต
  const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId });
  if (error) {
    // Refund credits
    await serviceClient.rpc("add_credits", {
      p_user_id: user.id,
      p_amount: course.credit_price,
      p_description: `คืนเครดิต: ลงทะเบียนไม่สำเร็จ (${course.title})`,
      p_type: "refund",
      p_ref_type: "course",
      p_ref_id: courseId,
    });
    return NextResponse.json({ error: "ลงทะเบียนไม่สำเร็จ เครดิตได้คืนแล้ว" }, { status: 500 });
  }

  return NextResponse.json({ success: true, balance: result.new_balance });
}
