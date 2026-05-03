import { tool } from "langchain";
import { z } from "zod";
import pdf from "pdf-parse";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { Jurisdiction, LegalDocument, Clause, PillarMapping, AuditTrace } from "../context/schemas.js";
// Re-export webSearch and workspaceHealth from stubTools
import { webSearch as webSearchStub, workspaceHealth as workspaceHealthStub } from "./stubTools.js";

// ============================================================================
// Shared Utilities
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  baseURL: process.env.ANTHROPIC_BASE_URL?.trim() ?? "https://api.z.ai/api/anthropic/",
});

const zaiClient = process.env.ZAI_API_KEY
  ? new OpenAI({ apiKey: process.env.ZAI_API_KEY, baseURL: "https://api.z.ai/api/paas/v4/" })
  : null;

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function streamClaudeText(
  system: string,
  prompt: string,
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "glm-5.1",
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });
    const content = response.content[0];
    return content.type === "text" ? content.text : "";
  } catch (err) {
    if (!zaiClient) throw err;
    console.warn("[realTools] AgentRouter failed, falling back to z.ai:", (err as Error).message);
    const response = await zaiClient.chat.completions.create({
      model: process.env.ZAI_MODEL ?? "glm-5.1",
      max_tokens: 8192,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    });
    const msg = response.choices[0]?.message as any;
    return msg?.content || msg?.reasoning_content || "";
  }
}

// ============================================================================
// Tool: document_fetch
// ============================================================================

export const documentFetch = tool(
  async ({ url, documentType }: { url: string; documentType?: string }) => {
    const dtype = documentType ?? "unknown";

    try {
      // Fetch the document
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      const isPdf = contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf");

      let content = "";
      let pageCount = 0;
      let title = "Unknown Document";

      if (isPdf) {
        // Parse PDF
        const buffer = await response.arrayBuffer();
        const pdfData = await pdf(Buffer.from(buffer));
        content = pdfData.text;
        pageCount = pdfData.numpages;

        // Try to extract title from first page
        const firstPageLines = content.split("\n").slice(0, 5);
        const titleLine = firstPageLines.find(
          (l) => l.length > 20 && l.length < 200 && /^[A-Z]/.test(l),
        );
        if (titleLine) title = titleLine.trim();
      } else if (contentType.includes("text/html") || url.toLowerCase().endsWith(".htm")) {
        // Parse HTML
        const html = await response.text();
        // Extract title from HTML
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        if (titleMatch) title = titleMatch[1]?.trim() ?? "Unknown Document";
        // Extract main content
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          content = bodyMatch[1] ?? "";
          // Remove script and style tags
          content = content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }
      } else {
        // Plain text
        content = await response.text();
        const lines = content.split("\n");
        title = lines[0]?.trim() ?? "Unknown Document";
      }

      // Detect language from content (simplified ASCII-only patterns)
      const language = /[Cc]y[rR]i[lL]l[iI]i[cC]/.test(content.slice(0, 500))
        ? "uk"
        : /[Ff]r[eE][nN][cC][hH]/.test(content.slice(0, 500))
        ? "fr"
        : /[Dd]e[Ee][uU][tT][sS][cC][hH]/.test(content.slice(0, 500))
        ? "de"
        : /[Ee][sS][pP]/.test(content.slice(0, 500))
        ? "es"
        : "en";

      const documentId = generateId();
      const retrievedAt = new Date().toISOString();
      const storagePath = `/documents/${documentId}`;

      return JSON.stringify({
        documentId,
        url,
        documentType: dtype,
        title,
        content: content.slice(0, 100000), // Limit to 100k chars for now
        pageCount,
        language,
        retrievedAt,
        storagePath,
      });
    } catch (error) {
      if (error instanceof Error) {
        return JSON.stringify({
          error: `Failed to fetch document: ${error.message}`,
          url,
          documentType: dtype,
        });
      }
      return JSON.stringify({ error: "Unknown error fetching document", url, documentType: dtype });
    }
  },
  {
    name: "document_fetch",
    description:
      "Fetch a legal document from a URL. Supports PDF, HTML, and plain text. Returns content, metadata (page count, language), and storage reference.",
    schema: z.object({
      url: z.string().url().describe("URL of the legal document to fetch."),
      documentType: z
        .enum(["act", "regulation", "decree", "directive", "guideline", "amendment", "treaty", "circular"])
        .optional()
        .describe("Expected document type for classification."),
    }),
  }
);

