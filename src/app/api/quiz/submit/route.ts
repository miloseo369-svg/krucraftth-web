import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId, answers } = await request.json();
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
