"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  links: { href: string; label: string }[];
  email: string;
}

export default function MobileMenu({ links, email }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-white/5 transition" aria-label="เมนู">
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-14 right-0 left-0 m-4 rounded-2xl border border-white/[0.07] overflow-hidden animate-fade-in" style={{ background: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
            {/* Email */}
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <p className="text-xs font-mono truncate" style={{ color: "var(--text-muted)" }}>{email}</p>
            </div>

            {/* Nav links */}
            <div className="py-2">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center px-5 py-3 text-sm text-white hover:bg-white/[0.04] transition">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
