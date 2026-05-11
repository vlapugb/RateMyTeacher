import type { LucideIcon } from "lucide-react";

type CatalogSummaryItem = {
  Icon: LucideIcon;
  value: number;
  label: string;
};

export function CatalogSummary({
  items,
}: {
  items: readonly CatalogSummaryItem[];
}) {
  return (
    <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
      {items.map(({ Icon, value, label }) => (
        <div
          key={label}
          className="overflow-hidden rounded-lg border border-line bg-white px-2.5 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-3 sm:py-3"
        >
          <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
            {value > 1000 ? "1000+" : value}
          </div>
          <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

