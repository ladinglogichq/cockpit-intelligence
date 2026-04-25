# Scoring rubric

Rules for **Alert.priorityScore** and related ranking so batch jobs, streaming paths, and agents **do not diverge**.

**Related:** [entities.md](./entities.md) (Alert fields), [integrations.md](./integrations.md) (trust signals from sources).

---

## Inputs

| Dimension | Description | Typical range |
| --------- | ----------- | ------------- |
| **Severity** | Business impact of the finding | Maps to `low`–`critical` |
| **Confidence** | Model / rule confidence in the finding | 0–1 |
| **Entity criticality** | Highest criticality among linked entities (e.g. treasury, sanctioned-adjacent) | 0–1 policy |
| **Source trust** | From Source.trustScore or equivalent | 0–1 |
| **Timeliness** | Recency of observation (half-life decay) | 0–1 |

Optional tie-breakers (same score): earlier **createdAt**, higher **severity** enum order, then lower **id** lexicographic.

---

## Priority score (0–100)

Single comparable number for queues and dashboards.

**Formula (version 1):**

```
priorityScore = round(
  40 * severityWeight +
  25 * confidence +
  20 * entityCriticality +
  10 * sourceTrust +
  5 * timeliness
)
```

**severityWeight** by Alert.severity:

| Severity | Weight |
| -------- | ------ |
| `low` | 0.25 |
| `medium` | 0.50 |
| `high` | 0.75 |
| `critical` | 1.00 |

**timeliness:** `1.0` if observed within 1h, linear decay to `0.0` at 7d (tune per deployment).

**Clamp:** `priorityScore` is clamped to **0–100** after rounding.

---

## Bands (for UI and routing)

| Band | Range | Typical handling |
| ---- | ----- | ------------------ |
| P0 | ≥ 85 | Immediate queue |
| P1 | 70–84 | Same-day |
| P2 | 50–69 | Backlog by date |
| P3 | < 50 | Scheduled / low-touch |

Bands are **labels**; the numeric **priorityScore** remains the sort key.

---

## Governance

- Any change to weights, bands, or inputs requires a **version bump** (e.g. `scoringRubricVersion` on Alert or deployment config).
- Affect triage queues: announce in release notes; run shadow mode when possible.
- Regression tests: fixed fixture alerts must produce stable scores for a frozen rubric version.

---

## Non-goals

- This rubric does **not** replace legal or compliance review for sanctions or filing decisions.
- Do not expose raw provider scores as domain **priorityScore** without mapping through this rubric.
