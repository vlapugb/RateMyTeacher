import { Suspense } from "react";
import { ResetPasswordPanel } from "@/components/reset-password-panel";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 pb-8 md:px-8">
          <section className="pt-8">
            <p className="text-sm font800 text-muted">...</p>
          </section>
        </div>
      }
    >
      <ResetPasswordPanel />
    </Suspense>
  );
}
