import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { imageFileToAvatarDataUrl } from "../../lib/avatarImage";
import {
  DEFAULT_WORKSPACE_PROFILE,
  initialsFromDisplayName,
  useWorkspaceProfile,
} from "../../context/WorkspaceProfileContext";
import { WorkspaceAvatar } from "./WorkspaceAvatar";

export type WorkspaceAccountPanel =
  | "personalization"
  | "usageCredits"
  | "connectors"
  | "allSettings"
  | "upgradePlan"
  | "installApps"
  | null;

type Props = {
  panel: WorkspaceAccountPanel;
  onPanelChange: (panel: WorkspaceAccountPanel) => void;
};

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-ink/15 bg-ink/[0.06] px-1.5 py-0.5 font-mono text-xs text-ink dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </kbd>
  );
}

function PersonalizationProfileForm({ effectiveDark }: { effectiveDark: boolean }) {
  const { displayName, email, avatarDataUrl, setProfile } = useWorkspaceProfile();
  const [draftName, setDraftName] = useState(displayName);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftAvatarDataUrl, setDraftAvatarDataUrl] = useState<string | null>(avatarDataUrl);
  const [savedFlash, setSavedFlash] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const muted = effectiveDark ? "text-zinc-400" : "text-ink-muted";
  const bodyText = effectiveDark ? "text-zinc-300" : "text-ink";
  const labelClass = `block text-xs font-medium ${muted}`;
  const inputClass = effectiveDark
    ? "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
    : "mt-1 w-full rounded-lg border border-ink/15 bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink/30 focus:outline-none focus:ring-1 focus:ring-ink/20";

  function onSave() {
    const next = {
      displayName: draftName.trim() || DEFAULT_WORKSPACE_PROFILE.displayName,
      email: draftEmail.trim() || DEFAULT_WORKSPACE_PROFILE.email,
      avatarDataUrl: draftAvatarDataUrl,
    };
    setProfile(next);
    setDraftName(next.displayName);
    setDraftEmail(next.email);
    setDraftAvatarDataUrl(next.avatarDataUrl);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  async function onAvatarFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError(null);
    try {
      const url = await imageFileToAvatarDataUrl(file);
      setDraftAvatarDataUrl(url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Could not load image.");
    }
  }

  const previewInitials = initialsFromDisplayName(
    draftName.trim() || DEFAULT_WORKSPACE_PROFILE.displayName
  );

  return (
    <div className="space-y-4">
      <p className={bodyText}>
        Set how you appear in the workspace sidebar. Other defaults (composer, dashboard chips) will connect when profile APIs
        ship.
      </p>

      <div className="space-y-2">
        <p className={`text-xs font-medium ${muted}`}>Profile photo</p>
        <div className="flex flex-wrap items-center gap-3">
          <WorkspaceAvatar
            avatarDataUrl={draftAvatarDataUrl}
            initials={previewInitials}
            size="md"
            effectiveDark={effectiveDark}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload profile photo"
              onChange={onAvatarFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                effectiveDark ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-ink/10 text-ink hover:bg-ink/15"
              }`}
            >
              Upload photo
            </button>
            {draftAvatarDataUrl ? (
              <button
                type="button"
                onClick={() => {
                  setDraftAvatarDataUrl(null);
                  setAvatarError(null);
                }}
                className={`text-sm font-medium underline-offset-2 hover:underline ${effectiveDark ? "text-zinc-400" : "text-ink-muted"}`}
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
        <p className={`text-xs ${muted}`}>
          {draftAvatarDataUrl
            ? "Photo is stored locally in this browser. Remove it to show initials from your display name again."
            : "Optional: upload a square image; we resize it for the sidebar. Without a photo, initials come from your display name."}
        </p>
        {avatarError ? (
          <p className={`text-xs ${effectiveDark ? "text-red-400" : "text-red-700"}`} role="alert">
            {avatarError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="cockpit-profile-display" className={labelClass}>
          Display name
        </label>
        <input
          id="cockpit-profile-display"
          name="displayName"
          type="text"
          autoComplete="name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cockpit-profile-email" className={labelClass}>
          Email
        </label>
        <input
          id="cockpit-profile-email"
          name="email"
          type="email"
          autoComplete="email"
          value={draftEmail}
          onChange={(e) => setDraftEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            effectiveDark ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "bg-ink text-canvas hover:bg-ink/90"
          }`}
        >
          Save profile
        </button>
        {savedFlash ? (
          <span className={`text-xs ${effectiveDark ? "text-emerald-400" : "text-emerald-700"}`} role="status">
            Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function WorkspaceAccountModals({ panel, onPanelChange }: Props) {
  const { effectiveDark } = useDashboardTheme();
  const open = panel !== null;

  const shell = effectiveDark
    ? "border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-xl"
    : "border border-ink/10 bg-canvas text-ink shadow-xl";

  const muted = effectiveDark ? "text-zinc-400" : "text-ink-muted";
  const border = effectiveDark ? "border-zinc-800" : "border-ink/10";
  const bodyText = effectiveDark ? "text-zinc-300" : "text-ink";

  const title =
    panel === "personalization"
      ? "Personalization"
      : panel === "usageCredits"
        ? "Usage and credits"
        : panel === "connectors"
          ? "Connectors"
          : panel === "allSettings"
            ? "All settings"
            : panel === "upgradePlan"
              ? "Upgrade plan"
              : panel === "installApps"
                ? "Install apps"
                : "";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onPanelChange(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-[201] max-h-[min(90vh,640px)] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-0 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${shell}`}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[min(90vh,640px)] overflow-y-auto px-5 pb-5 pt-4">
            <Dialog.Title className="font-display text-lg font-semibold tracking-tight">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {panel === "personalization" && "Workspace personalization and defaults."}
              {panel === "usageCredits" && "Usage and billing credits."}
              {panel === "connectors" && "Data connectors and sources."}
              {panel === "allSettings" && "Workspace settings."}
              {panel === "upgradePlan" && "Plans and upgrades."}
              {panel === "installApps" && "Install Cockpit apps."}
            </Dialog.Description>

            <div className={`mt-4 space-y-3 text-sm leading-relaxed ${muted}`}>
              {panel === "personalization" ? <PersonalizationProfileForm effectiveDark={effectiveDark} /> : null}

              {panel === "usageCredits" ? (
                <>
                  <p className={bodyText}>
                    Track API and agent credits consumed by investigations, connectors, and exports. Billing and invoices
                    connect when your organization enables a paid plan.
                  </p>
                  <div
                    className={`rounded-xl border px-3 py-3 ${effectiveDark ? "border-zinc-700 bg-zinc-950/80" : "border-ink/10 bg-ink/[0.03]"}`}
                  >
                    <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Preview</p>
                    <p className={`mt-2 text-2xl font-semibold tabular-nums ${bodyText}`}>— credits</p>
                    <p className={`mt-1 text-xs ${muted}`}>Usage reporting is not connected in this build.</p>
                  </div>
                  <Link
                    to="/pricing"
                    className={`inline-flex w-fit rounded-lg px-3 py-2 text-sm font-medium ${
                      effectiveDark ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "bg-ink text-canvas hover:bg-ink/90"
                    }`}
                    onClick={() => onPanelChange(null)}
                  >
                    View plans and pricing
                  </Link>
                </>
              ) : null}

              {panel === "connectors" ? (
                <>
                  <p className={bodyText}>
                    Connectors link Cockpit to datasets, RPC endpoints, and third-party tools. In the composer, <span className="font-medium">@</span>{" "}
                    will surface enabled sources for grounding and evidence.
                  </p>
                  <p className={bodyText}>
                    Reference dataset catalog and connector status will appear here; explore the public catalog on the marketing
                    site.
                  </p>
                  <Link
                    to="/explore-data"
                    className={`text-sm font-medium underline-offset-2 hover:underline ${effectiveDark ? "text-sky-400" : "text-ink"}`}
                    onClick={() => onPanelChange(null)}
                  >
                    Explore reference datasets
                  </Link>
                </>
              ) : null}

              {panel === "allSettings" ? (
                <>
                  <p className={bodyText}>
                    Workspace-wide settings: notifications, security, data retention, and integrations. This dialog is a stub
                    until the full settings surface ships.
                  </p>
                  <p className={`flex flex-wrap items-center gap-1 ${bodyText}`}>
                    Shortcut hint: <Kbd>⇧</Kbd>
                    <Kbd>⌘</Kbd>
                    <Kbd>,</Kbd>
                    <span className={muted}>(opens here when the command palette is wired)</span>
                  </p>
                  <Link
                    to="/platform"
                    className={`inline-flex w-fit rounded-lg px-3 py-2 text-sm font-medium ${
                      effectiveDark ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "bg-ink text-canvas hover:bg-ink/90"
                    }`}
                    onClick={() => onPanelChange(null)}
                  >
                    Platform overview
                  </Link>
                </>
              ) : null}

              {panel === "upgradePlan" ? (
                <>
                  <p className={bodyText}>
                    Move from preview to a plan that fits your team: higher credit limits, SSO, audit exports, and priority
                    support. Compare tiers on the pricing page.
                  </p>
                  <Link
                    to="/pricing"
                    className={`inline-flex w-fit rounded-lg px-3 py-2 text-sm font-medium ${
                      effectiveDark ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "bg-ink text-canvas hover:bg-ink/90"
                    }`}
                    onClick={() => onPanelChange(null)}
                  >
                    Compare plans
                  </Link>
                </>
              ) : null}

              {panel === "installApps" ? (
                <>
                  <p className={bodyText}>
                    Desktop and mobile apps for Cockpit are on the roadmap. You will be able to install from here with
                    auto-updates and the same workspace sign-in.
                  </p>
                  <p className={bodyText}>For now, use Cockpit in the browser; we will announce betas in the changelog.</p>
                  <Link
                    to="/blog"
                    className={`text-sm font-medium underline-offset-2 hover:underline ${effectiveDark ? "text-sky-400" : "text-ink"}`}
                    onClick={() => onPanelChange(null)}
                  >
                    Blog and updates
                  </Link>
                </>
              ) : null}
            </div>

            <div className={`mt-6 flex justify-end border-t pt-4 ${border}`}>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    effectiveDark ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-ink/10 text-ink hover:bg-ink/15"
                  }`}
                >
                  Close
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
