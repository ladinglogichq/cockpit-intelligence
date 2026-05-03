/**
 * Integration test: exercises all live API integrations without the full agent loop.
 * Run: tsx src/cli/integrationTest.ts
 */
import { webSearch } from "../tools/stubTools.js";
import { documentFetch, clauseExtractor, pillarMapper, citationVerifier } from "../tools/realTools.js";
import { pasalSearch, pasalFetch } from "../tools/pasalTools.js";
import { digitalPolicySearch } from "../tools/digitalPolicyTools.js";

const PASS = "✅";
const FAIL = "❌";
const SKIP = "⏭️ ";

function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? PASS : FAIL} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function testAnthropicDirect() {
  console.log("\n── z.ai Anthropic-compatible endpoint ──");
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      baseURL: process.env.ANTHROPIC_BASE_URL ?? "https://api.z.ai/api/anthropic/",
    });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929",
      max_tokens: 64,
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
    });
    const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "";
    check("z.ai Anthropic endpoint reachable", text.length > 0, text.slice(0, 80));
  } catch (err: any) {
    check("z.ai Anthropic endpoint reachable", false, err?.message?.slice(0, 120) ?? String(err));
  }

  if (process.env.ZAI_API_KEY) {
    console.log("\n── z.ai fallback ──");
    try {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.ZAI_API_KEY, baseURL: "https://api.z.ai/api/paas/v4/" });
      const res = await client.chat.completions.create({
        model: process.env.ZAI_MODEL ?? "glm-5.1",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
      });
      const msg = res.choices[0]?.message as any;
      const text = (msg?.content || msg?.reasoning_content || "").trim();
      check("z.ai API reachable", text.length > 0, text.slice(0, 80));
    } catch (err: any) {
      check("z.ai API reachable", false, err?.message?.slice(0, 120) ?? String(err));
    }
  }
}

async function testTavily() {
  console.log("\n── Tavily web_search ──");
  const raw = await webSearch.invoke({ query: "Singapore PDPA cross-border data transfer", jurisdiction: "SG", limit: 2 });
  const isStub = raw.startsWith("[stub");
  if (isStub) {
    console.log(`${SKIP} web_search — TAVILY_API_KEY not set, stub returned`);
    return;
  }
  const data = JSON.parse(raw);
  check("Tavily returns results", Array.isArray(data.results) && data.results.length > 0, `${data.results?.length} results`);
}

async function testDocumentFetch() {
  console.log("\n── document_fetch (real) ──");
  // Use a PDF that doesn't require JS rendering
  const raw = await documentFetch.invoke({
    url: "https://www.legislation.gov.uk/ukpga/2018/12/pdfs/ukpga_20180012_en.pdf",
    documentType: "act",
  });
  const data = JSON.parse(raw);
  if (data.error) {
    check("document_fetch", false, data.error);
  } else {
    check("document_fetch", (data.content?.length ?? 0) > 500, `${data.content?.length} chars, lang=${data.language}, pages=${data.pageCount}`);
  }
}

async function testClauseExtractor() {
  console.log("\n── clause_extractor (real — calls Anthropic) ──");
  const sampleText = `Section 26. Transfer of personal data outside Singapore.
An organisation shall not transfer any personal data to a country or territory outside Singapore except in accordance with requirements prescribed under this Act to ensure that organisations provide a standard of protection to personal data so transferred that is comparable to the protection under this Act.`;
  try {
    const raw = await clauseExtractor.invoke({ text: sampleText, jurisdiction: "SG", targetPillars: ["pillar_6"] });
    let ok = false;
    try {
      const parsed = JSON.parse(raw);
      ok = Array.isArray(parsed) && parsed.length > 0;
      check("clause_extractor", ok, `${parsed.length} clause(s) extracted`);
    } catch {
      check("clause_extractor", false, raw.slice(0, 120));
    }
  } catch (err: any) {
    check("clause_extractor", false, err?.message?.slice(0, 120) ?? String(err));
  }
}

