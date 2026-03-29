import Image from 'next/image';
import Link from 'next/link';

interface CourseCardProps {
  title: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  href: string;
  instructor?: string | null;
  progress?: { done: number; total: number; percent: number } | null;
  statusBadge?: { label: string; variant: "published" | "draft" } | null;
}

export default function PremiumCourseCard({ title, description, price, imageUrl, href, instructor, progress, statusBadge }: CourseCardProps) {
  return (
    <Link href={href} className="group relative block w-full outline-none">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]">

        {/* Image zone */}
        <div className="relative mb-4 sm:mb-5 flex h-[150px] sm:h-[200px] w-full items-center justify-center">
          {/* Glow aura */}
          <div className="absolute left-1/2 top-1/2 h-24 w-24 sm:h-32 sm:w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[40px] sm:blur-[50px] transition-all duration-700 ease-out group-hover:h-36 group-hover:w-36 sm:group-hover:h-48 sm:group-hover:w-48 group-hover:bg-emerald-500/30" />

          {imageUrl ? (
            <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:-translate-y-3 sm:group-hover:-translate-y-4 group-hover:scale-105 sm:group-hover:scale-110">
              <Image src={imageUrl} alt={title} fill className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] sm:drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-800/15 transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-105">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-emerald-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute right-0 top-0 z-20">
            {price === 0 ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md">ฟรี</span>
            ) : (
              <span className="rounded-full border border-white/10 bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-md">฿{price.toLocaleString()}</span>
            )}
          </div>

          {statusBadge && (
            <div className="absolute left-0 top-0 z-20">
              <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold backdrop-blur-md border ${statusBadge.variant === "published" ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-yellow-500/30 bg-yellow-500/20 text-yellow-300"}`}>
                {statusBadge.label}
              </span>
            </div>
          )}

          {progress && progress.percent === 100 && (
            <div className="absolute left-0 top-0 z-20">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md">เรียนจบ</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h3 className="line-clamp-2 text-sm sm:text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
            {title}
          </h3>
          {description && !progress && (
            <p className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm text-zinc-400">{description}</p>
          )}
          {instructor && <p className="mt-1 text-[10px] sm:text-xs text-zinc-500">{instructor}</p>}
          {progress && (
            <div className="mt-2 sm:mt-3">
              <div className="h-1 sm:h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-zinc-500">{progress.done}/{progress.total} บทเรียน · {progress.percent}%</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-3 sm:mt-5 border-t border-white/5 pt-3 sm:pt-4">
          <div className="flex w-full items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            {progress ? "เข้าเรียนต่อ" : "ดูรายละเอียด →"}
          </div>
        </div>
      </div>
    </Link>
  );
}
