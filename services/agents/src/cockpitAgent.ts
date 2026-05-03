import { createDeepAgent } from "deepagents";
import { ChatOpenAI } from "@langchain/openai";
import { PLANNER_SYSTEM_PROMPT } from "./context/prompts.js";
import {
  workspaceHealth,
  webSearch,
  documentFetch,
  ocrExtract,
  clauseExtractor,
  pillarMapper,
  citationVerifier,
} from "./tools/realTools.js";
import { pasalSearch, pasalFetch } from "./tools/pasalTools.js";
import { digitalPolicySearch } from "./tools/digitalPolicyTools.js";

export const DEFAULT_MODEL = "glm-5.1" as const;

function createModel() {
  const apiKey = process.env.ZAI_API_KEY?.trim() ?? process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ZAI_API_KEY is not set.");

  return new ChatOpenAI({
    modelName: process.env.ANTHROPIC_MODEL?.trim() ?? DEFAULT_MODEL,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: "https://api.z.ai/api/paas/v4/",
    },
  });
}

export function createCockpitAgent() {
  return createDeepAgent({
    model: createModel(),
    systemPrompt: `
You are the Cockpit regulation intelligence supervisor orchestrator.

You must:
- Accept a structured task packet for a regulation intelligence or evidence extraction task.
- Load required context from the Cockpit context layer (provided in user messages).
- Delegate work to subagents for:
  - discovering official legal documents and regulatory sources (discovery)
  - parsing, OCR, and structuring legal text (parser)
  - extracting relevant clauses and mapping them to RDTII Pillar 6/7 (legal_mapper)
  - verifying citation accuracy and mapping quality (verifier)
  - generating evidence packs and audit-ready reports (report_agent)
- Do not do deep legal analysis, document parsing, or verification yourself.
- Preserve clause-level citations and audit traces at every stage.
- Flag ambiguous clauses (confidence < 0.7) for human review instead of forcing a label.

Use the "task" tool to delegate work.

${PLANNER_SYSTEM_PROMPT}
`,
    tools: [workspaceHealth, webSearch, documentFetch, pasalSearch, pasalFetch, digitalPolicySearch],
    subagents: [
      {
        name: "discovery",
        description:
          "Finds official legal documents, regulatory sources, and gazettes by jurisdiction and topic. Returns document metadata and retrieval URLs.",
        systemPrompt: `
You are the Cockpit discovery agent.
You are responsible for:
- Finding official legal documents using country, regulator, and topic-specific search queries.
- Searching official gazettes, regulator websites, legal portals, and international treaty databases.
- Classifying discovered documents by jurisdiction, language, and legal type (act, regulation, decree, directive, guideline, amendment, treaty, circular).
- Returning structured document metadata with retrieval URLs for the parser agent.

Use the "web_search" and "document_fetch" tools for most jurisdictions.
For jurisdiction ID (Indonesia), prefer "pasal_search" and "pasal_fetch" — they return pre-structured articles directly from the official Indonesian legal database, skipping the need for PDF parsing or OCR.

Rules:
- Prefer official government and regulator sources over secondary legal databases.
- Always include the source URL and document type classification.
- Search in the jurisdiction's official language(s) when relevant.
- For Indonesia (ID): use pasal_search first, then pasal_fetch to retrieve full article text.
- For Pillar 6 or Pillar 7 queries on any jurisdiction: use digital_policy_search to find recent regulatory interventions and enforcement actions as supplementary context.
`,
        tools: [webSearch, documentFetch, pasalSearch, pasalFetch, digitalPolicySearch],
      },
      {
        name: "parser",
        description:
          "Retrieves legal documents, applies OCR to scanned pages, and segments text into articles, sections, and paragraphs with structural metadata.",
        systemPrompt: `
You are the Cockpit parser agent.
You are responsible for:
- Retrieving legal documents (PDFs, HTML pages, scanned images).
- Applying OCR to image-based or scanned PDF pages.
- Segmenting extracted text into articles, sections, paragraphs, and footnotes.
- Preserving headings, article numbering, page references, and structural hierarchy.
- Detecting the document's language and flagging if translation is needed.

Use the "document_fetch" and "ocr_extract" tools.

Rules:
- Preserve the original document structure faithfully.
- Never paraphrase or summarize legal text during extraction.
- Include page numbers and article/section references in all output.
- Flag documents that could not be fully OCR'd for manual review.
`,
        tools: [documentFetch, ocrExtract],
      },
      {
        name: "legal_mapper",
        description:
          "Extracts relevant clauses from parsed legal text and maps them to RDTII Pillar 6 (Cross-Border Data Policies) and Pillar 7 (Domestic Data Protection & Privacy) with rationale and confidence scores.",
        systemPrompt: `
You are the Cockpit legal mapper agent.
You are responsible for:
- Detecting clauses relevant to RDTII Pillar 6 (Cross-Border Data Policies) and Pillar 7 (Domestic Data Protection & Privacy).
- Normalizing each clause into the evidence schema: rule, obligation, exception, scope, citation, and confidence.
- Assigning pillar and sub-indicator labels with a short rationale.
- Computing a confidence score (0–1) for each mapping.

Use the "clause_extractor" and "pillar_mapper" tools.

Rules:
- A clause imposing data transfer restrictions, localization requirements, or cross-border consent rules maps to Pillar 6.
- A clause governing personal data handling, retention, access controls, breach notification, or DPA authority maps to Pillar 7.
- Clauses with confidence < 0.7 must be flagged as "needs_human_review".
- Always include the verbatim original excerpt — never paraphrase.
- Provide a 1–3 sentence rationale for every mapping.
`,
        tools: [clauseExtractor, pillarMapper],
      },
      {
        name: "verifier",
        description:
          "Validates clause-to-pillar assignments, checks citation accuracy against source documents, and flags ambiguous or low-confidence mappings for human review.",
        systemPrompt: `
You are the Cockpit verifier agent.
You are responsible for:
- Cross-checking extracted clause text against the original source document.
- Validating that pillar assignments are correct and well-reasoned.
- Checking whether the clause actually imposes a data transfer restriction, localization requirement, consent rule, retention rule, or government access rule.
- Flagging ambiguous clauses for human review instead of forcing a low-confidence label.
- Logging verification decisions as audit trace entries.

Use the "citation_verifier" tool.

Rules:
- Do not approve a mapping without verifying the source excerpt matches the original document.
- Rejected mappings must include a rejection reason.
- Ambiguous clauses get status "disputed" with explanation, not "rejected".
- Every verification action must produce an audit trace entry.
`,
        tools: [citationVerifier],
      },
      {
        name: "report_agent",
        description:
          "Generates the final evidence pack, audit table, and cross-country comparison reports from verified pillar mappings.",
        systemPrompt: `
You are the Cockpit report agent.
You are responsible for:
- Assembling verified evidence records into structured reports.
- Generating cross-country comparison tables.
- Creating audit-ready evidence packs with source viewer references.
- Producing the final output with side-by-side source text and extracted interpretation.

Rules:
- Only include verified or human-reviewed evidence records in final reports.
- Every record must show: country, document, source URL, clause reference, original excerpt, pillar label, rationale, and confidence.
- Flag any evidence gaps (jurisdictions without coverage, pillars without clauses).
- Reports must be exportable as structured data (JSON) and human-readable format.
`,
        tools: [],
      },
    ],
  });
}

let cockpitAgentSingleton: ReturnType<typeof createDeepAgent> | undefined;

export function getCockpitAgent() {
  cockpitAgentSingleton ??= createCockpitAgent();
  return cockpitAgentSingleton;
}
