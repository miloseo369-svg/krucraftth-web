import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import Badge2 from "@/components/ui/Badge2";

const CATS: Record<string, { label: string; icon: string }> = {
  worksheet: { label: "ใบงาน", icon: "📝" },
  ebook: { label: "E-Book", icon: "📖" },
  template: { label: "Template", icon: "🎨" },
  resource: { label: "สื่อการสอน", icon: "📦" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("products").select("*, seller:profiles!seller_id(full_name)").eq("is_published", true).order("created_at", { ascending: false });
  if (q?.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  if (cat) query = query.eq("category", cat);
  const { data: products } = await query;

  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav active="shop" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(16,185,129,0.15)", background: "linear-gradient(135deg, rgba(6,78,59,0.3), var(--bg-secondary), rgba(6,78,59,0.15))" }}>
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🛍️</span>
            <h1 className="text-3xl font-semibold text-white">ร้านค้าดิจิทัล</h1>
          </div>
          <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
            ใบงาน, E-Book, Template และสื่อการสอนคุณภาพ ดาวน์โหลดได้ทันทีหลังชำระเงิน
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="text-emerald-400 font-semibold">{totalProducts ?? 0}</span> สินค้าทั้งหมด
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              อัปเดตใหม่ทุกสัปดาห์
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards + Search */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Category quick-nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Object.entries(CATS).map(([key, { label, icon }]) => (
            <Link
              key={key}
              href={cat === key ? "/shop" : `/shop?cat=${key}`}
              className={`rounded-xl border p-4 text-center transition-all hover:-translate-y-0.5 ${cat === key ? "border-emerald-500/50 bg-emerald-500/5" : "hover:bg-[var(--bg-hover)]"}`}
              style={{ background: cat === key ? undefined : "var(--bg-card)", borderColor: cat === key ? undefined : "var(--border)" }}
            >
              <span className="text-2xl">{icon}</span>
              <p className={`text-xs font-medium mt-2 ${cat === key ? "text-emerald-400" : "text-white"}`}>{label}</p>
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <form className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" name="q" defaultValue={q ?? ""} placeholder="ค้นหาสินค้า เช่น ใบงานคณิต, Template สรุปเนื้อหา..." className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            {cat && <input type="hidden" name="cat" value={cat} />}
          </div>
        </form>

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
          <div className="text-center py-24 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-white font-medium">{q ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า"}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{q ? "ลองค้นหาด้วยคำอื่น" : "กลับมาใหม่เร็วๆ นี้"}</p>
            {q && <Link href="/shop" className="inline-block mt-4 px-5 py-2 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">ดูสินค้าทั้งหมด</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="group rounded-xl overflow-hidden border hover:-translate-y-1 hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-300" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-emerald-700/20 flex items-center justify-center">
                      <span className="text-4xl opacity-30">{CATS[p.category]?.icon || "📄"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge2 variant="new">{CATS[p.category]?.label || p.category}</Badge2>
                  </div>
                  {p.price === 0 && <div className="absolute top-2.5 right-2.5"><Badge2 variant="free">ฟรี</Badge2></div>}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition leading-snug">{p.title}</h3>
                  {p.description && <p className="text-xs mt-1.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>{p.description}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{(p.seller as unknown as { full_name: string } | null)?.full_name || "KruCraft"}</span>
                    <span className="text-sm font-semibold text-emerald-400">{p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