async function testPillarMapper() {
  console.log("\n── pillar_mapper (real — calls Anthropic) ──");
  try {
    const raw = await pillarMapper.invoke({
      clauseExcerpt: "An organisation shall not transfer any personal data to a country outside Singapore except in accordance with prescribed requirements.",
      clauseType: "obligation",
      articleReference: "Section 26",
    });
    try {
      const data = JSON.parse(raw);
      check("pillar_mapper", !!data.pillar && !!data.confidence, `pillar=${data.pillar}, confidence=${data.confidence}`);
    } catch {
      check("pillar_mapper", false, raw.slice(0, 120));
    }
  } catch (err: any) {
    check("pillar_mapper", false, err?.message?.slice(0, 120) ?? String(err));
  }
}

async function testCitationVerifier() {
  console.log("\n── citation_verifier (real — re-fetches URL) ──");
  const raw = await citationVerifier.invoke({
    clauseId: "test-clause-1",
    sourceUrl: "https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act",
    originalExcerpt: "personal data",
  });
  try {
    const data = JSON.parse(raw);
    check("citation_verifier", data.status !== undefined, `status=${data.status}, matchRatio=${data.matchRatio}`);
  } catch {
    check("citation_verifier", false, raw.slice(0, 120));
  }
}

async function testPasal() {
  console.log("\n── pasal.id (pasalSearch + pasalFetch) ──");
  const token = process.env.PASAL_API_TOKEN?.trim();
  if (!token) {
    console.log(`${SKIP} pasal_search — PASAL_API_TOKEN not set`);
    return;
  }
  const raw = await pasalSearch.invoke({ query: "perlindungan data pribadi", type: "UU", limit: 2 });
  const data = JSON.parse(raw);
  check("pasal_search", Array.isArray(data.results) && data.results.length > 0, `${data.results?.length} results`);

  if (data.results?.[0]?.law?.frbrUri) {
    const fetchRaw = await pasalFetch.invoke({ frbrUri: data.results[0].law.frbrUri });
    const fetchData = JSON.parse(fetchRaw);
    check("pasal_fetch", !!fetchData.title, `title="${fetchData.title}", articles=${fetchData.articleCount}`);
  }
}

async function testDigitalPolicy() {
  console.log("\n── Digital Policy Alert ──");
  const apiKey = process.env.DIGITAL_POLICY_ALERT_API_KEY?.trim();
  if (!apiKey) {
    console.log(`${SKIP} digital_policy_search — DIGITAL_POLICY_ALERT_API_KEY not set`);
    return;
  }
  const raw = await digitalPolicySearch.invoke({ query: "data localization", jurisdiction: "SG", limit: 2 });
  const data = JSON.parse(raw);
  check("digital_policy_search", Array.isArray(data.results), `${data.results?.length} results`);
}

async function main() {
  console.log("=== Cockpit Integration Tests ===");
  console.log(`ANTHROPIC_BASE_URL: ${process.env.ANTHROPIC_BASE_URL ?? "(default)"}`);
  console.log(`ANTHROPIC_MODEL:    ${process.env.ANTHROPIC_MODEL ?? "(default)"}`);
  console.log(`TAVILY_API_KEY:     ${process.env.TAVILY_API_KEY ? "set" : "NOT SET"}`);
  console.log(`PASAL_API_TOKEN:    ${process.env.PASAL_API_TOKEN ? "set" : "NOT SET"}`);
  console.log(`DIGITAL_POLICY_ALERT_API_KEY: ${process.env.DIGITAL_POLICY_ALERT_API_KEY ? "set" : "NOT SET"}`);

  await testAnthropicDirect();
  await testTavily();
  await testDocumentFetch();
  await testClauseExtractor();
  await testPillarMapper();
  await testCitationVerifier();
  await testPasal();
  await testDigitalPolicy();

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
