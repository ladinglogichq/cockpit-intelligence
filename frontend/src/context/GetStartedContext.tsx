import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ENGAGED_KEY = "cockpit_get_started_engaged";

function readEngagedFromStorage(): boolean {
  try {
    return sessionStorage.getItem(ENGAGED_KEY) === "1";
  } catch {
    return false;
  }
}

type GetStartedContextValue = {
  /** True after the user clicks any Get started control (session; persisted in sessionStorage). */
  hasPressedGetStarted: boolean;
  markGetStartedPressed: () => void;
  /** Clears workspace engagement (e.g. sign out from dashboard shell). */
  clearWorkspaceSession: () => void;
};

const GetStartedContext = createContext<GetStartedContextValue | null>(null);

export function GetStartedProvider({ children }: { children: ReactNode }) {
  const [hasPressedGetStarted, setHasPressedGetStarted] = useState(false);

  useEffect(() => {
    if (readEngagedFromStorage()) setHasPressedGetStarted(true);
  }, []);

  const markGetStartedPressed = useCallback(() => {
    setHasPressedGetStarted(true);
    try {
      sessionStorage.setItem(ENGAGED_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const clearWorkspaceSession = useCallback(() => {
    setHasPressedGetStarted(false);
    try {
      sessionStorage.removeItem(ENGAGED_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ hasPressedGetStarted, markGetStartedPressed, clearWorkspaceSession }),
    [hasPressedGetStarted, markGetStartedPressed, clearWorkspaceSession]
  );

  return (
    <GetStartedContext.Provider value={value}>
      {children}
    </GetStartedContext.Provider>
  );
}

export function useGetStarted() {
  const ctx = useContext(GetStartedContext);
  if (!ctx) throw new Error("useGetStarted must be used within GetStartedProvider");
  return ctx;
}
