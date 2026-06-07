# GardenOS — Architecture

> The advanced target. This is the spec the trials are climbing toward, written
> down so the ambition is on record and Trial 05+ build against something real
> rather than improvising. It is also a documentary node: it marks the moment we
> stopped sketching output and started building the system.

## The one principle

**The biology must be a system, not a keyframe.** Bloom, competition, spread,
succession and year-over-year change must *emerge* from a simulation — never be
hand-typed. Trials 01–03 keyframed all of it (plants on timers). That was correct
for testing the *look*; it is not GardenOS. GardenOS is the engine underneath.

A second principle follows from it: **the renderer must consume an abstract state
stream, not named plants.** If a tulip and a stock price and a relationship are
all just *fields of numbers evolving over time*, the same renderer paints all
three — and "the garden is only the first dataset" becomes true instead of a slide.

## The five layers (and what's real vs. faked today)

| Layer | Role | Trial 03 status |
|-------|------|-----------------|
| 1 · **Garden Model** | Parameters: species, rates, palettes, season windows, competition matrix. Pure data (JSON). | hardcoded JS arrays |
| 2 · **Ecological Engine** | GPGPU simulation. Density fields evolve via diffusion + competition + season. State persists across years. | **faked** (timers) |
| 3 · **Interpretation Engine** | Maps abstract state → visual behaviour (field / front / mass / ignition), data-driven. | hardcoded GLSL `if/else` |
| 4 · **Renderer** | HDR composite → bloom pyramid → tonemap → output. | naive 80-tap bloom |
| 5 · **AI Gardener** | Sets Layer-1 params, proposes successions/palettes, critiques outputs. | absent |

Trial 05's job: **build Layer 2 for real**, and route Layer 3/4 to read its output.

## Layer 2 — the ecological substrate (the core)

**Data lives in textures, evolves on the GPU.** A single RGBA float field, stepped
with ping-pong framebuffers as a *data substrate* (not a visual trail):

```
state.r = species A density   (e.g. spring coloniser)
state.g = species B density   (e.g. summer structural)
state.b = species C density   (e.g. shade mass)
state.a = R, shared resource / light availability
```

Every texel is a cell. A 512×288 grid is ~147k cells vs. Trial 03's 16 markers.

**The update (spatial Lotka–Volterra with a shared resource):** per texel, per
substep,

```
lap_i   = isotropic 9-point Laplacian of species i
growth_i= r_i(day) · u_i · R · (1 − Σ_j u_j)     // shared carrying capacity ⇒ competition
death_i = m_i · u_i
u_i'    = clamp( u_i + dt·( D_i·lap_i + growth_i − death_i ), 0, 1 )
R'      = clamp( R + dt·( D_R·lap_R + inflow·(1−R) − consume·Σ growth_i ), 0, 1 )
```

What this buys, all **emergent**, none animated:
- **Spread** — diffusion pushes colonies into empty, resource-rich space → expanding fronts.
- **Competition** — `(1 − Σu_j)` means species fight for the same ground; fronts collide.
- **Succession** — `r_i(day)` is a seasonal *temporal niche*: each species grows only
  in its window, recedes outside it, freeing resource for the next. The year becomes
  a wave of takeovers.
- **Memory** — the field *is* the state. Residual density at year-end seeds next year,
  so **Year 5 ≠ Year 1**. Multi-year evolution for free.

Stability: explicit 5/9-point Laplacian needs `D·dt < 0.25`; keep `D ≤ 0.2`, `dt = 1`,
run 4–8 substeps per displayed frame. Toroidal (repeat) wrap so a gallery loop has no edge seams.

## Layer 3 — interpretation (data, not code)

Each species maps its density field to a **behaviour primitive** with parameters:

```json
{ "field":  { "palette": ["#16331a","#f23c46","#ffc73f"], "warmShift": true } }   // tulip
{ "front":  { "palette": ["#9a5cf0"], "edgeGain": 1.6 } }                          // allium → structure from RD fronts
{ "mass":   { "palette": ["#1a3a52"], "subtractive": true } }                      // hosta → removes warmth
{ "ignite": { "palette": ["#ff241a"], "threshold": 0.7 } }                          // poppy → only bright cells fire
```

Key upgrade over Trial 03: **structure comes from the simulation, not a drawn ring.**
The allium "ring" was a keyframe trick; in the substrate, reaction-diffusion fronts
*are* the structure — we pick them out with gradient magnitude (`edgeGain`) instead of
drawing a circle. More honest, and it generalises to any dataset.

## Layer 4 — render pipeline

`composite (HDR) → threshold bloom → ACES tonemap → vignette → output`

- **Threshold bloom** (the Step-04 finding, now a permanent rule): bloom only the
  bright tail, protect cores. Advanced form: a **dual-filter (Kawase) pyramid** —
  downsample/upsample chain — which is cheap and scales to 4K/LED where the 80-tap
  brute force bands and stalls.
- HDR half-float throughout; tonemap once at the end.

## Layer 5 — AI gardener (later)

With a real Layer 1+2, the AI has something to act on: tune competition coefficients
and season windows, propose palettes/successions, and **critique rendered years**
(select the good ones). Curator and composer, never per-frame renderer.

## Output targets

| Stage | Path |
|-------|------|
| now | HDMI → monitor/projector, full-screen browser |
| installation | 4K projection; locked frame-rate; long loop |
| LED | sim grid → pixel state → **Art-Net / DMX / WLED**; gamma calibration for the panel |

## Trial → architecture map

| Trial | Builds | Proves |
|-------|--------|--------|
| 01 | Layer 3 vocabulary (p5) | behaviour-as-verb is legible |
| 03 | Layer 4 look | gallery quality is reachable; **threshold bloom** |
| **05** | **Layer 2 substrate** (GPGPU RD ecology) | the biology can be a *system*; succession + multi-year emerge |
| 06+ | Layer 3 as data; Trial 02 (non-garden dataset) | the renderer is dataset-agnostic |
| later | Layer 5 AI gardener; LED output | the full suite |

## What deliberately stays simple in Trial 05

Honesty for the documentary: Trial 05 is the *substrate* probe, not the finished
engine. It will (a) hardcode 3 species rather than load Layer-1 JSON, (b) use a
single RGBA field (3 species + resource) rather than arbitrary N, (c) keep the
80-tap bloom rather than the Kawase pyramid. Those are the next ceilings, named in
advance so they don't masquerade as done.
