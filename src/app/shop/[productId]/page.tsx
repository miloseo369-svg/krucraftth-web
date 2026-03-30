import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReviewStars from "@/components/ReviewStars";
import TrustBadges from "@/components/TrustBadges";
import FAQAccordion from "@/components/FAQAccordion";
import ProductSalesClient from "./ProductSalesClient";
import Logo from "@/components/Logo";

const CATEGORY_LABELS: Record<string, string> = { worksheet: "ใบงาน", ebook: "E-Book", template: "Template", resource: "สื่อการสอน" };

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("title, description, thumbnail_url").eq("id", productId).single();
  if (!product) return { title: "ไม่พบสินค้า" };
  return { title: `${product.title} — KruCraft Shop`, description: product.description || product.title, openGraph: { title: product.title, description: product.description || undefined, images: product.thumbnail_url ? [product.thumbnail_url] : undefined } };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase.from("products").select("*, seller:profiles!seller_id(full_name)").eq("id", productId).single();
  if (!product) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let purchased = false;
  if (user) {
    const { data } = await supabase.from("purchases").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
    purchased = !!data;
  }

  const saleActive = product.sale_ends_at && new Date(product.sale_ends_at) > new Date();
  const discount = saleActive && product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const savings = saleActive && product.original_price ? product.original_price - product.price : 0;
  const whatYouGet = (product.what_you_get as string[]) || [];
  const faqItems = (product.faq as { q: string; a: string }[]) || [];

  const defaultFaq = [
    { q: "ดาวน์โหลดได้กี่ครั้ง?", a: "ดาวน์โหลดได้สูงสุด 40 ครั้ง ใช้ได้ตลอดชีพ" },
    { q: "ได้รับไฟล์ยังไงหลังชำระเงิน?", a: "Admin จะตรวจสลิปและอนุมัติภายใน 30 นาที จากนั้นกดดาวน์โหลดได้ที่หน้าคำสั่งซื้อ" },
    { q: "ใช้ได้กับอุปกรณ์อะไรบ้าง?", a: "ไฟล์ PDF เปิดได้ทุกอุปกรณ์ มือถือ แท็บเล็ต คอมพิวเตอร์" },
    { q: "มีนโยบายคืนเงินไหม?", a: "เนื่องจากเป็นสินค้าดิจิทัล ไม่รับคืนเงินหลังดาวน์โหลดแล้ว" },
    { q: "อัปเดตเนื้อหาฟรีไหม?", a: "ใช่ครับ อัปเดตฟรีตลอดชีพ เมื่อมีเวอร์ชันใหม่จะแจ้งทาง Line" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14">
          <Logo />
          <div className="flex items-center gap-2 text-sm">
            <Link href="/shop" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ร้านค้า
            </Link>
          </div>
        </div>
      </nav>

      {/* Social Proof Bar */}
      <div className="border-b py-3" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-4 justify-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400">
            👥 {product.download_count || 0} คนดาวน์โหลดแล้ว
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-amber-500/10 text-amber-400">
            ⭐ {(product.review_avg || 5).toFixed(1)}/5 ({product.review_count || 0} รีวิว)
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT — Visual */}
          <div className="lg:col-span-5">
            <div className="max-w-xs mx-auto lg:mx-0 sticky top-24">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ transform: "perspective(1000px) rotateY(-5deg)", transition: "transform 0.3s" }}>
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt={product.title} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-emerald-900/40 to-teal-800/20 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {(product.download_count || 0) > 50 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">HOT!</div>
                )}
              </div>
              <p className="text-center mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                {CATEGORY_LABELS[product.category] || product.category} · โดย {(product.seller as unknown as { full_name: string } | null)?.full_name || "KruCraft"}
              </p>
            </div>
          </div>

          {/* RIGHT — Sales */}
          <div className="lg:col-span-7">
            <TrustBadges badges={["📄 ไฟล์ PDF คุณภาพสูง", "⚡ ดาวน์โหลดได้ทันที", "🔄 อัปเดตฟรีตลอดชีพ", "🔒 ชำระเงินปลอดภัย"]} />

            <h1 className="text-3xl font-bold text-white mt-4" style={{ lineHeight: "1.3" }}>{product.title}</h1>

            <div className="mt-3">
              <ReviewStars avg={product.review_avg || 5} count={product.review_count || 0} />
            </div>

            {product.description && (
              <p className="mt-3 text-base" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{product.description}</p>
            )}

            {/* What You Get */}
            {whatYouGet.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-white mb-2">สิ่งที่คุณจะได้รับ</p>
                {whatYouGet.map((item, i) => (
                  <div key={i} className="flex gap-2 text-sm mt-1.5">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Client-side: Countdown + Price + CTA + Sticky Mobile */}
            <ProductSalesClient
              productId={productId}
              productTitle={product.title}
              price={product.price}
              originalPrice={product.original_price}
              saleEndsAt={product.sale_ends_at}
              purchased={purchased}
              fileUrl={product.file_url}
              savings={savings}
              discount={discount}
            />
          </div>
        </div>

        {/* Benefits Grid */}
        {whatYouGet.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">สิ่งที่คุณจะได้รับ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whatYouGet.map((item, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <p className="text-sm font-medium text-white mt-2">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">ผู้ที่ซื้อแล้วพูดถึง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "ครูแอน", role: "คุณครูประถมศึกษา", text: "ใบงานคุณภาพดีมาก ประหยัดเวลาเตรียมสอนไปเยอะเลย แนะนำเลยค่ะ" },
              { name: "ครูเบส", role: "อาจารย์มัธยม", text: "เนื้อหาตรงหลักสูตร ออกแบบสวยมาก นักเรียนชอบมาก" },
              { name: "คุณมิว", role: "นักศึกษา", text: "ราคาคุ้มค่ามาก เทียบกับที่อื่นถูกกว่าเยอะ คุณภาพดีด้วย" },
            ].map((r) => (
              <div key={r.name} className="rounded-xl p-4 border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-sm italic line-clamp-3" style={{ color: "var(--text-secondary)" }}>&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-xs font-bold">{r.name[0]}</div>
                  <div>
                    <p className="text-xs font-medium text-white">{r.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">คำถามที่พบบ่อย</h2>
          <FAQAccordion items={faqItems.length > 0 ? faqItems : defaultFaq} />
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 to-[var(--bg-secondary)]">
          <h2 className="text-xl font-bold text-white">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>ดาวน์โหลดได้ทันทีหลังชำระเงิน ใช้ได้ตลอดชีพ</p>
          <div className="mt-5 max-w-sm mx-auto">
            <ProductSalesClient
              productId={productId}
              productTitle={product.title}
              price={product.price}
              originalPrice={product.original_price}
              saleEndsAt={null}
              purchased={purchased}
              fileUrl={product.file_url}
              savings={0}
              discount={0}
              ctaOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
