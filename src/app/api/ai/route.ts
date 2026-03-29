import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askClaude, parseClaudeJSON } from "@/lib/claude";

async function requireInstructorOrAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, supabase: null as never, user: null as never, role: "" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["instructor", "admin"].includes(profile.role)) return { error: "Forbidden", status: 403, supabase: null as never, user: null as never, role: "" };
  return { error: null, status: 200, supabase, user, role: profile.role };
}

export async function POST(request: NextRequest) {
  const auth = await requireInstructorOrAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { tool, input } = await request.json();
  if (!tool || !input) return NextResponse.json({ error: "กรุณาระบุ tool และ input" }, { status: 400 });

  // Admin-only tools
  const adminOnlyTools = ["business-analysis", "competitor-analysis", "risk-analysis"];
  if (adminOnlyTools.includes(tool) && auth.role !== "admin") {
    return NextResponse.json({ error: "เฉพาะ Admin เท่านั้น" }, { status: 403 });
  }

  try {
    const prompt = buildPrompt(tool, input);
    const raw = await askClaude([{ role: "user", content: prompt }], {
      system: "คุณเป็นผู้เชี่ยวชาญด้าน EdTech และการตลาดการศึกษาไทย ตอบเป็นภาษาไทยเสมอ ตอบเป็น JSON เท่านั้น ห้ามใส่ markdown code block",
      maxTokens: 4096,
    });

    const result = parseClaudeJSON(raw);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(tool: string, input: Record<string, unknown>): string {
  switch (tool) {
    case "lesson-plan":
      return `สร้างแผนการสอนวิชา "${input.subject}" ระดับชั้น ${input.grade} จำนวน ${input.hours} ชั่วโมง\nตอบเป็น JSON: {"title":"","objective":"","materials":[],"activities":[{"time":"","activity":"","detail":""}],"assessment":"","homework":""}`;

    case "worksheet":
      return `สร้างใบงาน "${input.topic}" ระดับ ${input.grade} จำนวน ${input.count} ข้อ\nตอบเป็น JSON: {"title":"","instructions":"","questions":[{"no":1,"question":"","type":"ปรนัย/อัตนัย","choices":[],"answer":""}]}`;

    case "summarize":
      return `สรุปเนื้อหา: "${input.content}"\nรูปแบบ: ${input.format || "สรุปย่อ"}\nตอบเป็น JSON: {"title":"","summary":"","key_points":[],"diagram_suggestion":""}`;

    case "exam":
      return `สร้างข้อสอบ "${input.subject}" ระดับ ${input.grade} จำนวน ${input.count} ข้อ ประเภท ${input.type}\nตอบเป็น JSON: {"title":"","total_score":100,"questions":[{"no":1,"question":"","type":"","choices":[],"answer":"","score":0,"explanation":""}]}`;

    case "translate":
      return `แปลเนื้อหาต่อไปนี้เป็นภาษา${input.targetLang}:\n"${input.content}"\nตอบเป็น JSON: {"original":"","translated":"","language":"","notes":""}`;

    case "student-analysis":
      return `วิเคราะห์ผู้เรียนจากข้อมูล: คะแนนเฉลี่ย ${input.avgScore}, อัตราเรียนจบ ${input.completionRate}%, จำนวนผู้เรียน ${input.studentCount}\nตอบเป็น JSON: {"overall":"","strengths":[],"weaknesses":[],"recommendations":[],"group_analysis":""}`;

    case "business-analysis":
      return `คุณเป็น Business Analyst ผู้เชี่ยวชาญ EdTech ไทย\nวิเคราะห์คอร์ส "${input.courseName}":\n- ผู้เรียน: ${input.enrolledCount} คน\n- รายได้: ฿${input.revenue}\n- อัตราเรียนจบ: ${input.completionRate}%\n- รีวิว: ${input.reviewCount} (เฉลี่ย ${input.reviewAvg}/5)\n- ระยะเวลา: ${input.days} วัน\nตอบเป็น JSON: {"overall_health":"ดี/ปานกลาง/ควรปรับปรุง","health_score":0,"revenue_analysis":{"summary":"","avg_per_student":0,"growth_trend":""},"engagement_analysis":{"summary":"","completion_benchmark":"","dropout_risk":""},"strengths":[],"improvements":[],"action_plan":[{"priority":"","action":"","expected_result":""}],"revenue_forecast_30d":0,"recommendation":""}`;

    case "sales-page":
      return `คุณเป็น Copywriter ผู้เชี่ยวชาญขายคอร์สออนไลน์ไทย\nเขียน Sales Copy สำหรับ "${input.name}"\nTarget: ${input.targetAudience}\nจุดเด่น: ${(input.features as string[])?.join(", ")}\nราคา: ฿${input.price}${input.originalPrice ? ` (ลดจาก ฿${input.originalPrice})` : ""}\nTone: ${input.tone}\nตอบเป็น JSON: {"headline":"","subheadline":"","hero_description":"","pain_points":[],"benefits":[{"icon":"✓","title":"","desc":""}],"social_proof_text":"","urgency_text":"","cta_primary":"","cta_secondary":"","faq":[{"q":"","a":""}],"announcement_bar":""}`;

    case "competitor-analysis":
      return `คุณเป็น Strategic Analyst ตลาด EdTech ไทย\nวิเคราะห์เปรียบเทียบ:\nเรา: "${input.ourProduct}" ราคา ฿${input.ourPrice}\nจุดเด่น: ${input.ourFeatures}\nคู่แข่ง:\n${(input.competitors as { name: string; price: number; features: string }[])?.map((c: { name: string; price: number; features: string }, i: number) => `${i + 1}. ${c.name} ฿${c.price} - ${c.features}`).join("\n")}\nตอบเป็น JSON: {"market_position":"","price_analysis":{"our_position":"","recommendation":""},"competitive_advantages":[],"competitive_gaps":[],"opportunities":[],"threats":[],"swot":{"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]},"strategy_recommendation":"","quick_wins":[{"action":"","effort":"","impact":""}]}`;

    case "email-marketing":
      return `คุณเป็น Email Marketing Specialist EdTech ไทย\nสร้าง Email Sequence ${input.count} ฉบับ\nเป้าหมาย: ${input.goal}\nสินค้า: "${input.productName}" ราคา ฿${input.price}\nกลุ่มเป้าหมาย: ${input.targetAudience}\nตอบเป็น JSON: {"sequence_name":"","emails":[{"day":1,"subject":"","preview_text":"","purpose":"","body":"เนื้อหา email","cta_text":""}],"tips":[]}`;

    case "content-calendar":
      return `คุณเป็น Social Media Strategist ตลาดไทย\nวางแผน Content Calendar สำหรับ "${input.productName}"\nแพลตฟอร์ม: ${(input.platforms as string[])?.join(", ")}\nระยะเวลา: ${input.duration}\nเป้าหมาย: ${input.goal}\nPosts/สัปดาห์: ${input.postsPerWeek}\nตอบเป็น JSON: {"strategy_overview":"","content_pillars":[{"name":"","percentage":0,"purpose":""}],"calendar":[{"week":1,"theme":"","posts":[{"day":"","platform":"","content_type":"","caption":"","hashtags":[],"best_time":""}]}],"tips_per_platform":{}}`;

    case "risk-analysis":
      return `คุณเป็น Business Risk Analyst EdTech Startup ไทย\nข้อมูล:\n- รายได้ 3 เดือน: ฿${input.rev1}, ฿${input.rev2}, ฿${input.rev3}\n- Active Users: ${input.activeUsers}\n- Churn Rate: ${input.churnRate}%\n- ค่าใช้จ่าย/เดือน: ฿${input.expenses}\n- คอร์สขายดี: ${input.bestCourse}\n- คอร์สขายแย่: ${input.worstCourse}\n- แผน 6 เดือน: ${input.plan}\nตอบเป็น JSON: {"financial_health":{"score":0,"status":"","runway_months":0,"burn_rate":0,"summary":""},"risk_matrix":[{"risk_name":"","category":"","probability":"","impact":"","risk_level":"","description":"","mitigation":""}],"revenue_analysis":{"trend":"","growth_rate":0,"concentration_risk":"","recommendation":""},"immediate_actions":[{"urgency":"","action":"","deadline":""}],"6month_forecast":{"optimistic":{"revenue":0,"scenario":""},"realistic":{"revenue":0,"scenario":""},"pessimistic":{"revenue":0,"scenario":""}},"strategic_recommendations":[]}`;

    default:
      return `${JSON.stringify(input)}\nตอบเป็น JSON`;
  }
}
