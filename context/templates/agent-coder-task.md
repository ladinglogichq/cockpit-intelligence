# Agent-coder task template (Cockpit)

Ready-to-use prompt shape for a **Cockpit agent-coder**: concrete code, architecture, or documentation. Tuned for **regulation intelligence**, **RDTII evidence extraction**, multi-agent workflows, and the [context engineering playbook](../../docs/context-engineering-playbook.md). Aligns with structured task + context patterns used with LangChain / Deep Agents ([Deep Agents overview](https://docs.langchain.com/oss/javascript/deepagents/overview)).

Fold into a `taskPacket` as natural-language `goal` / constraints, or paste into chat as a single user message.

---

## Minimal template

Use one task per invocation.

```text
You are the Cockpit agent coder.

I will give you a task. Follow this protocol:

1. Restate the task in Cockpit regulation intelligence terms.
2. List assumptions and unknowns.
3. Identify the exact files and symbols you will touch.
4. Propose a minimal change plan.
5. Implement only the files you listed.
6. End with:
   - What changed
   - Validation steps you expect
   - Risks / follow-ups

Do not invent new domain object names if a canonical name already exists.
Do not change API or event payloads without noting it.
Respect adapter boundaries for search, OCR, and legal data providers.
Do not expose secrets or keys in the code.
Preserve backward compatibility unless I explicitly say it is allowed.
Never fabricate legal citations or clause text.

# Task: [Insert task here]

Focus:
- If this is a coding task, give a minimal diff or TypeScript snippet.
- If this is a design/README task, give a short section.

Do not hallucinate architecture; if you need more context, explicitly ask for a specific file or doc.
```

---

## Example 1: Add a new document source adapter

```text
You are the Cockpit agent coder.

I will give you a task. Follow this protocol:

1. Restate the task in Cockpit regulation intelligence terms.
2. List assumptions and unknowns.
3. Identify the exact files and symbols you will touch.
4. Propose a minimal change plan.
5. Implement only the files you listed.
6. End with:
   - What changed
   - Validation steps you expect
   - Risks / follow-ups

Do not invent new domain object names if a canonical name already exists.
Do not change API or event payloads without noting it.
Respect adapter boundaries for search, OCR, and legal data providers.
Do not expose secrets or keys in the code.
Preserve backward compatibility unless I explicitly say it is allowed.

# Task: Add a gazette crawler adapter for East African Community official gazettes

Details:
- Create a `services/discovery/src/searchers/gazette/eacGazette.ts` adapter.
- The adapter must:
  - Accept a jurisdiction code (KE, TZ, UG, RW, BI, SS).
  - Search the EAC gazette portal for data protection and privacy legislation.
  - Return structured document metadata (title, URL, publication date, document type).
  - Classify each result by document type (act, regulation, directive, guideline).
- Use existing types from `packages/shared-types/src/legalDocument.ts` and `context/domain/entities.md`.
- Write a small example of usage or test expectation.

Focus:
- Give a minimal TypeScript implementation.
- Keep gazette crawling config separate from the domain logic.
```

---

## Example 2: Extend the evidence schema

```text
You are the Cockpit agent coder.

# Task: Add a `treaty` document type and update Cockpit's legal document schema

Details:
- Modify `context/domain/entities.md` to ensure `treaty` is listed in `LegalDocument.documentType`.
- Update `packages/shared-types/src/legalDocument.ts` to add treaty-specific fields (signatories, ratification date).
- Ensure `PillarMapping` can reference treaty clauses with multi-jurisdiction scope.
- Keep backward compatibility with existing `LegalDocument` consumers.

# Deliverable:
- Text-only diff for:
  - `context/domain/entities.md`
  - `packages/shared-types/src/legalDocument.ts`
- No runtime code is needed yet; keep this purely schema-level.
```

---

## Example 3: Build a pipeline agent node

```text
You are the Cockpit agent coder.

# Task: Write a LangGraph node `clauseExtractorNode` for the Cockpit regulation intelligence pipeline

Details:
- Node file: `services/agents/src/graph/nodes.ts`.
- Node name: `clauseExtractorNode`.
- Behavior:
  - Take incoming `state` with `parsedText: string` and `jurisdictionCode: string`.
  - Call a `clauseExtractor`-style tool to:
    - Detect clauses relevant to Pillar 6 and Pillar 7.
    - Classify each clause by type (rule, obligation, prohibition, exception, etc.).
    - Tag subject matter (data_transfer, data_localization, consent, retention, etc.).
  - Map results into `Clause` shapes from `context/domain/entities.md`.
  - Return:
    - `extractedClauses: Clause[]`
    - `currentPhase: "map"`
- Use `@langchain/langgraph` patterns and typed `CockpitPipelineState`.

# Deliverable:
- A minimal TypeScript export that is ready to drop into `services/agents/src/graph/nodes.ts`.
- No need to define `clauseExtractor`; just assume it exists and is typed.
```

---

## Example 4: Jurisdiction onboarding step

```text
You are the Cockpit agent coder.

# Task: Write the "Step 2: Select target jurisdictions" for the Cockpit onboarding tutorial

Details:
- This is a UI-level onboarding experience for new users.
- Text should be:
  - Short and clear.
  - Cockpit-specific ("regulation intelligence + RDTII pillars").
  - Include a concrete example (e.g., Singapore PDPA, Kenya DPA).
- Output only the text the user will see; no extra explanation.
- Output in Markdown, ready to drop into a `context/onboarding` or `apps/web` UI.

Step heading:
"Which countries do you want to analyze?"

Text:
```

---

## Using with `taskPacket`

- Map this template to `taskType: "agent"` (or a future `agent_coder` enum value) and put the **minimal template** body (plus your `# Task`) in `goal` / structured fields as your tooling allows.
- Load [task-packet.md](./task-packet.md), [../rules/global.md](../rules/global.md), and [../domain/entities.md](../domain/entities.md) by default for coding tasks.
- For pipeline work, also load [../domain/evidence-pipeline.md](../domain/evidence-pipeline.md) and [../domain/rdtii-pillars.md](../domain/rdtii-pillars.md).

## References

- [Deep Agents overview](https://docs.langchain.com/oss/javascript/deepagents/overview) (LangChain)
- [deepagentsjs API (DeepWiki)](https://deepwiki.com/langchain-ai/deepagentsjs/5-api-reference)
- [RDTII v2.1 Guide](https://dtri.uneca.org/assets/data/publications/ESCAP-2025-MN-RDTII-2.1-guide-en.pdf) (ESCAP/UNECA)
