"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    | (ConfirmOptions & {
        resolve: (value: boolean) => void;
      })
    | null
  >(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ ...options, resolve });
      }),
    [],
  );

  function handleClose(value: boolean) {
    state?.resolve(value);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => handleClose(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {state.title && (
              <h2 className="text-lg font900">{state.title}</h2>
            )}
            <p className={cn("text-sm font800 text-slate-700", state.title && "mt-2")}>
              {state.message}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => handleClose(false)}>
                {state.cancelLabel ?? "Отмена"}
              </Button>
              <Button
                variant={state.variant === "danger" ? "danger" : "primary"}
                onClick={() => handleClose(true)}
              >
                {state.confirmLabel ?? "Да"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
