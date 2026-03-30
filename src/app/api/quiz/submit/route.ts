import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 quiz submissions per minute
  const rl = checkRateLimit(`quiz:${user.id}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: `กรุณารอ ${rl.resetIn} วินาที` }, { status: 429 });

  const { quizId, answers } = await request.json();
  if (!quizId || !answers || typeof answers !== "object") return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { data: questions } = await supabase.from("quiz_questions").select("id, options").eq("quiz_id", quizId).order("order_num");
  const { data: quiz } = await supabase.from("quizzes").select("pass_score").eq("id", quizId).single();
  if (!questions || !quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let correct = 0;
  const results: Record<string, boolean> = {};
  questions.forEach((q) => {
    const selected = answers[q.id];
    const opts = q.options as { text: string; is_correct: boolean }[];
    const isCorrect = selected !== undefined && opts[selected]?.is_correct;
    if (isCorrect) correct++;
    results[q.id] = !!isCorrect;
  });

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= quiz.pass_score;

  await supabase.from("quiz_attempts").insert({ quiz_id: quizId, user_id: user.id, answers, score, passed });

  return NextResponse.json({ score, passed, correct, total: questions.length, results });
}
