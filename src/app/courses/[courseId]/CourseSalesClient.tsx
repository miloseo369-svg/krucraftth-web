"use client";

import CountdownTimer from "@/components/CountdownTimer";
import EnrollButton from "@/components/EnrollButton";

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  originalPrice?: number | null;
  saleEndsAt?: string | null;
  savings: number;
  discount: number;
}

export default function CourseSalesClient({ courseId, courseTitle, price, originalPrice, saleEndsAt, savings, discount }: Props) {
  const saleActive = saleEndsAt && new Date(saleEndsAt) > new Date();

  return (
    <div className="mt-6">
      {/* Countdown */}
      {saleActive && (
        <div className="mb-4">
          <p className="text-sm font-medium text-red-400 mb-2">⏰ ราคานี้หมดใน</p>
          <CountdownTimer targetDate={saleEndsAt} />
        </div>
      )}

      {/* Price Block */}
      <div className="p-4 rounded-2xl border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
        {originalPrice && originalPrice > price && (
          <div className="flex items-center gap-2 mb-1">
            <span className="line-through text-sm" style={{ color: "var(--text-muted)" }}>฿{originalPrice.toLocaleString()}</span>
            {savings > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">ประหยัด ฿{savings.toLocaleString()} ({discount}%)</span>}
          </div>
        )}
        <div className="text-4xl font-bold text-emerald-400 mb-4">
          {price === 0 ? "ฟรี" : `฿${price.toLocaleString()}`}
        </div>
        <EnrollButton courseId={courseId} courseTitle={courseTitle} price={price} />
      </div>

      {/* Sticky Mobile */}
      <div className="fixed bottom-0 left-0 right-0 block md:hidden border-t p-4 z-40 backdrop-blur-md" style={{ background: "var(--glass-bg)", borderColor: "var(--border)" }}>
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm text-white font-medium line-clamp-1">{courseTitle}</p>
            <p className="text-sm font-bold text-emerald-400">{price === 0 ? "ฟรี" : `฿${price.toLocaleString()}`}</p>
          </div>
          <EnrollButton courseId={courseId} courseTitle={courseTitle} price={price} />
        </div>
      </div>
    </div>
  );
}
