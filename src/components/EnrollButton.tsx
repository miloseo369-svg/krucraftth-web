"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import PaymentModal from "@/components/PaymentModal";

export default function EnrollButton({ courseId, courseTitle, price = 0, creditPrice = 0 }: { courseId: string; courseTitle?: string; price?: number; creditPrice?: number }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [enrollingWithCredits, setEnrollingWithCredits] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEnroll = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { router.push("/login"); return; }

    // คอร์สเสียเงิน → เปิด modal ส่งสลิป
    if (price > 0) {
      setShowPayment(true);
      setLoading(false);
      return;
    }

    // คอร์สฟรี → enroll เลย
    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: courseId,
    });

    if (error) {
      showToast("ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่", "error");
      setLoading(false);
      return;
    }

    showToast("ลงทะเบียนสำเร็จ! เริ่มเรียนได้เลย", "success");
    router.refresh();
    setLoading(false);
  };

  const handleEnrollWithCredits = async () => {
    if (!creditPrice || creditPrice <= 0) return;
    setEnrollingWithCredits(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    try {
      const res = await fetch("/api/credits/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "เกิดข้อผิดพลาด", "error");
        return;
      }

      showToast(`ลงทะเบียนสำเร็จ! หักเครดิต ${creditPrice}`, "success");
      router.refresh();
    } catch {
      showToast("เกิดข้อผิดพลาด", "error");
    } finally {
      setEnrollingWithCredits(false);
    }
  };

  return (
    <>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "กำลังดำเนินการ..." : price > 0 ? `ซื้อคอร์ส ฿${price.toLocaleString()} →` : "ลงทะเบียนเรียนฟรี →"}
      </button>

      {/* Credit option */}
      {creditPrice > 0 && price > 0 && (
        <button
          onClick={handleEnrollWithCredits}
          disabled={enrollingWithCredits}
          className="block w-full text-center py-2.5 mt-2 rounded-xl border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/5 active:scale-95 transition-all disabled:opacity-50"
        >
          {enrollingWithCredits ? "กำลังดำเนินการ..." : `หรือใช้ ${creditPrice.toLocaleString()} เครดิต`}
        </button>
      )}

      {showPayment && (
        <PaymentModal
          itemType="course"
          itemId={courseId}
          itemTitle={courseTitle || "คอร์สเรียน"}
          price={price}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
