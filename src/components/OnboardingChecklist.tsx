import Link from "next/link";

interface Props { hasCourse: boolean; hasVideo: boolean; hasPrice: boolean; hasPublished: boolean; }

const STEPS = [
  { id: "create", label: "สร้างคอร์สแรก", desc: "ตั้งชื่อ thumbnail และรายละเอียดคอร์ส", href: "/admin/courses" },
  { id: "video", label: "เพิ่มบทเรียน", desc: "เพิ่มวิดีโอหรือเนื้อหาอย่างน้อย 1 บท", href: "/admin/courses" },
  { id: "price", label: "ตั้งราคาคอร์ส", desc: "กำหนดราคาให้กับคอร์ส", href: "/admin/courses" },
  { id: "publish", label: "เผยแพร่คอร์ส", desc: "เปิดให้นักเรียนเห็นและซื้อได้", href: "/admin/courses" },
];

export default function OnboardingChecklist({ hasCourse, hasVideo, hasPrice, hasPublished }: Props) {
  const doneMap: Record<string, boolean> = { create: hasCourse, video: hasVideo, price: hasPrice, publish: hasPublished };
  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const percent = Math.round((doneCount / STEPS.length) * 100);

  if (doneCount === STEPS.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">เริ่มต้นกับ KruCraft</h2>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{doneCount}/{STEPS.length} ขั้นตอน</p>
        </div>
        <span className="text-sm font-bold text-emerald-400">{percent}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const done = doneMap[step.id];
          return (
            <Link key={step.id} href={done ? "#" : step.href} className={`flex items-start gap-3 p-3 rounded-xl transition ${done ? "opacity-50" : "hover:bg-white/[0.03]"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${done ? "bg-emerald-500 text-black" : "border border-white/20 text-white/40"}`}>{done ? "✓" : i + 1}</div>
              <div>
                <p className={`text-sm font-medium ${done ? "text-white/50 line-through" : "text-white"}`}>{step.label}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
