# GardenOS — Documentary

This folder is the **evidence trail** of building GardenOS, kept with a view to a
future website / visualiser of *how it was made*. The making is treated as a
second artwork in its own right.

## How it works (the rule)

> **Every meaningful step hands off something here.** A decision, a trial, a
> finding — each gets a row in `LOG.md`, a node in `manifest.json`, and (where
> there's something to see) a frame in `captures/`.

## Contents

| File | Role |
|------|------|
| `LOG.md` | Human-readable chronological narrative — question → decision → artifact → learned, per step. |
| `manifest.json` | The same trail as **structured data**. The eventual visualiser reads this directly; no re-keying. |
| `captures/` | Visual evidence — screenshots / exported frames per step. Named `stepNN-label.png`. |
| `README.md` | This file. |

## The schema (so the visualiser is easy)

Each step in `manifest.json` is:

```json
{
  "id": "NN-slug",
  "date": "YYYY-MM-DD",
  "title": "...",
  "kind": "decision | build | finding",
  "tool": "optional — what it was built with",
  "question": "what this step was trying to answer",
  "decision": "what was chosen and why",
  "learned": "what we now know that we didn't",
  "artifacts": ["relative/paths"],
  "captures": ["captures/...png"]
}
```

A timeline UI is then almost free: one card per step, captures as the visual,
`question → decision → learned` as the body, `kind` as the colour. The
`openThreads` array is the live to-do.

## Status

4 steps logged (00 reframe → 03 living canvas). Latest finding: bloom is
drowning behavioural legibility — the central beauty-vs-readability tension,
surfaced on the first shader frame. See `LOG.md` Step 03.
