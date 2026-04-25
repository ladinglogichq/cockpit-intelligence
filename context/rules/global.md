# Cockpit Global Rules

## Purpose

Cockpit is a **regulation intelligence platform** that:

- Crawls official legal sources (gazettes, regulator websites, legal portals, scanned PDFs)
- Extracts relevant clauses from legislation and regulation
- Maps clauses to the **RDTII Pillar 6** (Cross-Border Data Policies) and **Pillar 7** (Domestic Data Protection & Privacy) evidence model
- Preserves clause-level citations and audit traces
- Supports cross-country, cross-language comparative analysis

The system behaves as an **evidence engine**, not a generic chatbot. Every finding must be tied to legal text, article numbers, and source provenance.

## Primary engineering goals

- Preserve correctness over speed.
- Prefer narrow, reversible changes.
- Keep domain language consistent with canonical docs.
- Maintain auditability, traceability, and citation integrity.
- Ensure every extracted clause traces back to its original source document.

## Non-negotiable rules

- Do not invent new domain object names if a canonical name already exists.
- Do not change API/event payloads without updating contracts and consumers.
- Do not expose provider API keys or secrets in frontend code.
- Do not bypass adapter boundaries for search, OCR, or external legal data providers.
- Do not introduce breaking schema changes without migration notes.
- Do not edit files outside the approved task scope.
- Do not fabricate legal citations or clause text — all evidence must come from retrieved sources.
- Do not assign a pillar mapping without a rationale and confidence score.

## Expected workflow

1. Restate the task in Cockpit regulation intelligence terms.
2. Load required context docs.
3. Identify touched files and symbols before editing.
4. Prefer existing patterns over new abstractions.
5. Update docs when behavior, contracts, or domain concepts change.
6. End with validation summary, assumptions, and risks.

## Core pipeline (agent workflow)

1. **Discover** — find official documents using country, regulator, and topic-specific search queries.
2. **Retrieve** — fetch the document and classify by jurisdiction, language, and legal type.
3. **Parse** — OCR scanned pages; segment text into articles, sections, paragraphs.
4. **Extract** — detect clauses relevant to Pillar 6 and Pillar 7.
5. **Map** — normalize each clause into the evidence schema (rule, obligation, exception, scope, citation, confidence).
6. **Verify** — cross-check against original source; flag ambiguous clauses for human review.
7. **Report** — generate the final evidence pack and audit table.

## Coding defaults

- TypeScript-first unless task explicitly targets another language.
- Favor explicit types over loosely typed objects.
- Prefer composition over deep inheritance.
- Keep functions and modules focused.
- Preserve backward compatibility unless told otherwise.

## Required end-of-task summary

- Touched files
- What changed
- Validation performed
- Assumptions
- Risks / follow-ups
