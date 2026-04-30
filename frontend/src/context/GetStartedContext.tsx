import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSupabaseAuth } from "./SupabaseAuthContext";

type GetStartedContextValue = {
  hasPressedGetStarted: boolean;
  markGetStartedPressed: () => void;
  clearWorkspaceSession: () => void;
};

const GetStartedContext = createContext<GetStartedContextValue | null>(null);

export function GetStartedProvider({ children }: { children: ReactNode }) {
  const { session } = useSupabaseAuth();

  const value = useMemo(
    () => ({
      hasPressedGetStarted: !!session,
      markGetStartedPressed: () => {},
      clearWorkspaceSession: () => {},
    }),
    [session]
  );

  return <GetStartedContext.Provider value={value}>{children}</GetStartedContext.Provider>;
}

export function useGetStarted() {
  const ctx = useContext(GetStartedContext);
  if (!ctx) throw new Error("useGetStarted must be used within GetStartedProvider");
  return ctx;
}
