"use client";

import { useEffect } from "react";

export default function ShopError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--red-dim, rgba(239,68,68,0.15))" }}>
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">เกิดข้อผิดพลาด</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่</p>
        <button
          onClick={() => unstable_retry()}
          className="mt-2 px-5 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
