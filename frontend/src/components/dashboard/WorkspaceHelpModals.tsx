import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export type WorkspaceHelpPanel = "getStarted" | "helpCenter" | "changelog" | "shortcuts" | null;

type Props = {
  panel: WorkspaceHelpPanel;
  onPanelChange: (panel: WorkspaceHelpPanel) => void;
};

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-ink/15 bg-ink/[0.06] px-1.5 py-0.5 font-mono text-xs text-ink dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </kbd>
  );
}

export function WorkspaceHelpModals({ panel, onPanelChange }: Props) {
  const { effectiveDark } = useDashboardTheme();
  const open = panel !== null;

  const shell =
    effectiveDark
      ? "border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-xl"
      : "border border-ink/10 bg-canvas text-ink shadow-xl";

  const muted = effectiveDark ? "text-zinc-400" : "text-ink-muted";
  const border = effectiveDark ? "border-zinc-800" : "border-ink/10";

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
          <div className={`max-h-[min(90vh,640px)] overflow-y-auto px-5 pb-5 pt-4`}>
            <Dialog.Title className="font-display text-lg font-semibold tracking-tight">
              {panel === "getStarted" && "Get started"}
              {panel === "helpCenter" && "Help center"}
              {panel === "changelog" && "Changelog"}
              {panel === "shortcuts" && "Keyboard shortcuts"}
            </Dialog.Title>
            <Dialog.Description className={`sr-only`}>
              {panel === "getStarted" && "Quick steps to use the Cockpit workspace."}
              {panel === "helpCenter" && "Where to find documentation and support."}
              {panel === "changelog" && "Recent product changes."}
              {panel === "shortcuts" && "Keyboard shortcuts for the workspace."}
            </Dialog.Description>

            <div className={`mt-4 space-y-3 text-sm leading-relaxed ${muted}`}>
              {panel === "getStarted" ? (
                <>
                  <p className={effectiveDark ? "text-zinc-300" : "text-ink"}>
                    Use the workspace composer to ask questions in natural language. Suggestion chips on the dashboard seed
                    common investigation prompts.
                  </p>
                  <ul className={`list-inside list-disc space-y-2 ${effectiveDark ? "text-zinc-300" : "text-ink"}`}>
                    <li>Pick a mode (e.g. Investigation) when flows are wired.</li>
                    <li>Open <strong className="font-medium">Alerts</strong>, <strong className="font-medium">Cases</strong>, or{" "}
                      <strong className="font-medium">Entities</strong> from the sidebar for operational views.</li>
                    <li>Connectors and agents will appear here as they ship.</li>
                  </ul>
                </>
              ) : null}

              {panel === "helpCenter" ? (
                <>
                  <p className={effectiveDark ? "text-zinc-300" : "text-ink"}>
                    Documentation and platform overview live on the marketing site. Dataset and methodology pages describe how
                    Cockpit reasons about risk and evidence.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/platform"
                      className={`inline-flex w-fit rounded-lg px-3 py-2 text-sm font-medium ${
                        effectiveDark
                          ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                          : "bg-ink text-canvas hover:bg-ink/90"
                      }`}
                      onClick={() => onPanelChange(null)}
                    >
                      Platform overview
                    </Link>
                    <Link
                      to="/explore-data"
                      className={`text-sm font-medium underline-offset-2 hover:underline ${effectiveDark ? "text-sky-400" : "text-ink"}`}
                      onClick={() => onPanelChange(null)}
                    >
                      Explore reference datasets
                    </Link>
                    <Link
                      to="/methodology/risk-exposure"
                      className={`text-sm font-medium underline-offset-2 hover:underline ${effectiveDark ? "text-sky-400" : "text-ink"}`}
                      onClick={() => onPanelChange(null)}
                    >
                      Risk exposure methodology
                    </Link>
                  </div>
                </>
              ) : null}

              {panel === "changelog" ? (
                <ul className={`space-y-4 border-t pt-4 ${border}`}>
                  <li>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Unreleased</p>
                    <p className={`mt-1 ${effectiveDark ? "text-zinc-300" : "text-ink"}`}>
                      Workspace shell with sidebar, account menu, and composer placeholder. Mock content until APIs connect.
                    </p>
                  </li>
                  <li>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>0.1.0</p>
                    <p className={`mt-1 ${effectiveDark ? "text-zinc-300" : "text-ink"}`}>
                      Initial marketing site, blog, pricing, and product route scaffolding.
                    </p>
                  </li>
                </ul>
              ) : null}

              {panel === "shortcuts" ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className={`border-b ${border}`}>
                        <th className={`pb-2 pr-4 font-medium ${effectiveDark ? "text-zinc-200" : "text-ink"}`}>Shortcut</th>
                        <th className={`pb-2 font-medium ${effectiveDark ? "text-zinc-200" : "text-ink"}`}>Action</th>
                      </tr>
                    </thead>
                    <tbody className={`${effectiveDark ? "text-zinc-300" : "text-ink"}`}>
                      <tr className={`border-b ${effectiveDark ? "border-zinc-800/80" : "border-ink/10"}`}>
                        <td className="py-2 pr-4">
                          <span className="inline-flex flex-wrap items-center gap-1">
                            <Kbd>⌘</Kbd>
                            <span className={effectiveDark ? "text-zinc-500" : "text-ink-muted"}>/</span>
                            <span className={`${effectiveDark ? "text-zinc-500" : "text-ink-muted"}`}>or</span>
                            <Kbd>Ctrl</Kbd>
                            <span className={effectiveDark ? "text-zinc-500" : "text-ink-muted"}>/</span>
                          </span>
                          <span className="sr-only">Command or Control slash</span>
                        </td>
                        <td className="py-2">Open this shortcuts panel</td>
                      </tr>
                      <tr className={`border-b ${effectiveDark ? "border-zinc-800/80" : "border-ink/10"}`}>
                        <td className="py-2 pr-4">
                          <Kbd>Esc</Kbd>
                        </td>
                        <td className="py-2">Close dialogs and menus (when focused)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className={`mt-3 text-xs ${muted}`}>
                    More shortcuts will appear as the composer and command palette gain features.
                  </p>
                </div>
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
