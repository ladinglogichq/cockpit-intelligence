import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "cockpit_dashboard_appearance";

export type DashboardAppearance = "light" | "dark" | "system";

type DashboardThemeValue = {
  appearance: DashboardAppearance;
  setAppearance: (v: DashboardAppearance) => void;
  /** Resolved dark mode (includes system preference). */
  effectiveDark: boolean;
  /** Sub-label for Appearance row, e.g. "System (Dark)". */
  appearanceDescription: string;
};

const DashboardThemeContext = createContext<DashboardThemeValue | null>(null);

function readStoredAppearance(): DashboardAppearance {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<DashboardAppearance>(readStoredAppearance);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setAppearance = useCallback((v: DashboardAppearance) => {
    setAppearanceState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const effectiveDark = appearance === "dark" || (appearance === "system" && systemDark);

  /**
   * Tailwind `darkMode: "class"` + Radix portals (dialogs/menus render under `document.body`).
   * Drive `dark` from `<html>` so all descendants and portaled UI match Light / Dark / System.
   */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveDark);
    root.style.colorScheme = effectiveDark ? "dark" : "light";
  }, [effectiveDark]);

  useLayoutEffect(() => {
    return () => {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.style.removeProperty("color-scheme");
    };
  }, []);

  const appearanceDescription = useMemo(() => {
    if (appearance === "light") return "Light";
    if (appearance === "dark") return "Dark";
    return systemDark ? "System (Dark)" : "System (Light)";
  }, [appearance, systemDark]);

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      effectiveDark,
      appearanceDescription,
    }),
    [appearance, setAppearance, effectiveDark, appearanceDescription]
  );

  return <DashboardThemeContext.Provider value={value}>{children}</DashboardThemeContext.Provider>;
}

export function useDashboardTheme() {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  return ctx;
}
