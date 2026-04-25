import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSafeAvatarDataUrl } from "../lib/avatarImage";

const STORAGE_KEY = "cockpit_workspace_profile_v1";

export const DEFAULT_WORKSPACE_PROFILE = {
  displayName: "Cockpit workspace",
  email: "cockpit@example.com",
  avatarDataUrl: null as string | null,
};

export type WorkspaceProfile = {
  displayName: string;
  email: string;
  /** JPEG data URL from local upload, or null to show initials. */
  avatarDataUrl: string | null;
};

function loadProfile(): WorkspaceProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_WORKSPACE_PROFILE };
    const parsed = JSON.parse(raw) as Partial<WorkspaceProfile>;
    const avatarDataUrl = isSafeAvatarDataUrl(parsed.avatarDataUrl) ? parsed.avatarDataUrl : null;
    return {
      displayName:
        typeof parsed.displayName === "string" && parsed.displayName.trim()
          ? parsed.displayName.trim()
          : DEFAULT_WORKSPACE_PROFILE.displayName,
      email:
        typeof parsed.email === "string" && parsed.email.trim()
          ? parsed.email.trim()
          : DEFAULT_WORKSPACE_PROFILE.email,
      avatarDataUrl,
    };
  } catch {
    return { ...DEFAULT_WORKSPACE_PROFILE };
  }
}

function persistProfile(p: WorkspaceProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Two-letter initials from a display name for the workspace avatar. */
export function initialsFromDisplayName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type WorkspaceProfileContextValue = {
  displayName: string;
  email: string;
  avatarDataUrl: string | null;
  setProfile: (next: WorkspaceProfile) => void;
  resetProfile: () => void;
};

const WorkspaceProfileContext = createContext<WorkspaceProfileContextValue | null>(null);

export function WorkspaceProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<WorkspaceProfile>(() => loadProfile());

  const setProfile = useCallback((next: WorkspaceProfile) => {
    const normalized: WorkspaceProfile = {
      displayName: next.displayName.trim() || DEFAULT_WORKSPACE_PROFILE.displayName,
      email: next.email.trim() || DEFAULT_WORKSPACE_PROFILE.email,
      avatarDataUrl: isSafeAvatarDataUrl(next.avatarDataUrl) ? next.avatarDataUrl : null,
    };
    setProfileState(normalized);
    persistProfile(normalized);
  }, []);

  const resetProfile = useCallback(() => {
    const defaults: WorkspaceProfile = {
      displayName: DEFAULT_WORKSPACE_PROFILE.displayName,
      email: DEFAULT_WORKSPACE_PROFILE.email,
      avatarDataUrl: DEFAULT_WORKSPACE_PROFILE.avatarDataUrl,
    };
    setProfileState(defaults);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      displayName: profile.displayName,
      email: profile.email,
      avatarDataUrl: profile.avatarDataUrl,
      setProfile,
      resetProfile,
    }),
    [profile.displayName, profile.email, profile.avatarDataUrl, setProfile, resetProfile]
  );

  return (
    <WorkspaceProfileContext.Provider value={value}>{children}</WorkspaceProfileContext.Provider>
  );
}

export function useWorkspaceProfile() {
  const ctx = useContext(WorkspaceProfileContext);
  if (!ctx) throw new Error("useWorkspaceProfile must be used within WorkspaceProfileProvider");
  return ctx;
}
