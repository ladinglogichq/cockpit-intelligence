import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetStarted } from "../../context/GetStartedContext";
import { useDashboardTheme, type DashboardAppearance } from "../../context/DashboardThemeContext";
import { initialsFromDisplayName, useWorkspaceProfile } from "../../context/WorkspaceProfileContext";
import { WorkspaceAccountModals, type WorkspaceAccountPanel } from "./WorkspaceAccountModals";
import { WorkspaceAvatar } from "./WorkspaceAvatar";
import { WorkspaceHelpModals, type WorkspaceHelpPanel } from "./WorkspaceHelpModals";

const LANGUAGES: { id: string; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "en-US", label: "American English" },
  { id: "en-GB", label: "British English" },
  { id: "id", label: "Indonesian (Bahasa Indonesia)" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
];

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MenuSurface = {
  panel: string;
  item: string;
  itemHover: string;
  separator: string;
  subLabel: string;
  shortcut: string;
};

function useMenuSurface(effectiveDark: boolean): MenuSurface {
  if (effectiveDark) {
    return {
      panel: "min-w-[220px] rounded-xl border border-zinc-700/90 bg-zinc-900 p-1 shadow-xl text-zinc-100",
      item: "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-800 data-[state=open]:bg-zinc-800",
      itemHover: "",
      separator: "my-1 h-px bg-zinc-700/80",
      subLabel: "ml-auto text-xs text-zinc-500",
      shortcut: "ml-auto text-xs text-zinc-500",
    };
  }
  return {
    panel: "min-w-[220px] rounded-xl border border-ink/10 bg-canvas p-1 shadow-xl text-ink",
    item: "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-ink/[0.06] data-[state=open]:bg-ink/[0.06]",
    itemHover: "",
    separator: "my-1 h-px bg-ink/10",
    subLabel: "ml-auto text-xs text-ink-muted",
    shortcut: "ml-auto text-xs text-ink-muted",
  };
}

