import { TeacherCardSkeleton } from "@/components/ui/skeleton";

export default function TeachersLoading() {
  return (
    <div className="px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
      <section className="pt-4 sm:pt-6">
        <div className="max-w-3xl space-y-3">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 sm:h-10" />
          <div className="h-5 w-80 animate-pulse rounded-lg bg-slate-200 sm:h-6" />
        </div>
        <div className="mt-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-40 animate-pulse rounded-lg bg-slate-200"
            />
          ))}
        </div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TeacherCardSkeleton key={i} compact />
        ))}
      </section>
    </div>
  );
}
