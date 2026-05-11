import { Star } from "lucide-react";
import { RATING_SCALE } from "@/lib/app-config";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  /** Rating value is clamped to the public 0-5 display range. */
  value: number;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
  danger?: boolean;
};

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function RatingStars({
  value,
  size = "md",
  muted,
  danger,
}: RatingStarsProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const rounded = Math.min(
    RATING_SCALE.displayMax,
    Math.max(RATING_SCALE.displayMin, Math.round(safeValue)),
  );

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rounded} / ${RATING_SCALE.displayMax}`}
    >
      {Array.from({ length: RATING_SCALE.stars }).map((_, index) => {
        const filled = index + 1 <= rounded;
        return (
          <Star
            key={index}
            className={cn(
              sizeClass[size],
              filled
                ? danger
                  ? "fill-danger text-danger"
                  : "fill-primary text-primary"
                : muted
                  ? "text-slate-300"
                  : "text-slate-400",
            )}
          />
        );
      })}
    </div>
  );
}
