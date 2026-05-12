import { Sparkles, X } from "lucide-react";

type CatalogIntroProps = {
  closeLabel: string;
  dismissLabel: string;
  text: string;
  title: string;
  onDismiss: () => void;
};

export function CatalogIntro({
  closeLabel,
  dismissLabel,
  text,
  title,
  onDismiss,
}: CatalogIntroProps) {
  return (
    <div className="mt-5 max-w-full animate-slide-in overflow-hidden rounded-lg border border-line bg-primary-soft p-4 shadow-sm sm:mt-7 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm sm:h-14 sm:w-14">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font900 sm:text-lg">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-600 sm:text-sm sm:leading-6">
            {text}
          </p>
          <button
            type="button"
            className="mt-3 text-xs font800 text-primary underline-offset-4 hover:underline"
            onClick={onDismiss}
          >
            {dismissLabel}
          </button>
        </div>
        <button
          type="button"
          className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-primary"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={onDismiss}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