// ============================================================================
// Tool: ocr_extract
// ============================================================================

export const ocrExtract = tool(
  async ({ documentId, pages }: { documentId: string; pages?: string }) => {
    const pageScope = pages ?? "all";

    try {
      // For now, we'll simulate OCR by returning a structured error
      // since we don't have actual image storage set up
      return JSON.stringify({
        documentId,
        pages: pageScope,
        status: "requires_image_storage",
        message:
          "OCR extraction requires image storage. Configure image storage (Vercel Blob, S3, etc.) to enable OCR functionality.",
        extractedAt: new Date().toISOString(),
      });

      // Real implementation would be:
      // const worker = await createWorker('node_modules/tesseract.js/src/worker-script.js', {
      //   logger: (m) => console.log(m),
      // });
      //
      // const { data: { text } } = await worker.recognize(imagePath);
      // return JSON.stringify({ documentId, text, confidence, extractedAt });
    } catch (error) {
      if (error instanceof Error) {
        return JSON.stringify({
          error: `OCR extraction failed: ${error.message}`,
          documentId,
          pages: pageScope,
        });
      }
      return JSON.stringify({ error: "Unknown error in OCR extraction", documentId, pages: pageScope });
    }
  },
  {
    name: "ocr_extract",
    description:
      "Apply OCR to a scanned or image-based legal document. Extracts text while preserving structure. Requires image storage to be configured.",
    schema: z.object({
      documentId: z.string().min(1).describe("ID of the document in storage to OCR."),
      pages: z.string().optional().describe("Page range to OCR (e.g. '1-5', '3,7,12'). Defaults to all pages."),
    }),
  }
);

// ============================================================================
// Tool: clause_extractor
// ============================================================================

