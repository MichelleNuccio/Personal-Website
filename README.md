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

## Preview the projects

The gallery shows the projects in this order.

1. Maru. Mare Debole (`data/progetto-02.docx`)
2. Ec(h)o-es in the Rings (`data/progetto-03.docx`)
3. Left(L)overs (`data/progetto-04.docx`)
4. Agenda Urbana Brescia 2050 (`data/progetto-01.docx`)

Open `cv.html` through a local HTTP server. When you save a project document,
its card refreshes within about two seconds while
the preview tab is visible. The preview converts headings, text, lists, tables,
links and supported images to web content. Word-specific layout and animations
are not converted.

## Public guestbook

The guestbook in `cv.html` loads and posts public entries through the
`michelle-nuccio-guestbook` Sites service. The website remains on GitHub Pages.
The separate service repository is checked out locally in `guestbook-service/`.
It stores entries in its D1 database.
