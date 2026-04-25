import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type ComposerMode = "investigation" | "research_note" | "compliance_review";

export type ResponseLength = "concise" | "balanced" | "detailed";

export type CitationsMode = "required" | "when_relevant" | "off";

export type ComposerAttachment = {
  id: string;
  name: string;
  size: number;
};

export const COMPOSER_MODE_LABELS: Record<ComposerMode, string> = {
  investigation: "Investigation",
  research_note: "Research note",
  compliance_review: "Compliance review",
};

type WorkspaceComposerContextValue = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  composerMode: ComposerMode;
  setComposerMode: Dispatch<SetStateAction<ComposerMode>>;
  responseLength: ResponseLength;
  setResponseLength: Dispatch<SetStateAction<ResponseLength>>;
  citationsMode: CitationsMode;
  setCitationsMode: Dispatch<SetStateAction<CitationsMode>>;
  attachments: ComposerAttachment[];
  addAttachmentsFromFiles: (files: FileList | File[]) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
};

const WorkspaceComposerContext = createContext<WorkspaceComposerContextValue | null>(null);

function makeAttachmentId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function WorkspaceComposerProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("investigation");
  const [responseLength, setResponseLength] = useState<ResponseLength>("balanced");
  const [citationsMode, setCitationsMode] = useState<CitationsMode>("when_relevant");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);

  const addAttachmentsFromFiles = useCallback((files: FileList | File[]) => {
    const list = Array.isArray(files) ? files : Array.from(files);
    if (list.length === 0) return;
    setAttachments((prev) => [
      ...prev,
      ...list.map((f) => ({
        id: makeAttachmentId(),
        name: f.name,
        size: f.size,
      })),
    ]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      composerMode,
      setComposerMode,
      responseLength,
      setResponseLength,
      citationsMode,
      setCitationsMode,
      attachments,
      addAttachmentsFromFiles,
      removeAttachment,
      clearAttachments,
    }),
    [
      query,
      composerMode,
      responseLength,
      citationsMode,
      attachments,
      addAttachmentsFromFiles,
      removeAttachment,
      clearAttachments,
    ]
  );

  return (
    <WorkspaceComposerContext.Provider value={value}>{children}</WorkspaceComposerContext.Provider>
  );
}

export function useWorkspaceComposer() {
  const ctx = useContext(WorkspaceComposerContext);
  if (!ctx) throw new Error("useWorkspaceComposer must be used within WorkspaceComposerProvider");
  return ctx;
}