export const clauseExtractor = tool(
  async ({ text, jurisdiction, targetPillars }: { text: string; jurisdiction?: string; targetPillars?: string[] }) => {
    const pillars = targetPillars?.join(", ") ?? "pillar_6, pillar_7";
    const jur = jurisdiction ?? "unspecified";

    try {
      const system = `You are a legal clause extraction specialist for RDTII (Regulation Data Technology Intelligence Initiative) compliance analysis.

Your task is to extract relevant legal clauses from provided text and structure them for pillar mapping.

**Target Pillars:**
- Pillar 6 (Cross-Border Data Policies): clauses related to data transfers, cross-border restrictions, adequacy determinations, international data flows
- Pillar 7 (Domestic Data Protection & Privacy): clauses related to data collection, consent, retention, processing, access rights, data subject rights

**Output Format:**
Return a JSON array of extracted clauses with this structure:
[
  {
    "id": "unique-id",
    "articleNumber": "Section X" or "Article Y",
    "originalExcerpt": "exact text from source",
    "clauseType": "rule|obligation|prohibition|exception|definition|scope|penalty",
    "subjectMatter": ["relevant", "tags"],
    "confidence": 0.85
  }
]

**Guidelines:**
- Only extract clauses that are directly relevant to Pillar 6 or Pillar 7
- Preserve exact wording in originalExcerpt (do not paraphrase)
- Include article/section references for verification
- Classify clauseType appropriately
- Set confidence based on clarity and relevance (0.5 to 1.0)
- Skip administrative or procedural clauses (definitions of terms, citation formats, etc.) unless they define rights or obligations
- Return ONLY valid JSON, no other text or explanation`;

      const prompt = `Extract relevant legal clauses from the following text for RDTII pillar mapping.

**Context:**
- Jurisdiction: ${jur}
- Target Pillars: ${pillars}
- Text length: ${text.length} characters

**Text to analyze:**
${text.slice(0, 15000)}

Extract clauses following the specified pillar targets and return only valid JSON, no other text.`;

      const extractedText = await streamClaudeText(system, prompt);

      // Strip markdown code fences if present
      const stripped = extractedText.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();

      // Try to extract JSON array
      const startIdx = stripped.indexOf("[");
      const endIdx = stripped.lastIndexOf("]");
      if (startIdx >= 0 && endIdx > startIdx) {
        return stripped.slice(startIdx, endIdx + 1);
      }

      // If parsing failed, return structured error
      return JSON.stringify({
        error: "Failed to parse extracted clauses",
        rawResponse: extractedText.slice(0, 500),
      });
    } catch (error) {
      if (error instanceof Error) {
        return JSON.stringify({
          error: `Clause extraction failed: ${error.message}`,
          jurisdiction: jur,
          targetPillars: pillars,
        });
      }
      return JSON.stringify({ error: "Unknown error in clause extraction" });
    }
  },
  {
    name: "clause_extractor",
    description:
      "Extract clauses relevant to RDTII Pillar 6 (Cross-Border Data Policies) and Pillar 7 (Domestic Data Protection & Privacy) from legal text.",
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

// ============================================================================
// Tool: pillar_mapper
// ============================================================================

export const pillarMapper = tool(
  async ({ clauseExcerpt, clauseType, articleReference }: { clauseExcerpt: string; clauseType?: string; articleReference?: string }) => {
    const ctype = clauseType ?? "unknown";
    const aref = articleReference ?? "unspecified";

    try {
      const system = `You are a RDTII pillar mapping specialist. Your task is to determine which RDTII pillar a legal clause belongs to and provide a detailed rationale.

**RDTII Pillars:**
- **Pillar 6: Cross-Border Data Policies** - Clauses that impose restrictions, conditions, or requirements on cross-border personal data transfers, adequacy determinations, international data flows, or data export/import controls
- **Pillar 7: Domestic Data Protection & Privacy** - Clauses that govern data collection, consent mechanisms, data retention periods, data subject access rights, data processing principles, or domestic privacy obligations

**Mapping Criteria:**
1. **Pillar 6 indicators:** Look for keywords like "transfer", "cross-border", "foreign", "international", "adequate", "safeguards", "export", "import", "recipient country", "third country"
2. **Pillar 7 indicators:** Look for keywords like "consent", "collection", "retention", "processing", "access", "data subject", "purpose", "storage", "keep", "store", "use", "disclosure"

**Output Format (JSON only, no markdown):**
{
  "pillar": "pillar_6" or "pillar_7",
  "subIndicator": "6.1" or "7.1" (numbered sub-indicator),
  "mappingRationale": "1-2 sentence explanation of why this clause maps to the specified pillar",
  "confidence": 0.0 to 1.0 score,
  "status": "auto_mapped",
  "flags": [] (optional array of flags like "low_confidence", "ambiguous", "requires_review")
}`;

      const prompt = `Map the following legal clause to the appropriate RDTII pillar.

**Clause Information:**
- Article Reference: ${aref}
- Clause Type: ${ctype}
- Excerpt: ${clauseExcerpt.slice(0, 2000)}

Determine which pillar (pillar_6 or pillar_7) this clause belongs to, assign an appropriate sub-indicator, provide a clear rationale, and assign a confidence score.

Return ONLY JSON object, no other text or explanation.`;

      const mappedText = await streamClaudeText(system, prompt);

      // Try to parse JSON from response
      const jsonMatch = mappedText.match(/\{[\s\S\S]*?\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }

      // Fallback: try to find JSON in response
      const startIdx = mappedText.indexOf("{");
      const endIdx = mappedText.lastIndexOf("}");
      if (startIdx >= 0 && endIdx > startIdx) {
        return mappedText.slice(startIdx, endIdx + 1);
      }

      return JSON.stringify({
        error: "Failed to parse mapping result",
        rawResponse: mappedText.slice(0, 500),
      });
    } catch (error) {
      if (error instanceof Error) {
        return JSON.stringify({
          error: `Pillar mapping failed: ${error.message}`,
          clauseType: ctype,
          articleReference: aref,
        });
      }
      return JSON.stringify({ error: "Unknown error in pillar mapping" });
    }
  },
  {
    name: "pillar_mapper",
    description:
      "Map a legal clause to RDTII Pillar 6 or Pillar 7 with a rationale and confidence score.",
    schema: z.object({
      clauseExcerpt: z.string().describe("Verbatim text of the extracted clause."),
      clauseType: z
        .enum(["rule", "obligation", "prohibition", "exception", "definition", "scope", "penalty"])
        .optional()
        .describe("Classification of the clause type."),
      articleReference: z.string().optional().describe("Article/section reference."),
    }),
  }
);

// ============================================================================
// Tool: citation_verifier
// ============================================================================

export const citationVerifier = tool(
  async ({ clauseId, sourceUrl, originalExcerpt }: { clauseId: string; sourceUrl: string; originalExcerpt: string }) => {
    try {
      // Re-fetch the source document
      const response = await fetch(sourceUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        return JSON.stringify({
          clauseId,
          sourceUrl,
          status: "failed",
          error: `Failed to re-fetch source: ${response.status}`,
          verified: false,
          verifiedAt: new Date().toISOString(),
        });
      }

      const contentType = response.headers.get("content-type") ?? "";
      const isPdf = contentType.includes("application/pdf") || sourceUrl.toLowerCase().endsWith(".pdf");

      let sourceText = "";

      if (isPdf) {
        const buffer = await response.arrayBuffer();
        const pdfData = await pdf(Buffer.from(buffer));
        sourceText = pdfData.text;
      } else {
        sourceText = await response.text();
      }

      // Check if excerpt exists in source (allowing for minor formatting differences)
      const excerptNormalized = originalExcerpt
        .replace(/\s+/g, " ")
        .replace(/[^\w\s\.,;:!?"'()\-]/g, "")
        .toLowerCase()
        .slice(0, 100);

      const sourceNormalized = sourceText
        .replace(/\s+/g, " ")
        .replace(/[^\w\s\.,;:!?"'()\-]/g, "")
        .toLowerCase();

      const excerptFound = sourceNormalized.includes(excerptNormalized);

      // More lenient check: check if at least 70% of words match
      const excerptWords = excerptNormalized.split(" ").filter((w) => w.length > 2);
      const wordsMatched = excerptWords.filter((word) => sourceNormalized.includes(word)).length;
      const matchRatio = excerptWords.length > 0 ? wordsMatched / excerptWords.length : 0;

      const isMatched = excerptFound || matchRatio >= 0.7;

      return JSON.stringify({
        clauseId,
        sourceUrl,
        status: isMatched ? "verified" : "disputed",
        verified: isMatched,
        matchRatio: matchRatio.toFixed(2),
        excerptFound,
        verifiedAt: new Date().toISOString(),
        note: !isMatched
          ? "Excerpt could not be verified in source. May need manual review."
          : "Excerpt successfully matched source document.",
      });
    } catch (error) {
      if (error instanceof Error) {
        return JSON.stringify({
          error: `Citation verification failed: ${error.message}`,
          clauseId,
          sourceUrl,
          verified: false,
          verifiedAt: new Date().toISOString(),
        });
      }
      return JSON.stringify({
        error: "Unknown error in citation verification",
        clauseId,
        sourceUrl,
        verified: false,
      });
    }
  },
  {
    name: "citation_verifier",
    description:
      "Verify a clause-to-pillar mapping by re-checking the extracted text against the original source document.",
    schema: z.object({
      clauseId: z.string().min(1).describe("ID of the clause to verify."),
      sourceUrl: z.string().url().describe("URL of the original source document."),
      originalExcerpt: z.string().describe("The verbatim excerpt to verify against the source."),
    }),
  }
);

// ============================================================================
// Re-export all tools
// ============================================================================

export const webSearch = webSearchStub;
export const workspaceHealth = workspaceHealthStub;
export const tools = [documentFetch, ocrExtract, clauseExtractor, pillarMapper, citationVerifier];
