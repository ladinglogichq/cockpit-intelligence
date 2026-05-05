"""
Convert all *-RDTII.xlsx files in context/ to markdown files in context/domain/rdtii-scores/.
Each xlsx has one sheet with columns:
  Chapter, Question, Question: description, Individual Indicator Score,
  Source Legislation, Impact, Timeframe for Indicator,
  References, References 2, References 3, References 4, Overall Pillar Score

Usage: python3 scripts/convert-rdtii-xlsx.py
"""
import openpyxl
import os
import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
IN_DIR = REPO_ROOT / "context"
OUT_DIR = REPO_ROOT / "context" / "domain" / "rdtii-scores"

def clean(val):
    if val is None:
        return ""
    s = str(val).replace("\xa0", " ").strip()
    return s

def xlsx_to_md(xlsx_path: Path) -> str:
    iso = xlsx_path.stem.replace("-RDTII", "")  # e.g. "SGP"
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return f"# {iso} RDTII Score Data\n\nNo data found.\n"

    country = ws.title  # sheet name is the country name
    headers = [clean(h) for h in rows[0]]

    lines = [
        f"# {country} ({iso}) – RDTII Regulatory Score Data",
        f"\nSource: UNESCAP RDTII Assessment  \nISO3: {iso}\n",
    ]

    current_chapter = None
    current_pillar_score = None

    for row in rows[1:]:
        if not any(v for v in row):
            continue
        d = {headers[i]: clean(row[i]) for i in range(min(len(headers), len(row)))}

        chapter = d.get("Chapter", "")
        question = d.get("Question", "")
        description = d.get("Question: description", "")
        score = d.get("Individual Indicator Score", "")
        legislation = d.get("Source Legislation", "")
        impact = d.get("Impact", "")
        timeframe = d.get("Timeframe for Indicator", "")
        pillar_score = d.get("Overall Pillar Score", "")

        refs = [d.get(k, "") for k in ["References", "References, 2", "References, 3", "References, 4"]]
        refs = [r for r in refs if r and r not in ("None", "")]

        if chapter and chapter != current_chapter:
            current_chapter = chapter
            lines.append(f"\n## Chapter {chapter}")

        if pillar_score and pillar_score != current_pillar_score and pillar_score not in ("None", "0", ""):
            current_pillar_score = pillar_score
            lines.append(f"\n**Overall Pillar Score: {pillar_score}**")

        lines.append(f"\n### Indicator {question}: {description}")
        lines.append(f"- **Score:** {score}")
        if legislation:
            lines.append(f"- **Source Legislation:** {legislation}")
        if impact:
            lines.append(f"- **Evidence/Impact:** {impact}")
        if timeframe:
            lines.append(f"- **Timeframe:** {timeframe}")
        if refs:
            lines.append(f"- **References:** {' | '.join(refs)}")

    return "\n".join(lines) + "\n"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    xlsx_files = sorted(IN_DIR.glob("*-RDTII.xlsx"))
    print(f"Found {len(xlsx_files)} RDTII xlsx files")

    for xlsx_path in xlsx_files:
        iso = xlsx_path.stem.replace("-RDTII", "")
        out_path = OUT_DIR / f"{iso.lower()}.md"
        try:
            md = xlsx_to_md(xlsx_path)
            out_path.write_text(md, encoding="utf-8")
            print(f"  ✓ {iso} → {out_path.name} ({len(md)} chars)")
        except Exception as e:
            print(f"  ✗ {iso}: {e}")

    print(f"\nDone. {len(xlsx_files)} files written to context/domain/rdtii-scores/")

if __name__ == "__main__":
    main()