export function DashboardSidebarFooter() {
  const navigate = useNavigate();
  const { clearWorkspaceSession } = useGetStarted();
  const { displayName, email, avatarDataUrl, resetProfile } = useWorkspaceProfile();
  const { appearance, setAppearance, effectiveDark, appearanceDescription } = useDashboardTheme();
  const surface = useMenuSurface(effectiveDark);
  const [helpPanel, setHelpPanel] = useState<WorkspaceHelpPanel>(null);
  const [accountPanel, setAccountPanel] = useState<WorkspaceAccountPanel>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isSlash = e.key === "/" || e.code === "Slash";
      if (!isSlash || !(e.metaKey || e.ctrlKey)) return;
      const t = e.target;
      if (t instanceof HTMLElement && t.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      setHelpPanel("shortcuts");
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSignOut() {
    clearWorkspaceSession();
    resetProfile();
    navigate("/");
  }

  const avatarInitials = initialsFromDisplayName(displayName);

  const checkClass = effectiveDark ? "text-sky-400" : "text-ink";

  return (
    <>
      <WorkspaceHelpModals panel={helpPanel} onPanelChange={setHelpPanel} />
      <WorkspaceAccountModals panel={accountPanel} onPanelChange={setAccountPanel} />
    <div className="shrink-0 border-t border-ink/10 px-2 pb-3 pt-2 dark:border-zinc-800">
      <div className="flex items-stretch gap-0.5">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-2 text-left transition-colors ${
                effectiveDark ? "hover:bg-zinc-800/80" : "hover:bg-ink/[0.04]"
              }`}
              aria-label={`Workspace menu for ${displayName}`}
            >
              <span className="relative shrink-0">
                <WorkspaceAvatar
                  avatarDataUrl={avatarDataUrl}
                  initials={avatarInitials}
                  size="sm"
                  effectiveDark={effectiveDark}
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 rounded px-0.5 text-[9px] font-semibold leading-none ${
                    effectiveDark ? "bg-emerald-600 text-white" : "bg-ink text-canvas"
                  }`}
                >
                  Pro
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${effectiveDark ? "text-zinc-100" : "text-ink"}`}>
                  {displayName}
                </span>
              </span>
              <ChevronRightIcon className="ml-0.5 shrink-0 -rotate-90 opacity-50 dark:text-zinc-500" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={surface.panel}
              side="top"
              align="start"
              sideOffset={8}
              collisionPadding={12}
            >
              <div className={`border-b px-2 py-2 ${effectiveDark ? "border-zinc-800" : "border-ink/10"}`}>
                <p className={`text-sm font-medium ${effectiveDark ? "text-zinc-100" : "text-ink"}`}>Workspace</p>
                <p className={`truncate text-xs ${effectiveDark ? "text-zinc-500" : "text-ink-muted"}`}>{email}</p>
              </div>

              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("personalization")}>
                <span>Personalization</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={surface.item} onSelect={() => navigate("/dashboard")}>
                <span>Shortcuts</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("usageCredits")}>
                <span>Usage and credits</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("connectors")}>
                <span>Connectors</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("allSettings")}>
                <span>All settings</span>
                <span className={surface.shortcut}>⇧⌘,</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className={surface.separator} />

              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("upgradePlan")}>
                <span>Upgrade plan</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={surface.item} onSelect={() => setAccountPanel("installApps")}>
                <span>Install apps</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className={surface.separator} />

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={`${surface.item} w-full`}>
                  <span>Appearance</span>
                  <span className={surface.subLabel}>{appearanceDescription}</span>
                  <ChevronRightIcon className="ml-1 shrink-0 opacity-60" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className={surface.panel} sideOffset={6} alignOffset={-4}>
                  {(
                    [
                      ["light", "Light"] as const,
                      ["dark", "Dark"] as const,
                      ["system", "System"] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <DropdownMenu.Item
                      key={key}
                      className={surface.item}
                      onSelect={() => setAppearance(key as DashboardAppearance)}
                    >
                      <span>{label}</span>
                      {appearance === key ? <span className={`ml-auto ${checkClass}`}>✓</span> : null}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={`${surface.item} w-full`}>
                  <span>Language</span>
                  <span className={surface.subLabel}>Default</span>
                  <ChevronRightIcon className="ml-1 shrink-0 opacity-60" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent
                  className={`${surface.panel} max-h-[min(320px,60vh)] overflow-y-auto`}
                  sideOffset={6}
                  alignOffset={-4}
                >
                  {LANGUAGES.map((lang) => (
                    <DropdownMenu.Item key={lang.id} className={surface.item} onSelect={() => {}}>
                      <span>{lang.label}</span>
                      {lang.id === "default" ? <span className={`ml-auto ${checkClass}`}>✓</span> : null}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={`${surface.item} w-full`}>
                  <span>Help</span>
                  <ChevronRightIcon className="ml-auto shrink-0 opacity-60" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className={surface.panel} sideOffset={6} alignOffset={-4}>
                  <DropdownMenu.Item className={surface.item} onSelect={() => setHelpPanel("getStarted")}>
                    <span>Get started</span>
                    <ExternalLinkIcon className="ml-auto opacity-50" aria-hidden />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={surface.item} onSelect={() => setHelpPanel("helpCenter")}>
                    <span>Help center</span>
                    <ExternalLinkIcon className="ml-auto opacity-50" aria-hidden />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={surface.item} onSelect={() => setHelpPanel("changelog")}>
                    <span>Changelog</span>
                    <ExternalLinkIcon className="ml-auto opacity-50" aria-hidden />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={surface.item} onSelect={() => navigate("/blog")}>
                    <span>Blog</span>
                    <ExternalLinkIcon className="ml-auto opacity-50" aria-hidden />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={surface.item} onSelect={() => setHelpPanel("shortcuts")}>
                    <span>Keyboard shortcuts</span>
                    <span className={surface.shortcut}>⌘/</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={surface.item}
                    onSelect={() => window.open("mailto:support@example.com", "_blank")}
                  >
                    <span>Contact support</span>
                  </DropdownMenu.Item>
                  <div className={`mt-1 border-t px-2 py-1.5 ${effectiveDark ? "border-zinc-800" : "border-ink/10"}`}>
                    <a
                      href="https://example.com/careers"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1 text-xs ${effectiveDark ? "text-zinc-500 hover:text-zinc-300" : "text-ink-muted hover:text-ink"}`}
                    >
                      Careers
                      <ExternalLinkIcon />
                    </a>
                  </div>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>

              <DropdownMenu.Separator className={surface.separator} />

              <DropdownMenu.Item className={surface.item} onSelect={onSignOut}>
                <span>Sign out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label="Notifications"
            className={`relative flex h-10 w-9 items-center justify-center rounded-full transition-colors ${
              effectiveDark ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <BellIcon />
            <span className="absolute right-1.5 top-2 h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden />
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
          effectiveDark ? "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200" : "text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
        }`}
      >
        <UserPlusIcon />
        <span>Add your team</span>
      </button>
    </div>
    </>
  );
}
