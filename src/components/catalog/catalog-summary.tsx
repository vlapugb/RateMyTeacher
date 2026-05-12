import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CatalogSummaryItem = {
  Icon: LucideIcon;
  value: number;
  label: string;
  activityKind?: "reviews" | "comments";
  onClick?: () => void;
};

type CatalogSummaryProps = {
  items: readonly CatalogSummaryItem[];
  activeType?: "reviews" | "comments" | null;
};

export function CatalogSummary({
  items,
  activeType,
}: CatalogSummaryProps) {
  return (
    <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
      {items.map(({ Icon, value, label, onClick, activityKind }) => {
        const isInteractive = !!onClick;
        const isActive =
          isInteractive && activityKind != null && activityKind === activeType;

        return (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={!isInteractive}
            aria-expanded={
              isInteractive && activityKind != null
                ? activeType === activityKind
                : undefined
            }
            aria-controls={
              isInteractive && activityKind != null
                ? "recent-activity-panel"
                : undefined
            }
            className={cn(
              "overflow-hidden rounded-lg border border-line bg-white px-2.5 py-2.5 shadow-sm transition-all duration-300 text-left",
              isInteractive &&
                "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
              !isInteractive && "cursor-default",
              isActive &&
                "border-primary bg-primary-soft shadow-md",
              "sm:px-3 sm:py-3",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                isActive ? "text-primary" : "text-primary",
              )}
            />
            <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
              {value > 1000 ? "1000+" : value}
            </div>
            <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
