"use client";

import { useState } from "react";

interface Props {
  items: { q: string; a: string }[];
}

export default function FAQAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="rounded-xl mb-2 overflow-hidden" style={{ background: "var(--bg-card)" }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex justify-between items-center w-full p-4 text-left transition-colors hover:bg-white/[0.03]"
            >
              <span className="font-medium text-sm text-white pr-4">{item.q}</span>
              <span className={`text-lg shrink-0 transition-colors ${isOpen ? "text-red-400" : "text-emerald-400"}`}>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="text-sm px-4 pb-4" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
