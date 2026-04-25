# RBAC and audit

Role definitions, permission expectations, and audit logging for Cockpit regulation intelligence operations. **Not legal advice**; map to your org's compliance program.

**Related:** [entities.md](./entities.md) (**AuditTrace**), [evidence-pipeline.md](./evidence-pipeline.md) (pipeline stages and agent responsibilities).

---

## Roles

| Role | Purpose |
| ---- | ------- |
| **viewer** | Read-only dashboards, evidence records, pillar mappings (no exports if policy restricts) |
| **analyst** | Review evidence, verify/dispute mappings, add annotations; cannot change global config |
| **lead** | Approve or reject disputed mappings, manage jurisdiction assignments, configure pipeline parameters |
| **admin** | Users, roles, integrations, retention policies, feature flags |

Optional: **compliance** — read-only plus export for supervised channels (define per deployment).

---

## Permission matrix (reference)

| Action | viewer | analyst | lead | admin |
| ------ | :----: | :-----: | :--: | :---: |
| View evidence / mappings / documents | ✓ | ✓ | ✓ | ✓ |
| Verify or dispute PillarMapping | — | ✓ | ✓ | ✓ |
| Reject PillarMapping | — | — | ✓ | ✓ |
| Assign jurisdiction to analyst | — | — | ✓ | ✓ |
| Retract published EvidenceRecord | — | — | ✓ | ✓ |
| Configure integrations / secrets | — | — | — | ✓ |
| Manage users / roles | — | — | — | ✓ |

---

## Audit

- **AuditTrace** records (see [entities.md](./entities.md)) for: mapping verification/dispute/rejection, jurisdiction assignment changes, role grants, integration config changes, export/download of evidence packs.
- **Immutability** — Append-only; corrections use new events with references.
- **Retention** — Align with legal hold and product policy; export formats for regulators are deployment-specific.

---

## Sensitive actions (must emit AuditTrace)

- PillarMapping **rejection** after prior verification
- EvidenceRecord **retraction** after publication
- **Role** or permission change
- **Bulk export** of evidence records
- **Override** of confidence scores or pipeline parameters
- **Manual edit** of clause excerpts or pillar assignments

---

## Non-goals

- This file does not define **authentication** mechanism (SSO, OAuth, API keys); only **authorization** semantics.
- Legal interpretation of extracted clauses is **out of scope** here; the system stores references and scores, not legal verdicts.
