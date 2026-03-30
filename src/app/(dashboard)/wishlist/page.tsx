import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PremiumCourseCard from "@/components/PremiumCourseCard";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: wishlisted } = await supabase.from("wishlists").select("course_id, courses(id, title, description, thumbnail_url, price)").eq("user_id", user!.id);
  const courses = (wishlisted?.map((w) => w.courses).filter(Boolean) ?? []) as unknown as { id: string; title: string; description: string | null; thumbnail_url: string | null; price: number }[];

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-2">คอร์สที่บันทึกไว้</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{courses.length} คอร์ส</p>

      {courses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-white/[0.03]">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่มีคอร์สที่บันทึก</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กดปุ่ม ❤️ ในหน้าคอร์สเพื่อบันทึก</p>
          <Link href="/courses" className="inline-block mt-4 px-5 py-2 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">ดูคอร์สทั้งหมด</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <PremiumCourseCard key={c.id} title={c.title} description={c.description} price={c.price} imageUrl={c.thumbnail_url} href={`/courses/${c.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
