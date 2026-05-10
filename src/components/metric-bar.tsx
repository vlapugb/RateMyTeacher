import { cn } from "@/lib/utils";

type MetricBarProps = {
  label: string;
  value: number;
  inverse?: boolean;
};

export function MetricBar({ label, value, inverse }: MetricBarProps) {
  return (
    <div className="grid grid-cols-[minmax(120px,1fr)_minmax(120px,220px)_40px] items-center gap-3 text-sm">
      <span className="font800 text-slate-700">{label}</span>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full",
            inverse ? "bg-danger" : "bg-primary-strong",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value * 20))}%` }}
        />
      </div>
      <span className="text-right font900 text-slate-700">{value}</span>
    </div>
  );
}
