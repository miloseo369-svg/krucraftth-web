"use client";

import { useState, useEffect } from "react";

interface Props {
  targetDate: Date | string | null;
}

export default function CountdownTimer({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate || expired) return null;

  const blocks = [
    { value: timeLeft.hours, label: "ชั่วโมง" },
    { value: timeLeft.minutes, label: "นาที" },
    { value: timeLeft.seconds, label: "วินาที" },
  ];

  return (
    <div className="flex items-center gap-2">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2">
          <div className="w-16 rounded-xl border border-white/[0.07] p-3 text-center" style={{ background: "var(--bg-card)" }}>
            <div className="text-2xl font-bold font-mono text-emerald-400">{String(b.value).padStart(2, "0")}</div>
            <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{b.label}</div>
          </div>
          {i < blocks.length - 1 && <span className="text-lg font-bold text-emerald-400/50">:</span>}
        </div>
      ))}
    </div>
  );
}
