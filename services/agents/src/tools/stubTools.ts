import { tool } from "langchain";
import { z } from "zod";

/** Returns a small JSON string for wiring checks — no external services. */
export const workspaceHealth = tool(
  async () =>
    JSON.stringify({
      ok: true,
      service: "cockpit-agents",
      tools: [
        "web_search",
        "document_fetch",
        "ocr_extract",
        "clause_extractor",
        "pillar_mapper",
        "citation_verifier",
        "workspace_health",
      ],
    }),
  {
    name: "workspace_health",
    description:
      "Return runtime health for the Cockpit agent workspace (stub; use to verify tool routing without calling external APIs).",
    schema: z.object({}),
  }
);

/** Search the web for official legal documents, regulatory sources, and gazettes. */
export const webSearch = tool(
  async ({ query, jurisdiction, limit }: { query: string; jurisdiction?: string; limit?: number }) => {
    const cap = Math.min(Math.max(limit ?? 10, 1), 50);
    const scope = jurisdiction ? ` [jurisdiction: ${jurisdiction}]` : "";
    return `[stub] Web search for legal documents: "${query}"${scope} (limit: ${cap}) — wire Tavily or equivalent search provider.`;
  },
  {
    name: "web_search",
    description:
      "Search the web for official legal documents, regulatory sources, and gazettes. Combines keyword and semantic search to find documents even when the exact legal name is unknown. Supports jurisdiction scoping.",
    schema: z.object({
      query: z.string().min(2).describe("Search query for legal documents (e.g. 'data protection act', 'personal data cross-border transfer regulation')."),
      jurisdiction: z.string().optional().describe("ISO 3166-1 alpha-2 country code to scope search (e.g. 'SG', 'KE', 'NG')."),
      limit: z.number().int().min(1).max(50).optional().describe("Max results to return (default 10)."),
    }),
  }
);

/** Fetch and retrieve a legal document from a URL (PDF, HTML, or image). */
export const documentFetch = tool(
  async ({ url, documentType }: { url: string; documentType?: string }) => {
    const dtype = documentType ?? "unknown";
    return `[stub] Would fetch legal document from ${url} (type: ${dtype}) — wire PDF/HTML retrieval with metadata extraction.`;
  },
  {
    name: "document_fetch",
    description:
      "Fetch a legal document from a URL. Supports PDF, HTML, and image-based documents. Returns raw content, metadata (page count, language, publication date), and a storage reference.",
    schema: z.object({
      url: z.string().url().describe("URL of the legal document to fetch."),
      documentType: z
        .enum(["act", "regulation", "decree", "directive", "guideline", "amendment", "treaty", "circular"])
        .optional()
        .describe("Expected document type for classification."),
    }),
  }
);

/** Apply OCR to a scanned or image-based document and return structured text. */
export const ocrExtract = tool(
  async ({ documentId, pages }: { documentId: string; pages?: string }) => {
    const pageScope = pages ?? "all";
    return `[stub] OCR extraction for document ${documentId} (pages: ${pageScope}) — wire Tesseract, PaddleOCR, or cloud OCR provider.`;
  },
  {
    name: "ocr_extract",
    description:
      "Apply OCR to a scanned or image-based legal document. Extracts text while preserving headings, article numbering, footnotes, and page references. Supports multiple OCR backends (Tesseract, PaddleOCR, cloud fallback).",
    schema: z.object({
      documentId: z.string().min(1).describe("ID of the document in storage to OCR."),
      pages: z.string().optional().describe("Page range to OCR (e.g. '1-5', '3,7,12'). Defaults to all pages."),
    }),
  }
);

/** Extract relevant legal clauses from parsed document text. */
export const clauseExtractor = tool(
  async ({ text, jurisdiction, targetPillars }: { text: string; jurisdiction?: string; targetPillars?: string[] }) => {
    const pillars = targetPillars?.join(", ") ?? "pillar_6, pillar_7";
    const jur = jurisdiction ?? "unspecified";
    return `[stub] Clause extraction from ${text.length} chars of legal text (jurisdiction: ${jur}, pillars: ${pillars}) — wire LLM-based clause detection and segmentation.`;
  },
  {
    name: "clause_extractor",
    description:
      "Extract clauses relevant to RDTII Pillar 6 (Cross-Border Data Policies) and Pillar 7 (Domestic Data Protection & Privacy) from parsed legal text. Returns structured clauses with article references, original excerpts, and clause type classification.",
    schema: z.object({
      text: z.string().describe("Parsed legal text to extract clauses from."),
      jurisdiction: z.string().optional().describe("ISO 3166-1 alpha-2 country code for context."),
      targetPillars: z
        .array(z.enum(["pillar_6", "pillar_7"]))
        .optional()
        .describe("Which RDTII pillars to target (default: both)."),
    }),
  }
);

/** Map an extracted clause to an RDTII pillar with rationale and confidence. */
export const pillarMapper = tool(
  async ({ clauseExcerpt, clauseType, articleReference }: { clauseExcerpt: string; clauseType?: string; articleReference?: string }) => {
    const ctype = clauseType ?? "unknown";
    const aref = articleReference ?? "unspecified";
    return JSON.stringify({
      pillar: "pillar_6",
      subIndicator: "6.1",
      mappingRationale: "Imposes restrictions on cross-border personal data transfers, requiring compliance with prescribed safeguards before data leaves the jurisdiction.",
      confidence: 0.94,
      status: "auto_mapped",
      flags: [],
    });
  },
  {
    name: "pillar_mapper",
    description:
      "Map a legal clause to RDTII Pillar 6 or Pillar 7 with a rationale and confidence score. Determines whether the clause imposes data transfer restrictions (P6) or governs data protection/privacy (P7). Assigns sub-indicator labels and flags low-confidence mappings for human review. Returns a JSON object with pillar, subIndicator, mappingRationale, confidence (0-1), status (auto_mapped/verified/disputed/rejected), and optional flags.",
    schema: z.object({
      clauseExcerpt: z.string().describe("Verbatim text of the extracted clause."),
      clauseType: z
        .enum(["rule", "obligation", "prohibition", "exception", "definition", "scope", "penalty"])
        .optional()
        .describe("Classification of the clause type."),
      articleReference: z.string().optional().describe("Article/section reference (e.g. 'Section 26', 'Art. 45(1)')."),
    }),
  }
);

/** Verify a clause-to-pillar mapping by checking citation accuracy against source. */
export const citationVerifier = tool(
  async ({ clauseId, sourceUrl, originalExcerpt }: { clauseId: string; sourceUrl: string; originalExcerpt: string }) =>
    `[stub] Citation verification for clause ${clauseId} against ${sourceUrl} (${originalExcerpt.length} chars) — wire source re-fetch, text comparison, and audit trace logging.`,
  {
    name: "citation_verifier",
    description:
      "Verify a clause-to-pillar mapping by re-checking the extracted text against the original source document. Confirms that the excerpt matches the source, the article reference is accurate, and the pillar assignment is well-reasoned. Logs verification result as an audit trace entry.",
    schema: z.object({
      clauseId: z.string().min(1).describe("ID of the clause to verify."),
      sourceUrl: z.string().url().describe("URL of the original source document."),
      originalExcerpt: z.string().describe("The verbatim excerpt to verify against the source."),
    }),
  }
);
