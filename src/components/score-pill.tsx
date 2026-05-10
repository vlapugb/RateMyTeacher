import { cn } from "@/lib/utils";

type ScorePillProps = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger";
};

export function ScorePill({ label, value, tone = "default" }: ScorePillProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-1.5 text-center sm:px-2.5",
        tone === "default" && "border-line bg-white",
        tone === "success" && "border-emerald-100 bg-emerald-50",
        tone === "danger" && "border-rose-100 bg-rose-50",
      )}
    >
      <div
        className={cn(
          "text-xs font800 sm:text-sm",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-semibold leading-3 text-muted sm:text-[10px]">
        {label}
      </div>
    </div>
  );
}
