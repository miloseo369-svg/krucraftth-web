import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="text-center px-6">
        <div className="text-8xl font-bold text-emerald-500/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">ไม่พบหน้านี้</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">หน้าที่คุณกำลังมองหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">
            กลับหน้าแรก
          </Link>
          <Link href="/courses" className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-sm font-medium text-white hover:bg-white/[0.04] transition-all">
            ดูคอร์สเรียน
          </Link>
        </div>
      </div>
    </div>
  );
}
