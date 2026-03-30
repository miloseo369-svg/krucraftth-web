"use client";

import { useState, createContext, useContext, useCallback } from "react";

interface ConfirmState {
  message: string;
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<{
  confirm: (message: string) => Promise<boolean>;
}>({ confirm: () => Promise.resolve(false) });

export function useConfirm() {
  return useContext(ConfirmContext);
}

let globalConfirm: (message: string) => Promise<boolean> = () => Promise.resolve(false);

export function showConfirm(message: string): Promise<boolean> {
  return globalConfirm(message);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, resolve });
    });
  }, []);

  globalConfirm = confirm;

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="rounded-2xl border border-white/[0.07] max-w-sm w-full p-6 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white text-center text-sm leading-relaxed mb-6">{state.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 py-2.5 text-sm hover:text-white bg-white/[0.05] rounded-xl hover:bg-white/[0.05] transition"
                style={{ color: "var(--text-secondary)" }}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleClose(true)}
                className="flex-1 py-2.5 text-sm text-white bg-red-600 rounded-xl hover:bg-red-500 transition font-medium"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
