"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEnroll = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: courseId,
    });

    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="block w-full text-center py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียนเรียน"}
    </button>
  );
}
