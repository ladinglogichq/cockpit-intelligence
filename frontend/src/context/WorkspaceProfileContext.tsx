import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../utils/supabase";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { isSafeAvatarDataUrl } from "../lib/avatarImage";

export const DEFAULT_WORKSPACE_PROFILE = {
  displayName: "Cockpit workspace",
  email: "cockpit@example.com",
  avatarDataUrl: null as string | null,
};

export type WorkspaceProfile = {
  displayName: string;
  email: string;
  avatarDataUrl: string | null;
};

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
  setProfile: (next: WorkspaceProfile) => Promise<void>;
  resetProfile: () => void;
};

const WorkspaceProfileContext = createContext<WorkspaceProfileContextValue | null>(null);

export function WorkspaceProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [profile, setProfileState] = useState<WorkspaceProfile>({ ...DEFAULT_WORKSPACE_PROFILE });

  // Load profile from Supabase when user is available
  useEffect(() => {
    if (!user) {
      setProfileState({ ...DEFAULT_WORKSPACE_PROFILE });
      return;
    }
    supabase
      .from("profiles")
      .select("display_name, email, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setProfileState({
          displayName: data.display_name || DEFAULT_WORKSPACE_PROFILE.displayName,
          email: data.email || user.email || DEFAULT_WORKSPACE_PROFILE.email,
          avatarDataUrl: isSafeAvatarDataUrl(data.avatar_url) ? data.avatar_url : null,
        });
      });
  }, [user]);

  const setProfile = useCallback(async (next: WorkspaceProfile) => {
    if (!user) return;
    const normalized: WorkspaceProfile = {
      displayName: next.displayName.trim() || DEFAULT_WORKSPACE_PROFILE.displayName,
      email: next.email.trim() || DEFAULT_WORKSPACE_PROFILE.email,
      avatarDataUrl: isSafeAvatarDataUrl(next.avatarDataUrl) ? next.avatarDataUrl : null,
    };
    setProfileState(normalized);
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: normalized.displayName,
      email: normalized.email,
      avatar_url: normalized.avatarDataUrl,
      updated_at: new Date().toISOString(),
    });
  }, [user]);

  const resetProfile = useCallback(() => {
    setProfileState({ ...DEFAULT_WORKSPACE_PROFILE });
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
