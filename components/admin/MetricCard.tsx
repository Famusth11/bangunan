import { LucideIcon } from "lucide-react";

export function MetricCard({ title, value, icon: Icon, tone = "brand" }: { title: string; value: string; icon: LucideIcon; tone?: "brand" | "accent" | "ink" }) {
  const tones = {
    brand: "bg-brand/10 text-brand",
    accent: "bg-accent/20 text-[#9a5b0f]",
    ink: "bg-slate-100 text-ink"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
