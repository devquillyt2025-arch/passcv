interface FeatureCardProps {
  icon: string;
  title: string;
  body: string;
}

export function FeatureCard({ icon, title, body }: FeatureCardProps) {
  return (
    <div className="flex gap-6 bg-[#13131A] border border-white/[0.07] hover:border-indigo-500/30 rounded-2xl p-6 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="shrink-0 w-10 h-10 rounded-[10px] bg-indigo-500/[0.12] flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-[15px] text-white/90 m-0">{title}</p>
        <p className="text-[13px] text-white/45 mt-1.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
