#!/usr/bin/env python3
"""
Convert Security Alliance printable SFC checklist PDFs to Markdown.
Requires: pymupdf (fitz)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Install PyMuPDF: pip install pymupdf", file=sys.stderr)
    sys.exit(1)

Q_RE = re.compile(
    r"((?:Do you|Do signers|Is there|Are you|Are your|Are signers|Is your|Is the|Have you|Has |Does |Can you|Do we)\b[^?]+\?)",
    re.I,
)


def pdf_to_single_line(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    raw = "".join(page.get_text() for page in doc)
    doc.close()
    raw = raw.replace("\r", "\n")
    lines = []
    for line in raw.split("\n"):
        s = line.strip()
        if not s:
            continue
        if "frameworks.securityalliance.org" in s:
            continue
        if s.startswith("https://frameworks"):
            continue
        if re.match(r"^\d{1,2}/\d{1,2}/\d{2,4}", s):
            continue
        if re.match(r"^\d+/\d+$", s):
            continue
        if "Printable Checklist (SFC)" in s and s.startswith("SFC:"):
            continue
        lines.append(s)
    return re.sub(r"\s+", " ", " ".join(lines)).strip()


def parse_header(single: str) -> tuple[str, str, str]:
    m = re.match(
        r"^SFC:\s*([^|]+)\|\s*Security Alliance\s*[—-]\s*Security Checklist\s*(.+?)\s*Org:\s*Owner:\s*Date:\s*(.*)$",
        single,
        re.I | re.S,
    )
    if m:
        return m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
    m2 = re.match(r"^SFC:\s*(.+)$", single)
    return (m2.group(1).strip() if m2 else "SFC Checklist"), "", single


def split_sections(rest: str) -> list[str]:
    parts = re.split(r"(?=\d+\.\s*(?:\(cont\.\)\s*)?)", rest)
    return [p.strip() for p in parts if p.strip()]


def score_item_tail(tail: str) -> float:
    """Prefer 3–5 word Title-Case-ish labels before the first question."""
    w = tail.split()
    if len(w) < 2 or len(w) > 6:
        return -1e9
    s = 0.0
    if w[0][0].isalpha() and w[0][0].isupper():
        s += 3.0
    # Typical checklist item titles are 3–4 words
    if len(w) in (3, 4):
        s += 2.0
    elif len(w) in (2, 5):
        s += 1.0
    # Slight preference for tails that do not end mid-phrase
    if tail.endswith(("&", "-", "and", "or")):
        s -= 2.0
    return s


def split_section_heading_and_item(prefix: str) -> tuple[str, str]:
    """
    prefix is text before the first question in a section, e.g.
    '1. Governance & Domain Management Domain Security Owner'.
    Returns (h2 heading, item title).
    """
    prefix = prefix.strip()
    words = prefix.split()
    if len(words) < 5:
        return prefix, ""

    best: tuple[float, str, str] | None = None
    for n in range(2, 7):  # tail word counts to try
        if len(words) <= n:
            continue
        tail = " ".join(words[-n:])
        head = " ".join(words[:-n])
        if not re.match(r"^\d+\.", head):
            continue
        if head.endswith("-"):
            continue
        sc = score_item_tail(tail)
        if sc < 0:
            continue
        hw, tw = head.split(), tail.split()
        if hw and tw and hw[-1].lower() == tw[0].lower():
            sc -= 6.0  # avoid "Management Management…" style PDF line wraps
        # Prefer more words in head (longer section title) when scores tie
        tie = len(head) * 0.01
        total = sc + tie
        if best is None or total > best[0]:
            best = (total, head, tail)

    if best:
        return best[1], best[2]
    return prefix, ""


def clean_between(prev_q_end: int, next_q_start: int, section: str) -> str:
    t = section[prev_q_end:next_q_start].strip()
    return re.sub(r"^Notes:\s*", "", t)


def parse_section(section: str) -> tuple[str, list[tuple[str, str]]]:
    qs = list(Q_RE.finditer(section))
    if not qs:
        return section.strip(), []

    items: list[tuple[str, str]] = []

    # First question: heading + first item title
    prefix = section[: qs[0].start()].strip()
    h2, item0 = split_section_heading_and_item(prefix)
    items.append((item0, qs[0].group(1).strip()))

    for i in range(1, len(qs)):
        between = clean_between(qs[i - 1].end(), qs[i].start(), section)
        items.append((between, qs[i].group(1).strip()))

    return h2, items


def build_markdown(pdf_path: Path) -> str:
    single = pdf_to_single_line(pdf_path)
    title, subtitle, rest = parse_header(single)
    sections = split_sections(rest)

    out: list[str] = []
    out.append("---")
    out.append(f'title: "{title}"')
    out.append(f'source_pdf: "{pdf_path.name}"')
    out.append('source: "https://frameworks.securityalliance.org/"')
    out.append("---")
    out.append("")
    out.append(f"# SFC: {title} | Security Alliance — Security Checklist")
    out.append("")
    if subtitle:
        out.append(f"> {subtitle}")
        out.append("")
    out.append("| Field | Value |")
    out.append("| --- | --- |")
    out.append("| Org |  |")
    out.append("| Owner |  |")
    out.append("| Date |  |")
    out.append("")

    for sec in sections:
        h2, items = parse_section(sec)
        if not h2 and not items:
            continue
        out.append(f"## {h2}")
        out.append("")
        for item_title, q in items:
            if item_title:
                out.append(f"### {item_title}")
                out.append("")
            out.append(f"- [ ] {q}")
            out.append("")

    return post_process_markdown("\n".join(out).rstrip() + "\n")


def post_process_markdown(md: str) -> str:
    """Fix recurring PDF line-wrap / OCR quirks in generated checklists."""
    fixes: list[tuple[str, str]] = [
        (
            "## 2. Risk Assessment & Classification Domain\n\n### Classification and Compliance\n",
            "## 2. Risk Assessment & Classification\n\n### Domain Classification and Compliance\n",
        ),
        (
            "## 1. Governance & Inventory Named\n\n### Multisig Operations Owner\n",
            "## 1. Governance & Inventory\n\n### Named Multisig Operations Owner\n",
        ),
        (
            "## 2. Risk Assessment & Management Multisig Classification and\n\n### Risk- Based Controls\n",
            "## 2. Risk Assessment & Management\n\n### Multisig Classification and Risk-Based Controls\n",
        ),
        (
            "## 6. Emergency\n\n### Operations Emergency Playbooks\n",
            "## 6. Emergency Operations\n\n### Emergency Playbooks\n",
        ),
        (
            "## 3. (cont.) Signer\n\n### Training and Assessment\n",
            "## 3. (cont.) Signer Training and Assessment\n\n",
        ),
        (
            "enterprise- grade",
            "enterprise-grade",
        ),
    ]
    for a, b in fixes:
        md = md.replace(a, b)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    sf = root / "context" / "Security Framework"
    pdfs = sorted(sf.glob("SFC_*.pdf"))
    if not pdfs:
        print("No SFC_*.pdf found", file=sys.stderr)
        sys.exit(1)
    for pdf in pdfs:
        md = build_markdown(pdf)
        out_path = sf / (pdf.stem + ".md")
        out_path.write_text(md, encoding="utf-8")
        print(f"Wrote {out_path.relative_to(root)}")


if __name__ == "__main__":
    main()
