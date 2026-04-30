import type { ReactNode } from "react";
import { SupabaseAuthProvider } from "../context/SupabaseAuthContext";
import { GetStartedProvider } from "../context/GetStartedContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <GetStartedProvider>{children}</GetStartedProvider>
    </SupabaseAuthProvider>
  );
}
