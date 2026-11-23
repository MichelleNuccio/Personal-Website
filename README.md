# Michelle Nuccio — Personal Website

Static CV and project gallery for GitHub Pages.

## Structure

| Path | Purpose |
|------|---------|
| `cv.html`, `cv.css` | Coded Curriculum and project gallery |
| `data/experiences.xlsx` | Editable source for the CV timeline |
| `data/progetto-*.docx` | Editable drafts for the five project pages |
| `js/cv.js` | Project gallery and experience popups |
| `scripts/update_cv.py` | Regenerates the timeline from Excel |

Serve the repository root with a local static web server to preview the site.
GitHub Pages serves the generated CV as a static page.

## Update the CV timeline

1. Open `data/experiences.xlsx` in Excel. Add, edit, or delete one row per experience.
   Use the category names shown in the CV legend and enter months as `YYYY-MM`.
   Leave **End month** blank for an experience lasting one month.
   **Details** and **Notes** appear in the popup. Set **Mark** to `Yes` to show the
   category symbol on the block.
2. Save the workbook and run `python3 scripts/update_cv.py` from the repository root.
3. Preview `cv.html` and commit both the workbook and the updated HTML when ready to push.

## Preview Projects 01, 02 and 03

Open `cv.html` through a local HTTP server, then edit and save
`data/progetto-01.docx`, `data/progetto-02.docx`, or `data/progetto-03.docx`. The corresponding card refreshes within about two seconds while
the preview tab is visible. The preview converts headings, text, lists, tables,
links and supported images to web content. Word-specific layout and animations
are not converted.
