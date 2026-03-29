import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await request.json();

  // Check if user has completed the course exam
  const { data: examResult } = await supabase
    .from("exam_results")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .gte("score", 70)
    .single();

  if (!examResult) {
    return NextResponse.json(
      { error: "ยังไม่ผ่านการสอบ" },
      { status: 400 }
    );
  }

  // Check existing certificate
  const { data: existingCert } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existingCert) {
    return NextResponse.json({ certificate: existingCert });
  }

  const certId = `KC-${nanoid(10).toUpperCase()}`;

  const { data: certificate, error } = await supabase
    .from("certificates")
    .insert({
      cert_id: certId,
      user_id: user.id,
      course_id: courseId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "ไม่สามารถสร้างใบประกาศนียบัตรได้" },
      { status: 500 }
    );
  }

  return NextResponse.json({ certificate });
}
