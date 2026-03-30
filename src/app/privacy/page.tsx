import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวของ KruCraft",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-6">นโยบายความเป็นส่วนตัว</h1>
        <div className="prose-sm space-y-5 text-[var(--text-secondary)]" style={{ lineHeight: "1.8" }}>
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h2>
            <p>เราเก็บรวบรวมข้อมูลที่จำเป็นเมื่อคุณสมัครสมาชิกและใช้บริการ ได้แก่:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ชื่อ-นามสกุล, อีเมล, รูปโปรไฟล์ (จาก Google Account)</li>
              <li>ข้อมูลการชำระเงิน (สลิปการโอน, จำนวนเงิน)</li>
              <li>ข้อมูลการเรียน (ความก้าวหน้า, คะแนนแบบทดสอบ)</li>
              <li>ข้อมูลการใช้งานเว็บไซต์ (หน้าที่เข้าชม, เวลาที่ใช้)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>เพื่อให้บริการแพลตฟอร์มเรียนออนไลน์</li>
              <li>เพื่อดำเนินการชำระเงินและจัดส่งสินค้าดิจิทัล</li>
              <li>เพื่อปรับปรุงประสบการณ์การใช้งาน</li>
              <li>เพื่อส่งแจ้งเตือนเกี่ยวกับบริการ (สถานะการชำระเงิน, คอร์สใหม่)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. การแบ่งปันข้อมูล</h2>
            <p>เราไม่แบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลภายนอก ยกเว้น:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ผู้ให้บริการที่จำเป็น (Supabase สำหรับฐานข้อมูล, Vercel สำหรับ hosting)</li>
              <li>เมื่อกฎหมายกำหนด</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. ความปลอดภัยของข้อมูล</h2>
            <p>เราใช้มาตรการรักษาความปลอดภัยมาตรฐานอุตสาหกรรม ได้แก่ การเข้ารหัส HTTPS, Row Level Security (RLS) ในฐานข้อมูล, และการยืนยันตัวตนผ่าน OAuth 2.0</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. สิทธิ์ของผู้ใช้</h2>
            <p>คุณมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนตัวของคุณได้ตลอดเวลา โดยติดต่อผ่านอีเมลผู้ดูแลระบบ</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. คุกกี้</h2>
            <p>เราใช้คุกกี้เพื่อจัดการ session การเข้าสู่ระบบและติดตามลิงก์ affiliate เท่านั้น</p>
          </section>

          <p className="text-xs text-[var(--text-muted)] pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            ปรับปรุงล่าสุด: มีนาคม 2569 · หากมีคำถาม กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
        <Link href="/" className="inline-block mt-6 text-sm text-emerald-400 hover:text-emerald-300 transition">← กลับหน้าแรก</Link>
      </div>
    </div>
  );
}
