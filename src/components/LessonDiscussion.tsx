"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface Post { id: string; user_id: string; content: string; parent_id: string | null; is_pinned: boolean; created_at: string; profiles: { full_name: string | null; role: string } | null; }

export default function LessonDiscussion({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/discussions?lessonId=${lessonId}`).then((r) => r.json()).then(setPosts);
  }, [lessonId]);

  async function submit() {
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch("/api/discussions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, courseId, content: content.trim(), parentId: replyTo }) });
    if (res.ok) { setContent(""); setReplyTo(null); fetch(`/api/discussions?lessonId=${lessonId}`).then((r) => r.json()).then(setPosts); toast("ส่งความคิดเห็นแล้ว!", "success"); }
    setLoading(false);
  }

  const topLevel = posts.filter((p) => !p.parent_id);
  const getReplies = (id: string) => posts.filter((p) => p.parent_id === id);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">คำถามและความคิดเห็น ({posts.length})</h3>
      {topLevel.map((post) => (
        <div key={post.id}>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">{(post.profiles?.full_name || "?")[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-white">{post.profiles?.full_name || "ผู้ใช้"}</span>
                {(post.profiles?.role === "instructor" || post.profiles?.role === "admin") && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">ครู</span>}
                {post.is_pinned && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">ปักหมุด</span>}
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{post.content}</p>
              <button onClick={() => setReplyTo(post.id)} className="text-[10px] mt-1 hover:text-emerald-400 transition" style={{ color: "var(--text-muted)" }}>ตอบกลับ</button>
            </div>
          </div>
          {getReplies(post.id).map((reply) => (
            <div key={reply.id} className="ml-11 mt-2 flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold shrink-0">{(reply.profiles?.full_name || "?")[0]}</div>
              <div><p className="text-xs font-medium text-white">{reply.profiles?.full_name}</p><p className="text-xs" style={{ color: "var(--text-secondary)" }}>{reply.content}</p></div>
            </div>
          ))}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={replyTo ? "ตอบกลับ..." : "ถามคำถามหรือแสดงความคิดเห็น..."} rows={2} className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none resize-none bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40" style={{ fontSize: "16px" }} />
        <div className="flex flex-col gap-1">
          {replyTo && <button onClick={() => setReplyTo(null)} className="text-[10px]" style={{ color: "var(--text-muted)" }}>ยกเลิก</button>}
          <button onClick={submit} disabled={loading || !content.trim()} className="px-4 py-2 bg-emerald-500 text-black text-xs font-medium rounded-xl hover:bg-emerald-400 transition disabled:opacity-50">{loading ? "..." : "ส่ง"}</button>
        </div>
      </div>
    </div>
  );
}
