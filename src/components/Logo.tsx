import Link from "next/link";

interface Props {
  href?: string;
}

export default function Logo({ href = "/" }: Props) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 sm:gap-2 group shrink-0">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
        <svg className="w-[60%] h-[60%] text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      </div>
      <span className="text-sm sm:text-lg font-bold">
        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Kru</span>
        <span className="text-white">Craft</span>
      </span>
    </Link>
  );
}
