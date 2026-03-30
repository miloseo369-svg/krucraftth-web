import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quizId = new URL(request.url).searchParams.get("quizId");
  if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

  // Verify ownership
  const { data: quiz } = await supabase.from("quizzes").select("created_by, title, pass_score").eq("id", quizId).single();
  if (!quiz || quiz.created_by !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: attempts } = await supabase.from("quiz_attempts").select("*, profiles:user_id(full_name)").eq("quiz_id", quizId).order("submitted_at", { ascending: false });

  const totalAttempts = attempts?.length ?? 0;
  const avgScore = totalAttempts > 0 ? Math.round((attempts?.reduce((sum, a) => sum + a.score, 0) ?? 0) / totalAttempts) : 0;
  const passRate = totalAttempts > 0 ? Math.round(((attempts?.filter((a) => a.passed).length ?? 0) / totalAttempts) * 100) : 0;

  return NextResponse.json({ quiz, attempts: attempts ?? [], stats: { totalAttempts, avgScore, passRate } });
}
