const variants = {
  free: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  paid: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  new: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  popular: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function Badge2({ variant = "free", children, className = "" }: { variant?: keyof typeof variants; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
