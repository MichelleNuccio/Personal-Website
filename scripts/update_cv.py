#!/usr/bin/env python3
"""Refresh the static CV timeline from data/experiences.xlsx using Python's standard library."""

from collections import defaultdict
from datetime import date, timedelta
from html import escape
from pathlib import Path
import re
import sys
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
HEADERS = ("Category", "Start month", "End month", "Title", "Details", "Notes", "Mark")
CATEGORIES = {
    "Education": "#",
    "Collaborations": "+",
    "Exhibitions": "@",
    "Personal Projects": "*",
    "Awards & Scholarships": "%",
    "Work Experience": "&",
    "Teaching Experience": "=",
}

LEGACY_CATEGORIES = {
    "Collaboration": "Collaborations",
    "Exhibition": "Exhibitions",
    "Personal Project": "Personal Projects",
    "Prize": "Awards & Scholarships",
}


def spreadsheet_rows(path):
    with ZipFile(path) as book:
        strings = []
        if "xl/sharedStrings.xml" in book.namelist():
            shared = ET.fromstring(book.read("xl/sharedStrings.xml"))
            strings = [
                "".join(node.text or "" for node in entry.findall(".//x:t", NS))
                for entry in shared.findall("x:si", NS)
            ]
        sheet = ET.fromstring(book.read("xl/worksheets/sheet1.xml"))

    for row in sheet.findall("x:sheetData/x:row", NS):
        cells = {}
        for cell in row.findall("x:c", NS):
            column = cell.attrib["r"].rstrip("0123456789")
            value = cell.findtext("x:v", "", NS)
            if cell.get("t") == "s":
                value = strings[int(value)]
            elif cell.get("t") == "inlineStr":
                value = "".join(node.text or "" for node in cell.findall(".//x:t", NS))
            cells[column] = value.strip()
        yield int(row.attrib["r"]), tuple(cells.get(column, "") for column in "ABCDEFG")


def parse_month(value):
    if re.fullmatch(r"\d{4}-\d{1,2}", value):
        year, month = map(int, value.split("-"))
        return date(year, month, 1)
    if re.fullmatch(r"\d+(?:\.\d+)?", value):
        return (date(1899, 12, 30) + timedelta(days=int(float(value)))).replace(day=1)
    return date.fromisoformat(value).replace(day=1)


def paragraph_lines(text, css_class):
    return [
        f'      <p class="{css_class}">{escape(line)}</p>'
        for line in text.splitlines() if line.strip()
    ]


def render_cv(workbook):
    rows = iter(spreadsheet_rows(workbook))
    if next(rows, (0, ()))[1] != HEADERS:
        raise ValueError("The first row must contain the original column headers.")

    blocks = defaultdict(list)
    months_by_year = {}
    dialogs = []
    for row_num, values in rows:
        if not any(values):
            continue
        category, start_value, end_value, title, details, notes, mark = values
        category = LEGACY_CATEGORIES.get(category, category)
        if category not in CATEGORIES or not title:
            raise ValueError(f"Row {row_num}: select a valid category and enter a title.")
        try:
            start = parse_month(start_value)
            finish = parse_month(end_value) if end_value else start
        except (ValueError, OverflowError) as exc:
            raise ValueError(f"Row {row_num}: use a valid start and end month (YYYY-MM).") from exc
        if finish < start:
            raise ValueError(f"Row {row_num}: end month precedes start month.")

        marked = mark.casefold() in {"yes", "si", "sì", "true", "1"}
        dialog_id = f"cv-experience-{row_num}"
        year_end = finish.strftime("%B %Y")
        if start == finish:
            period = year_end
        elif start.year == finish.year:
            period = f"{start:%B}–{year_end}"
        else:
            period = f"{start:%B %Y}–{year_end}"
        dialogs.extend([
            f'    <dialog class="event-dialog" id="{dialog_id}" aria-labelledby="{dialog_id}-title">',
            '      <button class="event-dialog-close" type="button" aria-label="Close">×</button>',
            f'      <p class="event-dialog-category">{escape(category)} · {period}</p>',
            f'      <h2 id="{dialog_id}-title">{escape(title)}</h2>',
            *paragraph_lines(details, "event-dialog-status"),
            *paragraph_lines(notes, "event-dialog-publication"),
            "    </dialog>",
            "",
        ])

        for year in range(start.year, finish.year + 1):
            first = start.month if year == start.year else 1
            last = finish.month if year == finish.year else 12
            months_by_year[year] = max(last, months_by_year.get(year, 0))
            blocks[year, category].append((first, last, marked, dialog_id, title, period))

    lines = []
    if not months_by_year:
        return '              <tr><td colspan="8">No experiences recorded.</td></tr>', ""

    newest = max(months_by_year)
    for year in range(newest, min(months_by_year) - 1, -1):
        months = months_by_year[newest] if year == newest else 12
        lines.extend([
            f'              <tr style="--months-in-row: {months}">',
            f'                <th scope="row"><span class="year-number">{year}</span></th>',
        ])
        for category, symbol in CATEGORIES.items():
            lines.append("                <td>")
            for first, last, marked, dialog_id, title, period in sorted(
                blocks[year, category], key=lambda block: (block[2], block[0] - block[1])
            ):
                top = (months - last) / months * 100
                height = (last - first + 1) / months * 100
                label = escape(f"{title}, {period}")
                card_mark = f'<span class="event-trigger-symbol" aria-hidden="true">{escape(symbol)}</span>' if marked else ""
                lines.append(
                    f'                  <button class="event-trigger" style="--event-top: {top:.6f}%; '
                    f'--event-height: {height:.6f}%" data-event-group="{dialog_id}" type="button" '
                    f'aria-label="{label}" aria-haspopup="dialog" aria-expanded="false" '
                    f'aria-controls="{dialog_id}">{card_mark}</button>'
                )
            lines.append("                </td>")
        lines.append("              </tr>")

    return "\n".join(lines), "\n".join(dialogs).rstrip()


def replace_section(text, label, content):
    start_marker = f"<!-- {label}:start -->"
    end_marker = f"<!-- {label}:end -->"
    before, remaining = text.split(start_marker, 1)
    _, after = remaining.split(end_marker, 1)
    indent = before.rsplit("\n", 1)[-1]
    return f"{before}{start_marker}\n{content}\n{indent}{end_marker}{after}"


def main():
    workbook = ROOT / "data" / "experiences.xlsx"
    page = ROOT / "cv.html"
    rows, dialogs = render_cv(workbook)
    html = replace_section(page.read_text(encoding="utf-8"), "experience-rows", rows)
    html = replace_section(html, "experience-dialogs", dialogs)
    page.write_text(html, encoding="utf-8")
    print("Updated cv.html from data/experiences.xlsx")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError) as exc:
        sys.exit(str(exc))
