interface Props {
  badges: string[];
}

export default function TrustBadges({ badges }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {badges.map((badge) => (
        <span key={badge} className="inline-flex items-center gap-1.5 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          {badge}
        </span>
      ))}
    </div>
  );
}
