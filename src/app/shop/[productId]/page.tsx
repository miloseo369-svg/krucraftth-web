import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShopBuyButton from "./ShopBuyButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("title, description, thumbnail_url").eq("id", productId).single();
  if (!product) return { title: "ไม่พบสินค้า" };
  return {
    title: `${product.title} — KruCraft Shop`,
    description: product.description || product.title,
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  worksheet: "ใบงาน",
  ebook: "E-Book",
  template: "Template",
  resource: "สื่อการสอน",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(full_name)")
    .eq("id", productId)
    .single();

  if (!product) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let purchased = false;
  if (user) {
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    purchased = !!data;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14">
          <Link href="/" className="text-lg font-semibold text-emerald-400 mr-6">
            KruCraft
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/shop" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ร้านค้า
            </Link>
            <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium truncate max-w-xs text-sm">{product.title}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Preview */}
          <div className="lg:col-span-3">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-emerald-700/20 flex items-center justify-center">
                  <svg className="w-24 h-24" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <h1 className="text-2xl font-semibold text-white mt-4">{product.title}</h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              โดย {(product.seller as unknown as { full_name: string } | null)?.full_name || "KruCraft"}
            </p>

            {product.description && (
              <p className="text-sm mt-4" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{product.description}</p>
            )}

            <div className="mt-6 p-5 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="text-3xl font-semibold text-white mb-4">
                {product.price === 0 ? <span className="text-emerald-400">ฟรี</span> : `฿${product.price.toLocaleString()}`}
              </div>

              {purchased ? (
                <a
                  href={product.file_url}
                  download
                  className="block w-full text-center py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  ดาวน์โหลด
                </a>
              ) : (
                <ShopBuyButton productId={productId} productTitle={product.title} price={product.price} />
              )}

              {purchased && (
                <p className="text-xs text-emerald-400 text-center mt-3">คุณซื้อสินค้านี้แล้ว</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
