# Feature plan — Those Flowers are for you <3

Planning document for what the project includes, why, and what remains optional.

## Goal

Present the semester’s computational design exercises as one coherent project website, not a folder of demos.

## Build pillars

1. **Make** — interactive canvases (2D → 3D → data → geo → engagement → agent)
2. **Frame** — explicit aesthetic priorities + per-canvas contextual statements
3. **Document** — README + style / features / ideas markdown for context engineering
4. **Organize** — named files under `projects/those-flowers/` with data and JS separated

## Feature inventory

### Shipped

| Feature | Status | Notes |
|---------|--------|-------|
| Landing portfolio link to project | Done | Root archive card `#03` |
| Aesthetic priority header | Done | Neon meadow / terminal / daisy thesis |
| Canvas 01–04 P5 studies | Done | Step draw, night outlines, 3D bouquet, petal game |
| Canvas 05 Temporal Bloom | Done | Inline D3 + monthly GBIF proxy counts |
| Canvas 06 Relational network | Done | `js/relational-network.js` |
| Canvas 07 Italy map | Done | MapLibre + `data/bellis-perennis-it.geojson` |
| Canvas 08 Daisy Globe | Done | Year rail + global GeoJSON |
| Canvas 09 Sound Garden | Done | Firebase or demo `localStorage` |
| Canvas 10 Garden Agent | Done | OpenAI + optional Firebase; local secrets |
| Project docs | Done | `README.md`, `docs/STYLE.md`, this file, `PROJECT-IDEAS.md` |

### Optional polish (next)

| Feature | Priority | Why |
|---------|----------|-----|
| Extract timeline JS to `js/temporal-bloom.js` | Medium | Match “one file per canvas” clarity |
| Shared Firebase config module | Medium | Avoid duplicating placeholders |
| Accessibility pass (focus, reduced motion) | Medium | Course + public GitHub Pages |
| Printable / PDF project statement | Low | Studio review handout |
| Multilingual IT/EN toggle | Low | Author is bilingual |

## Non-goals

- Rebuilding the whole portfolio inside this project page
- Publicly committing OpenAI keys
- Turning every canvas into a heavy SPA framework

## Acceptance checklist (final assignment)

- [x] Clear structured layout
- [x] Explicit aesthetic priorities
- [x] Contextual statement per canvas (intent / interaction / data or refs)
- [x] Site reads as class summary + project
- [x] Organized files + documentation markdown
- [ ] Firebase live keys configured (student-side)
- [ ] OpenAI key only in local ignored file (student-side)
