"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { full_name: string | null; avatar_url: string | null } | null;
}

export default function CourseReviews({ courseId, reviews, isEnrolled, userId }: { courseId: string; reviews: Review[]; isEnrolled: boolean; userId?: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const hasReviewed = reviews.some((r) => r.user && userId && r.id === userId);
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("reviews").upsert({ user_id: userId, course_id: courseId, rating, comment: comment.trim() || null }, { onConflict: "user_id,course_id" });
    if (error) showToast("ไม่สามารถส่งรีวิวได้", "error");
    else { showToast("ส่งรีวิวสำเร็จ!", "success"); setComment(""); }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white">รีวิวจากผู้เรียน</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className={`w-4 h-4 ${avg >= s ? "text-amber-400" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-amber-400">{avg.toFixed(1)}</span>
            <span className="text-xs text-[var(--text-muted)]">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write review */}
      {isEnrolled && userId && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.07] p-4 mb-4" style={{ background: "var(--bg-card)" }}>
          <p className="text-xs font-medium text-white mb-2">ให้คะแนนคอร์สนี้</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <svg className={`w-7 h-7 ${(hover || rating) >= s ? "text-amber-400" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="เขียนรีวิว (ไม่บังคับ)" rows={2} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white placeholder:text-[var(--text-muted)] focus:border-emerald-500/40 mb-3" />
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">
            {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] py-4">ยังไม่มีรีวิว</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-xs font-bold shrink-0">
                  {(r.user?.full_name || "U")[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white">{r.user?.full_name || "ผู้ใช้"}</span>
                <div className="flex gap-0.5 ml-auto">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className={`w-3 h-3 ${r.rating >= s ? "text-amber-400" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-xs text-[var(--text-secondary)]">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
