import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  let query = supabase.from("quizzes").select("*, quiz_questions(*)").eq("created_by", user.id).order("created_at", { ascending: false });
  if (lessonId) query = query.eq("lesson_id", lessonId);
  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId, courseId, title, passScore, questions } = await request.json();
  const { data: quiz, error } = await supabase.from("quizzes").insert({ lesson_id: lessonId, course_id: courseId, created_by: user.id, title, pass_score: passScore }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (questions?.length > 0) {
    await supabase.from("quiz_questions").insert(questions.map((q: { question: string; type: string; options: unknown[]; explanation: string }, i: number) => ({ quiz_id: quiz.id, question: q.question, type: q.type, options: q.options, explanation: q.explanation, order_num: i })));
  }
  return NextResponse.json(quiz, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { quizId, title, passScore, questions } = await request.json();
  await supabase.from("quizzes").update({ title, pass_score: passScore }).eq("id", quizId).eq("created_by", user.id);
  await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
  if (questions?.length > 0) {
    await supabase.from("quiz_questions").insert(questions.map((q: { question: string; type: string; options: unknown[]; explanation: string }, i: number) => ({ quiz_id: quizId, question: q.question, type: q.type, options: q.options, explanation: q.explanation, order_num: i })));
  }
  return NextResponse.json({ success: true });
}
