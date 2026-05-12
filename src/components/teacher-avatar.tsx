import Image from "next/image";
import { cn } from "@/lib/utils";

type TeacherAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  rating?: number;
};

const sizeClass = {
  sm: "h-10 w-10 sm:h-12 sm:w-12",
  md: "h-14 w-14 sm:h-16 sm:w-16",
  lg: "h-20 w-20 sm:h-24 sm:w-24",
};

function getRatingImage(rating: number) {
  if (rating <= 0) return "/teacher-avatar.png";
  if (rating >= 4) return "/happy.png";
  if (rating >= 3) return "/neutral.png";
  return "/angry.png";
}

export function TeacherAvatar({ name, rating, size = "md" }: TeacherAvatarProps) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-white p-1 shadow-sm",
        sizeClass[size],
      )}
      aria-label={name || "Преподаватель"}
      role="img"
    >
      <Image
        src={rating != null ? getRatingImage(rating) : "/teacher-avatar.png"}
        alt=""
        width={96}
        height={96}
        className="h-full w-full rounded-full object-contain"
        draggable={false}
      />
    </div>
  );
}
