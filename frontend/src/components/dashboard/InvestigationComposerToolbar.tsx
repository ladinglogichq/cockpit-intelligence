import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import {
  COMPOSER_MODE_LABELS,
  type CitationsMode,
  type ComposerMode,
  type ResponseLength,
  useWorkspaceComposer,
} from "../../context/WorkspaceComposerContext";

function PaperclipIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a4.5 4.5 0 01-6.36-6.36l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.08-8.09"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx={6} cy={12} r={2} />
      <circle cx={18} cy={6} r={2} />
      <circle cx={14} cy={18} r={2} />
      <path d="M8 12h8M10 6h4M6 18h8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

type MenuSurface = {
  panel: string;
  item: string;
  separator: string;
  label: string;
};

function useComposerMenuSurface(effectiveDark: boolean): MenuSurface {
  if (effectiveDark) {
    return {
      panel: "min-w-[240px] rounded-xl border border-zinc-700/90 bg-zinc-900 p-1 shadow-xl text-zinc-100",
      item: "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-800 data-[state=open]:bg-zinc-800",
      separator: "my-1 h-px bg-zinc-700/80",
      label: "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500",
    };
  }
  return {
    panel: "min-w-[240px] rounded-xl border border-ink/10 bg-canvas p-1 shadow-xl text-ink shadow-lg",
    item: "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-ink/[0.06] data-[state=open]:bg-ink/[0.06]",
    separator: "my-1 h-px bg-ink/10",
    label: "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted",
  };
}

const LENGTH_OPTIONS: { value: ResponseLength; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "balanced", label: "Balanced" },
  { value: "detailed", label: "Detailed" },
];

const CITATION_OPTIONS: { value: CitationsMode; label: string }[] = [
  { value: "required", label: "Required" },
  { value: "when_relevant", label: "When relevant" },
  { value: "off", label: "Off" },
];

const MODE_OPTIONS: ComposerMode[] = ["investigation", "research_note", "compliance_review"];

export function InvestigationComposerToolbar() {
  const { effectiveDark } = useDashboardTheme();
  const surface = useComposerMenuSurface(effectiveDark);
  const checkClass = effectiveDark ? "text-sky-400" : "text-ink";

  const {
    query,
    composerMode,
    setComposerMode,
    responseLength,
    setResponseLength,
    citationsMode,
    setCitationsMode,
    attachments,
    addAttachmentsFromFiles,
    clearAttachments,
    investigateState,
  } = useWorkspaceComposer();

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 gap-2 border-t border-ink/[0.08] px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3 dark:border-zinc-700/80">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          multiple
          aria-label="Attach files"
          onChange={(e) => {
            const files = e.target.files;
            if (files?.length) addAttachmentsFromFiles(files);
            e.target.value = "";
          }}
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Add files or tools"
            >
              <PaperclipIcon />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={surface.panel} side="top" align="start" sideOffset={8} collisionPadding={12}>
              <DropdownMenu.Item className={surface.item} onSelect={() => fileInputRef.current?.click()}>
                <span>Upload files…</span>
              </DropdownMenu.Item>
              {attachments.length > 0 ? (
                <DropdownMenu.Item className={surface.item} onSelect={() => clearAttachments()}>
                  <span>Clear attachments ({attachments.length})</span>
                </DropdownMenu.Item>
              ) : null}
              <div className={surface.separator} />
              <DropdownMenu.Item asChild>
                <Link to="/explore-data" className={surface.item}>
                  Reference datasets
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/api-keys" className={surface.item}>
                  API keys
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-8 max-w-full shrink items-center gap-1 rounded-full border border-dashed border-ink/20 bg-transparent px-3 text-xs font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label={`Composer mode: ${COMPOSER_MODE_LABELS[composerMode]}`}
            >
              <span className="truncate">{COMPOSER_MODE_LABELS[composerMode]}</span>
              <ChevronDownIcon className="shrink-0 opacity-60" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={surface.panel} side="top" align="start" sideOffset={8} collisionPadding={12}>
              <p className={surface.label}>Mode</p>
              {MODE_OPTIONS.map((m) => (
                <DropdownMenu.Item key={m} className={surface.item} onSelect={() => setComposerMode(m)}>
                  <span>{COMPOSER_MODE_LABELS[m]}</span>
                  {composerMode === m ? <span className={`ml-auto ${checkClass}`}>✓</span> : null}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-center justify-end gap-2 sm:justify-self-end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Response options"
            >
              <SlidersIcon />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={`${surface.panel} max-h-[min(70vh,420px)] overflow-y-auto`}
              side="top"
              align="end"
              sideOffset={8}
              collisionPadding={12}
            >
              <p className={surface.label}>Answer length</p>
              {LENGTH_OPTIONS.map((opt) => (
                <DropdownMenu.Item key={opt.value} className={surface.item} onSelect={() => setResponseLength(opt.value)}>
                  <span>{opt.label}</span>
                  {responseLength === opt.value ? <span className={`ml-auto ${checkClass}`}>✓</span> : null}
                </DropdownMenu.Item>
              ))}
              <div className={surface.separator} />
              <p className={surface.label}>Citations</p>
              {CITATION_OPTIONS.map((opt) => (
                <DropdownMenu.Item key={opt.value} className={surface.item} onSelect={() => setCitationsMode(opt.value)}>
                  <span>{opt.label}</span>
                  {citationsMode === opt.value ? <span className={`ml-auto ${checkClass}`}>✓</span> : null}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          type="submit"
          disabled={!query.trim() || investigateState.status === "loading"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          aria-label={investigateState.status === "loading" ? "Running…" : "Send"}
        >
          {investigateState.status === "loading" ? (
            <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
    </div>
  );
}
