# Those Flowers are for you <3

Columbia GSAPP · Computational Design Workflows · Michelle Nuccio

A final project website that gathers class exercises into one interactive garden. Virtual flowers act as small gestures of kindness inside algorithmic space.

## Live page

- Project: `projects/those-flowers/index.html`
- Portfolio entry points from the site root `index.html` → archive card `#03`

## Aesthetic priorities (explicit)

1. **Neon meadow** — night black `#09010f` + bubblegum fuchsia `#ff9adf`
2. **Terminal garden** — monospace, bordered panels, archive/instrument UI
3. **Daisy thesis** — *Bellis perennis* as recurring subject across drawing, data, maps, and agents

See `docs/STYLE.md` for the full style system.

## Canvases (assignment summary)

| # | Name | Class lineage | Key interaction / data |
|---|------|---------------|------------------------|
| 01 | Signal Bloom | P5 2D | Step drawing |
| 02 | Night Garden | P5 2D | Outline atmosphere |
| 03 | Data Bouquet | P5 WEBGL | Orbit 3D bouquet |
| 04 | M'ama Non M'ama | P5 WEBGL | Pluck petals |
| 05 | Temporal Bloom | Temporal / D3 | GBIF monthly Italy counts |
| 06 | Relational Structures | Actor-network / D3 | Force graph of daisy ecology |
| 07 | Geospatial Bloom | Geospatial / MapLibre | Italy GBIF GeoJSON |
| 08 | Daisy Globe | Global geospatial | Year-filtered world occurrences |
| 09 | Sound Garden | Engagement | Mood + song → collective flowers |
| 10 | Garden Agent | Agents | OpenAI + optional Firebase chat |

## Folder structure

```
projects/those-flowers/
  index.html          # project page
  styles.css          # neon meadow UI
  README.md           # this file
  docs/
    STYLE.md          # aesthetic / context engineering
    FEATURES.md       # feature plan
    PROJECT-IDEAS.md  # future directions
  data/               # GeoJSON datasets
  js/                 # one file per canvas / feature
```

## Secrets

Do **not** commit API keys. Local OpenAI key lives in `js/garden-agent.local.js` (gitignored).

## Documentation map

- Style & visual language → `docs/STYLE.md`
- Feature planning & build order → `docs/FEATURES.md`
- Project ideas / next blooms → `docs/PROJECT-IDEAS.md`
