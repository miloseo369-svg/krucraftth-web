interface Props {
  text: string;
  show: boolean;
}

export default function AnnouncementBar({ text, show }: Props) {
  if (!show) return null;
  return (
    <div className="bg-emerald-500 text-black text-sm font-medium text-center py-2 sticky top-0 z-[60]">
      {text}
    </div>
  );
}
