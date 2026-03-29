"use client";

import { useState } from "react";
import { showToast } from "@/components/Toast";

interface FileItem {
  title: string;
  url: string;
  thumbnail?: string | null;
}

interface Props {
  files: FileItem[];
  purchaseId: string;
  downloadCount: number;
  maxDownloads: number;
}

export default function DownloadGrid({ files, purchaseId, downloadCount, maxDownloads }: Props) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleDownload = async (index: number) => {
    if (downloadCount >= maxDownloads) {
      showToast("ดาวน์โหลดครบจำนวนสูงสุดแล้ว", "error");
      return;
    }

    setLoadingIndex(index);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, fileIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ดาวน์โหลดไม่สำเร็จ");
      window.open(data.url, "_blank");
      showToast("เริ่มดาวน์โหลดแล้ว", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoadingIndex(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
        <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        <p className="text-sm font-medium text-white">ไม่มีไฟล์สำหรับดาวน์โหลด</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กรุณาติดต่อ admin</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {files.map((file, i) => (
        <div key={i} className="relative rounded-2xl p-5 text-center border border-white/[0.07] hover:border-white/[0.12] transition-all" style={{ background: "var(--bg-card)" }}>
          {/* Number badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 text-black font-bold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/30">
            {i + 1}
          </div>

          {/* Thumbnail */}
          <div className="mt-4 w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.07]" style={{ background: "var(--bg-secondary)" }}>
            {file.thumbnail ? (
              <img src={file.thumbnail} alt={file.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>

          {/* Title */}
          <p className="font-semibold text-sm mt-3 line-clamp-2 min-h-[2.5rem] text-white">{file.title}</p>

          {/* Download button */}
          <button
            onClick={() => handleDownload(i)}
            disabled={loadingIndex === i || downloadCount >= maxDownloads}
            className="w-full mt-3 h-11 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {loadingIndex === i ? "กำลังโหลด..." : "ดาวน์โหลด"}
          </button>
        </div>
      ))}
    </div>
  );
}
