# Style system — Those Flowers are for you <3

Context-engineering notes for visual language, tone, and UI decisions.

## Thesis

Digital flowers are acts of kindness. The interface should feel tender and technical at once: a night garden built like an archive terminal.

## Priority order (do not invert)

1. **Daisy thesis first** — every new feature should reinforce *Bellis perennis*, care, seasonality, or ecology.
2. **Neon meadow palette** — fuchsia on near-black; avoid generic purple-indigo AI gradients and cream/terracotta tropes.
3. **Terminal garden chrome** — Courier/monospace, hairline neon borders, panel logic over card clutter.
4. **Clarity of interaction** — one primary action per canvas when possible (draw, pluck, plant, ask).

## Color tokens

| Token | Value | Use |
|-------|-------|-----|
| Night soil | `#09010f` | Page background |
| Neon petal | `#ff9adf` | Borders, glow, accents |
| Soft petal | `#ffb0e8` / `#ffd1f4` | Titles, readable text |
| Bloom core | `#ffd640` | Centers, status sparks |
| Cyan index | `#20e7ff` | Data curves / live status |

## Typography

- Primary: `"Courier New", monospace` (instrument / archive voice)
- Hierarchy via size + letter-spacing, not decorative fonts
- Body copy stays short; denser explanation goes into `canvas-meta` lists

## Layout rules

- Desktop: two-column canvas grid; full-bleed panels for maps, sound, chat
- Each panel: **kicker → title → intent → meta (interaction / methods / data)** then the live object
- Header states aesthetic priorities before the garden begins
- Prefer one composition per viewport section; avoid dashboard chrome in canvases

## Motion

- Soft glow and slow drift over bouncey UI noise
- Interactions should feel like tending (step, pluck, plant), not gaming power-ups

## Anti-patterns

- Flat single-color marketing hero with inset cards
- Purple glow stacks and rounded-full pill clusters
- Unlabeled interactive sketches without contextual statement
- Hard-coding secrets into committed JS

## Voice

Gentle, precise, slightly poetic. Prefer “garden / bloom / care” metaphors over “AI / platform / product” language.
