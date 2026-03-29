import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { maskEmail } from "@/lib/utils";
import DownloadGrid from "./DownloadGrid";

export default async function DownloadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*, product:products(*)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!purchase) redirect("/orders");

  const product = purchase.product;
  const fileItems = (product?.file_items as { title: string; url: string; thumbnail?: string }[]) || [];
  const downloadCount = purchase.download_count || 0;
  const maxDownloads = purchase.max_downloads || 40;

  // If no file_items, create single item from file_url
  const files = fileItems.length > 0 ? fileItems : product?.file_url ? [{ title: product.title, url: product.file_url, thumbnail: product.thumbnail_url }] : [];

  // Get featured products for upsell
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("id, title, thumbnail_url, price")
    .eq("is_published", true)
    .neq("id", product?.id || "")
    .order("download_count", { ascending: false })
    .limit(3);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center py-8 rounded-2xl mb-6" style={{ background: "linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))" }}>
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          ดาวน์โหลด{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{product?.title}</span>
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>เลือกไฟล์ที่ต้องการดาวน์โหลด</p>
      </div>

      {/* Info Card */}
      <div className="max-w-xl mx-auto mb-8 rounded-2xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
        <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>อีเมล</span>
          <span className="text-sm font-mono text-emerald-400">{maskEmail(user.email || "")}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>ดาวน์โหลดแล้ว</span>
          <span className="text-sm"><span className="text-emerald-400 font-bold">{downloadCount}</span> / {maxDownloads} ครั้ง</span>
        </div>
        <div className="rounded-full h-1.5 mt-3 overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min((downloadCount / maxDownloads) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Files Grid */}
      <DownloadGrid files={files} purchaseId={orderId} downloadCount={downloadCount} maxDownloads={maxDownloads} />

      {/* Upsell */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="mt-12 rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-[var(--bg-card)] to-emerald-950/30">
          <h3 className="text-base font-bold text-white mb-4">สนใจเนื้อหาเพิ่มเติม?</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {featuredProducts.map((p) => (
              <a key={p.id} href={`/shop/${p.id}`} className="shrink-0 w-40 rounded-xl overflow-hidden border border-white/[0.07] hover:-translate-y-0.5 transition-all" style={{ background: "var(--bg-card)" }}>
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="w-full aspect-[4/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-emerald-900/30 to-teal-800/15" />
                )}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-white line-clamp-2">{p.title}</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">{p.price === 0 ? "ฟรี" : `฿${p.price.toLocaleString()}`}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 pb-8">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>www.krucraft.com</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ลิขสิทธิ์ตามกฎหมาย พ.ร.บ. ลิขสิทธิ์ พ.ศ. 2566</p>
      </div>
    </div>
  );
}
