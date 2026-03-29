"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{
  toast: (message: string, type?: "success" | "error" | "info") => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let globalToast: (message: string, type?: "success" | "error" | "info") => void = () => {};

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  globalToast(message, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    globalToast = toast;
  }, [toast]);

  const icons: Record<string, string> = {
    success: "M5 13l4 4L19 7",
    error: "M6 18L18 6M6 6l12 12",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  const colors: Record<string, string> = {
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-[slideIn_0.3s_ease] ${colors[t.type]}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[t.type]} />
            </svg>
            <span className="text-sm font-medium text-white">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
