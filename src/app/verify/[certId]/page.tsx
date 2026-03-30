import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function VerifyCertPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const supabase = await createClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*, user:profiles(full_name), course:courses(title)")
    .eq("cert_id", certId)
    .single();

  if (!certificate) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative rounded-2xl border border-white/[0.07] max-w-lg w-full p-8 text-center" style={{ background: "var(--bg-card)" }}>
        <Link href="/" className="text-sm bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent font-bold">KruCraft</Link>

        {certificate.is_valid ? (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mt-6 mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ใบประกาศนียบัตรถูกต้อง</h1>
            <p className="mb-6" style={{ color: "var(--text-muted)" }}>ยืนยันความถูกต้องของใบประกาศนียบัตรนี้</p>

            <div className="bg-white/[0.05] rounded-xl p-6 text-left space-y-4">
              {[
                { label: "รหัสใบประกาศ", value: certificate.cert_id, mono: true },
                { label: "ชื่อผู้รับ", value: certificate.user?.full_name || "-" },
                { label: "คอร์ส", value: certificate.course?.title || "-" },
                { label: "วันที่ออก", value: new Date(certificate.issued_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</div>
                  <div className={`text-white font-medium ${item.mono ? "font-mono" : ""}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mt-6 mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ใบประกาศนียบัตรถูกเพิกถอน</h1>
            <p style={{ color: "var(--text-muted)" }}>ใบประกาศนียบัตรนี้ไม่สามารถใช้งานได้อีกต่อไป</p>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-white/[0.07]">
          <Link href="/" className="text-sm hover:text-white transition" style={{ color: "var(--text-muted)" }}>
            ← กลับหน้าหลัก KruCraft
          </Link>
        </div>
      </div>
    </div>
  );
}
