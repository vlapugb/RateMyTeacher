import { cn } from "@/lib/utils";

type TeacherAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-10 w-10 text-lg sm:h-12 sm:w-12 sm:text-xl",
  md: "h-14 w-14 text-xl sm:h-16 sm:w-16 sm:text-2xl",
  lg: "h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl",
};

export function TeacherAvatar({ name, size = "md" }: TeacherAvatarProps) {
  const tone = (name.charCodeAt(0) || 0) % 3;

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-line",
        tone === 0 && "bg-blue-50",
        tone === 1 && "bg-orange-50",
        tone === 2 && "bg-violet-50",
        sizeClass[size],
      )}
      aria-label={name || "Преподаватель"}
      role="img"
    >
      <span>🙂</span>
    </div>
  );
}
