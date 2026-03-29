"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import PaymentModal from "@/components/PaymentModal";

export default function EnrollButton({ courseId, courseTitle, price = 0 }: { courseId: string; courseTitle?: string; price?: number }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
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

  return (
    <>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "กำลังดำเนินการ..." : price > 0 ? `ซื้อคอร์ส ฿${price.toLocaleString()} →` : "ลงทะเบียนเรียนฟรี →"}
      </button>

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
