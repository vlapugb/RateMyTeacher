"use client";

import { createContext, useContext } from "react";

export type AuthDialogMode = "signin" | "signup" | "reset";

type AuthDialogContextValue = {
  openAuthDialog: (mode?: AuthDialogMode) => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthDialogContextValue;
}) {
  return (
    <AuthDialogContext.Provider value={value}>
      {children}
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);

  if (!context) {
    throw new Error("useAuthDialog must be used inside AuthDialogProvider");
  }

  return context;
}
