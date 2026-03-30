import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "นโยบายการคืนเงิน",
  description: "นโยบายการคืนเงินของ KruCraft",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-6">นโยบายการคืนเงิน</h1>
        <div className="prose-sm space-y-5 text-[var(--text-secondary)]" style={{ lineHeight: "1.8" }}>
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. สินค้าดิจิทัลและคอร์สเรียน</h2>
            <p>เนื่องจากสินค้าทั้งหมดบนแพลตฟอร์ม KruCraft เป็น <strong className="text-white">สินค้าดิจิทัล</strong> ที่สามารถเข้าถึงได้ทันทีหลังชำระเงิน:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white">คอร์สเรียน:</strong> ไม่สามารถคืนเงินได้หลังได้รับสิทธิ์เข้าเรียน</li>
              <li><strong className="text-white">ใบงาน / E-Book / Template:</strong> ไม่สามารถคืนเงินได้หลังดาวน์โหลด</li>
              <li><strong className="text-white">เครดิต:</strong> ไม่สามารถคืนเงินได้หลังเติมเข้าระบบ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. ข้อยกเว้น</h2>
            <p>เราจะพิจารณาคืนเงินในกรณีต่อไปนี้:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ชำระเงินซ้ำ (duplicate payment)</li>
              <li>ระบบทำรายการผิดพลาด</li>
              <li>สินค้าไม่ตรงตามที่โฆษณาอย่างชัดเจน</li>
            </ul>
            <p className="mt-2">กรณีเหล่านี้ กรุณาติดต่อผู้ดูแลระบบภายใน <strong className="text-white">7 วัน</strong> หลังชำระเงิน พร้อมหลักฐานสลิปการโอน</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. ขั้นตอนการขอคืนเงิน</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>ติดต่อผู้ดูแลระบบผ่านช่องทางที่กำหนด</li>
              <li>แจ้งเหตุผลและแนบหลักฐาน</li>
              <li>ผู้ดูแลจะพิจารณาและแจ้งผลภายใน 3 วันทำการ</li>
              <li>หากอนุมัติ จะคืนเงินเข้าบัญชีต้นทางภายใน 7 วันทำการ</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. การเปลี่ยนคอร์ส</h2>
            <p>ไม่รองรับการเปลี่ยนคอร์สหลังชำระเงิน กรุณาศึกษารายละเอียดคอร์สอย่างรอบคอบก่อนตัดสินใจ</p>
          </section>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mt-6">
            <p className="text-xs text-amber-400 font-medium">สำคัญ: การชำระเงินถือว่าคุณยอมรับนโยบายนี้แล้ว กรุณาอ่านรายละเอียดก่อนทำรายการ</p>
          </div>

          <p className="text-xs text-[var(--text-muted)] pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            ปรับปรุงล่าสุด: มีนาคม 2569 · หากมีคำถาม กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
        <Link href="/" className="inline-block mt-6 text-sm text-emerald-400 hover:text-emerald-300 transition">← กลับหน้าแรก</Link>
      </div>
    </div>
  );
}
