import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "ร้านค้า",
  description: "สื่อการสอน เอกสาร และผลิตภัณฑ์ดิจิทัลสำหรับครู",
};
import Badge2 from "@/components/ui/Badge2";

const CATS: Record<string, { label: string; icon: string; gradient: string; svg: string }> = {
  worksheet: { label: "ใบงาน", icon: "📝", gradient: "from-blue-500 to-cyan-400", svg: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ebook: { label: "E-Book", icon: "📖", gradient: "from-purple-500 to-pink-400", svg: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  template: { label: "Template", icon: "🎨", gradient: "from-amber-500 to-orange-400", svg: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  resource: { label: "สื่อการสอน", icon: "📦", gradient: "from-emerald-500 to-teal-400", svg: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("products").select("*, seller:profiles!seller_id(full_name)").eq("is_published", true).order("created_at", { ascending: false });
  if (q?.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  if (cat) query = query.eq("category", cat);
  const { data: products } = await query;

  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true);

  // Gem links from DB
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "student";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    userRole = profile?.role || "student";
  }
  const { data: gemLinks } = await supabase.from("gem_links").select("*").eq("is_active", true).order("sort_order");
  const visibleGems = (gemLinks ?? []).filter((g) => {
    if (g.access_level === "all") return true;
    if (g.access_level === "instructor" && ["instructor", "admin"].includes(userRole)) return true;
    if (g.access_level === "admin" && userRole === "admin") return true;
    return false;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav active="shop" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(16,185,129,0.1)" }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 text-xs text-emerald-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalProducts ?? 0}+ สินค้าพร้อมดาวน์โหลด
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ lineHeight: "1.2" }}>
              สื่อการสอน<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">คุณภาพ</span>
              <br className="hidden sm:block" />
              สำหรับครูยุค AI
            </h1>
            <p className="text-sm sm:text-base mt-3 max-w-lg" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
              ใบงาน, E-Book, Template ออกแบบโดยผู้เชี่ยวชาญ ดาวน์โหลดทันที ใช้ได้ตลอดชีพ
            </p>
          </div>

          {/* Search — inside hero */}
          <form className="mt-6 max-w-xl">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" name="q" defaultValue={q ?? ""} placeholder="ค้นหาสินค้า เช่น ใบงานคณิต, Template..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm outline-none border-2 border-white/[0.07] focus:border-emerald-500/40 transition-colors" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-primary)" }} />
              {cat && <input type="hidden" name="cat" value={cat} />}
            </div>
          </form>
        </div>
      </div>

      {/* Categories + Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Category cards — modern glass style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Object.entries(CATS).map(([key, { label, gradient, svg }]) => {
            const isActive = cat === key;
            return (
              <Link key={key} href={isActive ? "/shop" : `/shop?cat=${key}`} className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-500 hover:-translate-y-1 overflow-hidden ${isActive ? "border-2 border-emerald-500/40 bg-emerald-500/5" : "border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"}`}>
                {/* Glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={svg} /></svg>
                  </div>
                  <p className={`text-sm font-semibold ${isActive ? "text-emerald-400" : "text-white"}`}>{label}</p>
                  <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {key === "worksheet" ? "แบบฝึกหัด/ใบกิจกรรม" : key === "ebook" ? "หนังสือดิจิทัล" : key === "template" ? "แม่แบบพร้อมใช้" : "ไฟล์สื่อสำเร็จรูป"}
                  </p>
                </div>
                {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />}
              </Link>
            );
          })}
        </div>

        {/* Active filters */}
        {(q || cat) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {q && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                ค้นหา: &quot;{q}&quot;
              </span>
            )}
            {cat && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {CATS[cat]?.icon} {CATS[cat]?.label || cat}
              </span>
            )}
            <Link href="/shop" className="text-xs text-emerald-400 hover:text-emerald-300 transition ml-1">ล้างตัวกรอง</Link>
            <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{products?.length ?? 0} รายการ</span>
          </div>
        )}

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={q ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"} /></svg>
            <p className="text-sm font-medium text-white">{q ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า"}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{q ? "ลองค้นหาด้วยคำอื่น" : "กลับมาใหม่เร็วๆ นี้"}</p>
            {q && <Link href="/shop" className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all">ดูสินค้าทั้งหมด</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="group rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-md hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-white/[0.12] transition-all duration-500">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-teal-800/20 flex items-center justify-center">
                      <span className="text-4xl opacity-30">{CATS[p.category]?.icon || "📄"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20 backdrop-blur-sm">{CATS[p.category]?.label || p.category}</span>
                  </div>
                  {p.price === 0 && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">ฟรี</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition-colors duration-300 leading-snug">{p.title}</h3>
                  {p.description && <p className="text-xs mt-1.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>{p.description}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{(p.seller as unknown as { full_name: string } | null)?.full_name || "KruCraft"}</span>
                    <span className="text-sm font-semibold text-emerald-400">{p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* GEM — AI Tools (Dynamic from DB) */}
        {visibleGems.length > 0 && (
          <div className="mt-16">
            <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 mb-6 border border-purple-500/20" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), var(--bg-secondary), rgba(59,130,246,0.05))" }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20 shrink-0">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">AI Gem Tools</h2>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>เครื่องมือ AI สำหรับครูยุคใหม่</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleGems.map((gem) => (
                <a key={gem.id} href={gem.url} target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] p-5 hover:-translate-y-1.5 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gem.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                  <div className="relative flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gem.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{gem.title}</h3>
                      {gem.description && <p className="text-xs mt-1" style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>{gem.description}</p>}
                    </div>
                  </div>
                  <div className="relative mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Powered by AI</span>
                    <span className="text-xs font-medium text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      เปิด
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
