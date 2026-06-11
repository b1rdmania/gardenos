# GardenOS — Build Log

> Documentary evidence of building GardenOS, a living canvas that renders
> *ecological time* as light. Every step records the **question** it was
> trying to answer, the **decision** taken, the **artifact** produced, and
> what was **learned** — so the process itself becomes the second artwork.
>
> This log is the human-readable view. `manifest.json` is the same trail as
> structured data, for the eventual "how we built it" visualiser.

---

## Step 00 — The reframe
**Date:** 2026-06-06
**Question:** Is GardenOS an "AI garden visualiser"?
**Decision:** No. The interesting object is not a *picture of a garden* but the
**experience of a garden through time**. Most digital art is spatial; gardens
are temporal. The artwork is the emergence → bloom → decline → return of life
over a year, rendered as light rather than image.
**Core unsolved problem named:** *What does a plant mean when it stops being a
flower and becomes a pixel?* Every later step is a probe at this one question.
**Artifacts:** white paper / architecture sketch (5-layer: Garden Model →
Ecological Engine → Interpretation Engine → Renderer → AI Gardener).

---

## Step 01 — Trial 01 · Ecological Time (p5.js)
**Date:** 2026-06-06
**Question:** Can temporal abstraction read as both *beautiful* AND *legible* —
can you tell species apart from behaviour alone, with no representational drawing?
**Decision:** Smallest possible probe. One self-contained p5.js file, ~40s per
year, looping. Throw away the entire stack (R3F, shaders, LED, AI) and test only
the interpretation layer. Each species is a **verb, not a picture**:

| species  | verb            | visual behaviour                         |
|----------|-----------------|------------------------------------------|
| tulip    | colour field    | green → bloom → gold, then absorbed       |
| allium   | expanding ring  | a pulse of structure                      |
| foxglove | vertical spire  | bloom travels up the stalk                |
| hosta    | shadow mass     | a *cool* swell — life as absence          |
| poppy    | brief ignition  | short, violent, then a fading scar        |

**Artifact:** `../trial-01-ecological-time.html`
**Why this first:** if it reads as undifferentiated mush, the model needs more
behavioural vocabulary before *any* renderer work is worth doing.

---

## Step 02 — Direction fork (user decision)
**Date:** 2026-06-06
**Question:** After Trial 01, push the *thesis* (non-garden dataset) or the
*beauty* (shaders)? And what is the real end-form?
**Decision:** **Chase the beauty.** End-form = **gallery / installation piece.**
**Rationale:** the earlier caution ("glow flatters a weak data model") only binds
when the data model is the product. For an installation, *presence and beauty are
the product* — so the shader is the right thing to build next. The choice is
coherent with the end-form, not a detour.

---

## Step 03 — Trial 03 · Living Canvas (Three.js + GLSL)
**Date:** 2026-06-06
**Question:** Does the idea survive the Rothko / LED quality it promises?
**Decision:** Skip R3F's build step (friction for a trial); the thing that
actually matters for gallery work is the **shader**, not React. Single HTML file,
Three.js + raw GLSL, two things that make it read as a light sculpture instead of
p5 circles:
1. **Ping-pong feedback buffer** — each frame decays + diffuses the last, so
   light *bleeds and remembers*. This is the paper's "ecological memory," made real.
2. **Multi-tap bloom + ACES tonemap** — the luminous, soft-clipped quality of
   real LED / projection work.

Garden state computed on CPU per frame (~12 plants, cheap), fed to the shader as
uniform arrays.

**Artifact:** `../trial-03-living-canvas.html`
**Captures:**
- `captures/step03-summer-peak.png` — high summer, allium + foxglove + poppy overlapping
- `captures/step03-spring-tulips.png` — tulips emerging against spring ground

**FINDING (important):** the bloom is **drowning the legibility**. In the summer
capture the foxglove spires and hosta cool-mass read clearly, but the allium ring
has dissolved into glow — the structural behaviour is lost. This is the central
tension of the whole project made visible on the *first* shader frame: **beauty
vs. readability**. For a gallery piece beauty wins, but if every species blurs to
the same soft blob, the "garden" reading collapses into generic light. Next step
must tune bloom strength / radius down, or give each species a sharper signature
that survives bloom (e.g. allium keeps a hard ring core).

**Open threads for next steps:**
- ~~Tune bloom — recover the allium ring.~~ → **done, Step 04.**
- Give hosta a genuinely *subtractive* read (it currently only adds cool light).
- Decide installation framing: aspect ratio, loop length, idle vs. interactive.
- Trial 02 (non-garden dataset) still unbuilt — parked, not abandoned.

---

## Step 04 — Tune bloom · recover the allium ring
**Date:** 2026-06-06
**Question:** Can the structural behaviours (esp. the allium ring) survive the
bloom that gives the piece its gallery quality?
**Decision:** Make bloom act only on *light*, not on everything. Three changes:
1. **Threshold the bloom** — `b = max(b - 0.12, 0) * 1.25` in the present pass, so
   only the bright tail of the field halos; luminous cores stay crisp.
2. **Tighter glow** — tap radius `1.8→1.0`/res.y, weight `1/fr → 1/fr²`
   (faster falloff); overall `bloom 1.15 → 0.62`.
3. **Hard ring core for allium** — added a narrow `core` term (σ≈0.0045) on top of
   the soft halo, so the ring keeps a defined edge even after blur. Also tightened
   the feedback diffusion (`1.4→0.9`) and decay (`0.965→0.955`) so structure isn't
   smeared before it reaches bloom.

**Artifact:** `../trial-03-living-canvas.html` (same file, tuned)
**Capture:** `captures/step04-summer-tuned.png`
**Learned:** the beauty-vs-readability tension is *resolvable*, not a hard
trade-off — the move is **threshold bloom** (bloom the bright tail, protect the
cores) rather than turning bloom down globally. Side-effect: darker ground →
higher contrast → the warm tulip and cool hosta masses also read more distinctly.
This is the reusable principle for every later species: give it a crisp core that
bloom can halo but not erase.

---

## Step 04.5 — Pressure-test: have we taken shortcuts?
**Date:** 2026-06-06
**Question (user):** Are we shipping something live rather than building the full
advanced suite?
**Finding:** Yes — deliberately, but honestly. Trials 01–03 *keyframed the entire
biology* (plants on timers). Three things were real ceilings, not deferred polish:
the simulation didn't exist, everything was hardcoded in one file, and the renderer
capped at 16 entities. The trials were a convincing **mood-board of GardenOS's
output**, not GardenOS. The advanced move (a GPGPU ecological substrate) is also
the *point* of the project — that convergence said: build it now.
**Artifact:** `ARCHITECTURE.md` — the full 5-layer spec + the substrate math, on
record so later trials build against something real.

---

## Step 05 — Trial 05 · Ecological Substrate (Layer 2, for real)
**Date:** 2026-06-06
**Question:** Can the biology be a *system* — can spread, competition, succession
and multi-year change EMERGE from a GPU simulation instead of being keyframed?
**Decision:** GPGPU reaction-diffusion ecology. RGBA half-float field
(3 species + shared resource), ping-pong FBOs as a data substrate, stepped on the
GPU. Spatial Lotka–Volterra: diffusion + shared-carrying-capacity competition +
seasonal growth windows. Sim grid 512×288 ≈ **147k cells** vs. Trial 03's 16.

**Artifact:** `../trial-05-substrate.html`

This step is the documentary's whole justification — it failed twice in
instructive ways before it worked:

**Bug 1 — extinction by diffusion.** First run: all black, "dormant." Isolated
point-spores (one texel at 0.9, empty neighbours) have a huge negative Laplacian
— they lose ~0.14/step to diffusion while in-season growth adds ~0.02. Dead in a
few steps. *Also* the sim ran per-frame, so thousands of steps/year saturated or
killed everything instantly relative to the year.
- *Fix:* seed **smooth FBM patches** (no catastrophic Laplacian); tie the
  timestep to **days elapsed** so the ecology runs on the year's clock; retune
  rates to per-day units.
- *Capture:* `captures/step05-substrate-summer.png` (the extinction) →
  `captures/step05-spring.png` (working: violet colonies, glowing competition
  fronts from gradient-magnitude, cyan shade pools — a real RD field).

**Bug 2 — homogenization to a uniform wash.** By Year 2 the whole field collapsed
to a uniform **gold wash** (`captures/step05-year2-winter.png`). The naive
shared-resource model is *stabilizing*: diffusion + logistic growth smooth to a
uniform saturated field; with low death the residue accumulates until one species
fills all space. The summer structure was transient. **Maintaining heterogeneity
is the central challenge of emergent ecological art.**
- *Fix (textbook ecology, the thing keyframing faked away):* **seasonal clearing
  + patchy reseeding.** Out-of-season die-back (`MD`) clears the canvas each
  winter; each season re-establishes from a patchy, **year-drifting spore rain**
  (`seedPhase`) — preventing both extinction and homogenization, and giving real
  year-to-year novelty. Lowered diffusion so it doesn't smooth to uniform.
- *Captures:* `captures/step05b-autumn.png` (winter now clears to dormant) →
  `captures/step05b-year2-summer.png` (**Year 2 rebuilds full heterogeneous
  structure — Year 2 ≠ Year 1**).

**Learned:** the biology genuinely *can* be a system — succession and multi-year
persistence emerge, not animated. But emergent ecology has a knife-edge:
**too little death → homogenizes; too much → extinction.** Real gardens resolve
this with a seed bank / dispersal; so must we. The keyframed trials sidestepped
the single hardest and most interesting problem in the whole project.

**Honest remaining ceilings (named, not hidden):**
- Aesthetic: the field is coarse / "lava-lamp"; shade-mass tends to dominate area;
  warm spring is only visible in spring. Needs palette + scale + rate tuning.
- Still hardcoded 3 species, not Layer-1 JSON; still the 80-tap bloom, not a
  Kawase pyramid; single RGBA field, not arbitrary N (per ARCHITECTURE.md).
- The substrate is proven; making it *beautiful* and *data-driven* is Trial 06+.

---

## Step 06 — Trial 06 · First-Person Garden (the camera change)
**Date:** 2026-06-06
**Question (user):** "It doesn't really look like a garden, does it?" — looking
*out* over a garden, in first person, with depth layers, growth coming up, and
green as the background.
**Diagnosis:** Trials 01–05 used the wrong *camera*. A top-down abstract field is
a petri dish, not a garden. Nobody stands above a garden — you stand *in* it and
look *out*: foreground border → receding depth → horizon → sky, with vegetation
rising vertically and green as the resting state, blooms as the colour events.
**Decision:** Build a perspective scene (Three.js, real camera + fog):
- **Layered depth** — 12 vegetation billboards at increasing distance; perspective
  scales them, `THREE.Fog` (hazy green) blends the far ones into the background →
  "green is the background" falls out of the atmosphere, not a flat fill.
- **Growth coming up** — a per-column foliage silhouette (fbm) whose height rises
  with a seasonal `growth` curve; vegetation literally grows upward over the year.
- **Blooms** — colour events that rise *through* the foliage tops, bright core +
  halo, palette by season (spring red+gold, summer violet+white, autumn ember).
- Carried the **threshold-bloom + ACES** present pass for the luminous quality.

**Artifact:** `../trial-06-firstperson-garden.html`
**Captures:**
- `captures/step06-summer.png` — first run: depth + green read perfectly, but
  blooms invisible (all green) and caught at low-flowering late summer.
- `captures/step06-spring-bloom.png` — after boosting flowers: **warm red/gold
  blooms rising through a green spring border, layers receding to haze.** The
  brief, met.
- `captures/step06-summer-bloom.png` — violet/white summer palette (washes paler
  than spring — a saturation tweak owed).

**Learned:** the project's whole legibility lived in the *viewpoint*, not the
simulation. The same ecological idea (seasonal growth + flowering) reads as
abstract mush from above and as a *garden* from within. Two bugs en route, both
quick: blooms blew out to white (white "accent" + over-bright core → desaturated;
fixed by keeping blooms mostly saturated colour) and screenshots drifted because
`speed` kept running (added `__setDay`/`__pause` test hooks).

**The honest gap (important):** Trial 06 is driven by a **season curve, not the
Trial 05 substrate.** Growth and flowering are scripted functions of the day, so
spread/competition/succession are *gone* again — we got the camera right but
dropped the emergent ecology to do it. The real synthesis (Trial 07) is to feed
the **substrate's species density fields in as the planting map** for this
perspective renderer: emergent ecology (Trial 05) seen through the first-person
garden camera (Trial 06). Neither half is the whole thing yet.

---

## Step 06b — Trial 06b · Garden Variants (aesthetic fork)
**Date:** 2026-06-06
**Question:** Refine the first-person garden with a few variants to choose a look.
**Decision:** Refactor Trial 06 into a **preset-driven** scene — one file, four
distinct aesthetic stances, switchable live with keys 1–4 (so they're compared
under identical geometry/season, not as separate forks). Each preset drives fog,
sky, ground, vegetation greens, bloom sizing/saturation, per-season flower
palettes, and the post (bloom/exposure/gamma/vignette).
- **1 · Giverny** — painterly, warm hazy light, lush soft coral/gold blooms.
- **2 · Nocturne** — near-black ground, blooms as hot light; the gallery/LED read,
  closest to the project's original Rothko/LED thesis.
- **3 · Meadow** — sunlit dawn, dense fine grasses, golden wildflowers; brightest.
- **4 · Sumi** — muted, fog-heavy, pale sparse blooms, negative space; most
  installation-elegant.

**Artifact:** `../trial-06b-variants.html`
**Captures:** `captures/step06b-1-giverny.png`, `…-2-nocturne.png`,
`…-3-meadow.png`, `…-4-sumi.png` (all spring peak, day 108, frozen).

**Learned:** the four are clearly differentiated and each addresses the
green-wash problem differently. **Shared remaining flaw:** blooms still read as
horizontal aurora-bands hugging the foliage ridge rather than discrete flowers,
plus a foreground seam/streak artifact where the nearest billboard meets the
ground. The real fix is to render blooms as **point sprites / instanced flowers**
rather than a per-column glow term — deferred until a direction is chosen, to
avoid polishing four looks when three get cut.

**Decision:** locked **Nocturne**; order = polish the look, then Trial 07 substrate.

---

## Step 07a — Nocturne locked + blooms as points
**Date:** 2026-06-06
**Question:** Make blooms read as discrete points of light, not aurora-bands.
**Decision:** Nocturne palette. Replaced the per-column bloom glow with a **particle
field** (`THREE.Points`, ~1800) scattered through the garden volume — each sprite
tied to a species season window, rising + igniting in season, fog dissolving the
far ones.
**Artifact:** `../trial-07a-nocturne.html`  · **Capture:** `captures/step07a-bloompoints.png`
**Learned:** points are the right primitive, but alone they read faint against the
bright **foliage silhouette wall** — which the user immediately named as the deeper
problem: the plants are "a square block," not individual plants. → Step 07b.

---

## Step 07b — Brush Strokes (foliage as individual plants)
**Date:** 2026-06-06
**Question (user):** "The plants don't come up in one square block. They should be
individual plants, like brush strokes."
**Decision:** Throw out the billboard silhouette walls entirely. Render the foliage
as **~16,000 individual instanced strokes** — each plant a tapered, camera-facing
(Y-billboarded) brush mark rising from the ground, with per-instance height, width,
shade, species and a 30% flowering chance. Flowering plants ignite an **HDR colour
at the tip** during their species' season, which the threshold-bloom post turns into
a glowing point of light. The whole garden is now a *field of marks*, not painted
blocks — foliage and blooms are both discrete instances.
**Artifact:** `../trial-07b-strokes.html`
**Captures:** `captures/step07b-strokes-spring.png` (pink/red flowering tips among
green strokes), `captures/step07b-strokes-summer.png` (violet/white tips).
**Learned:** the breakthrough the look needed — it reads unmistakably as
*individual plants* receding to the horizon, and instancing handles 16k strokes
comfortably. **Remaining:** it reads as a fairly uniform *meadow* rather than a
structured border — next refinements are **clumping** (group plants into beds/drifts
instead of even scatter), more **height variation / architectural tall plants** for
layers, and the summer violet still washes pale. Then Trial 07 proper: drive the
stroke planting from the Trial 05 substrate (species density → where which strokes
grow), so the brush-stroke garden is genuinely *ecological*, not a season curve.

---

## Step 07c — Plant Types (distinct foliage, clumping, tall plants)
**Date:** 2026-06-06
**Question (user):** Foliage should differ by plant — not the same stroke ×16k.
Plus the things to think about: clumping and tall plants.
**Decision:** Compose the garden from **plant archetypes**, each a different
*arrangement* of strokes with its own foliage colour, shape and flowering
signature — all three notes (varied foliage / clumping / tall plants) fall out of
this one idea:
- **grass** — fine arching tuft (6–12 blades), rarely flowers
- **mound** — low broad blue-green leaves (hosta), foliage only
- **spire** — tall vertical stems, flower up the top third (foxglove)
- **umbel** — tall stem, bright ball of bloom at the tip (allium)
- **daisy** — bushy clump, flower heads near the top
Plants are planted in **drifts/beds** (clustered bed centres + gaussian spread),
not even scatter, with a loose grass matrix between. ~22k instanced strokes;
per-instance foliage colour, shape (archetype), bend/lean, and flower colour+window
passed as attributes (no uniform-array indexing). Spires/umbels give the **height
and layering**; archetype greens give **foliage variety** (blue-green mounds vs
fresh-green spires vs mid-green grass).
**Artifact:** `../trial-07c-plant-types.html`
**Captures:** `captures/step07c-planttypes-spring.png` (grass + mounds foreground,
tall accents emerging), `captures/step07c-planttypes-summer.png` (violet/white
spires & umbels in bloom standing over the green mass).
**Learned:** distinct archetypes + clumping is what turns the uniform meadow into a
*border with structure* — the tall accents reading above the low foliage is exactly
the "layers / coming up" the user kept pointing at. **Remaining:** the tall
spires/umbels read a bit as uniform "light sticks" (vary thickness/curve), summer
violet still washes white (saturation), drifts could be more pronounced, and it's
still a season curve — the Trial 05 substrate synthesis is still the deeper open
thread (now: substrate species density → which archetype is planted where).

---

## Step 07d — Roundness (silhouette shapes)
**Date:** 2026-06-06
**Question (user):** "Everything looks like an agave plant. Not got much roundness."
**Diagnosis:** every stroke tapered to a point, so all forms read as spiky blades.
**Decision:** Give each stroke a **silhouette shape** — a half-width(y) profile —
with genuinely round options, passed per-instance (`iShape`):
- **0 blade** pointed (grass) · **1 leaf** ovate rounded (`sin(πy)^0.55`) ·
  **2 stem** slim soft-tip (spire) · **3 ball** stem + round bloom head
  (`√(1−((y−.85)/.16)²)`, umbel/allium) · **4 bush** soft rounded (daisy) ·
  **5 dome** low cushion (`√(1−y²)`, hummock).
Rebalanced archetype weights toward rounded forms (added a **cushion** archetype);
gave spires/umbels **width + curve variation** so they stop reading as uniform
light-sticks; **tighter drifts** (bed radius 0.5–1.7); **more saturated violet**
and a gentler flower-tip multiplier so it keeps colour instead of clipping white.
**Artifact:** `../trial-07d-roundness.html`
**Captures:** `captures/step07d-roundness-spring.png`,
`captures/step07d-roundness-summer.png` — rounded mounds/leaves + dome cushions
against spiky grass, round bloom-balls on varied tall stems.
**Learned:** roundness comes from the *silhouette profile*, and one `iShape`
attribute unlocks the whole form vocabulary (spiky↔round, tall↔low) cheaply within
the same instanced-stroke system. The garden now reads as mixed planting, not a
single species. **Remaining:** composition is a touch sparse/dark (tighter drifts
left more bare ground — could lift density or fill mid-ground); violet still slightly
pale at peak; and it's still a season curve — substrate synthesis remains the deep
open thread.

---

## Step 08 — Layers Through Time (the model)
**Date:** 2026-06-06
**Input (user):** A full design — the garden as **six ecological layers** (canopy /
woodland floor / vertical accents / pollinators / bulbs / human), **four zones**
(N1: front / woodland / patio / lawn), simulated as **events not plants**, as a time
machine (one year in ~30s). Captured as the North Star → `documentary/MODEL.md`.
**Decision:** Don't try to build all six at once. Build the layer the user said
*drives everything* — the **canopy** — plus the **pollinators**, as the first
event-driven, time-moving systems on top of the 07d stroke garden:
- **Canopy / dappled shade** — a drifting fbm light/shade field (`dapple()`) sampled
  by *both* ground and plants in world XZ, so patches of sun & cool shade move across
  the whole scene. Strength tied to **leaf-on** (full spring–autumn, bare in winter).
  A canopy "curtain" mass hangs into the top of frame.
- **Autumn leaf-fall** (canopy event) — ~320 amber leaf particles falling + swaying,
  amount ramped to the autumn window.
- **Pollinator layer** — ~150 bee/hoverfly motes with erratic two-oscillator flight +
  bobbing, additive, amount tracking late-spring→early-autumn.
- **Event ticker** — the HUD names the year's events as they pass (first bee sighting,
  allium spheres, bay leaf drop begins, autumn seed fall, first frost…).
**Artifact:** `../trial-08-layers.html`
**Captures:** `captures/step08-summer-hum.png` (violet bloom drifts, dappled light
streaks, amber bees), `captures/step08-autumn-leaffall.png` (bay leaves falling over
a declining border, "bay leaf drop begins").
**Learned:** this is the conceptual turn from *a garden* to *layers moving through
time* — the dappled shade alone changes the whole read (the cool-lit foreground
hosta is the single best frame so far), and the pollinators/leaf-fall give the scene
*life* and *events*. Needed a legibility pass: Nocturne + the shade side of the
dapple compounded into murk → lightened the shade, lifted exposure, brightened the
leaves. **Remaining:** the canopy *silhouette* is felt (via dapple) more than seen —
the overhead curtain reads too dark; leaf-fall could be denser/dramatic; and it's
still one zone on a season curve. Next per MODEL.md: zones A–D as regions, the
woodland-floor species named, bulb pulses, the human-trace layer, and eventually the
Trial 05 substrate driving inter-layer dynamics (shade → floor composition) so it's
emergent, not scripted.

---

## Step 09 — Daytime Canopy (the garden is mostly leaves)
**Date:** 2026-06-06
**Input (user):** A photo of the real N1 garden + "we need **daytime**; more nuance
in the **leaves** — the blossom, the changing of colour; we've done the ground but
the ground is not everything."
**Diagnosis:** Every trial built the *floor*. The photo is overwhelmingly **canopy**
— layered tree masses, an acid-yellow Acer, climbers — a wall of foliage in daylight.
The subject is up in the leaves, and the leaves carry the year.
**Decision:** Pivot to **daytime, canopy-first** (Trial 09). New primitives:
- **Foliage masses → leaf-dabs** — ~40k camera-billboarded leaf quads, clustered
  (gaussian ellipsoids) into trees / shrubs / the **yellow Acer** / blossoming shrubs,
  layered back-to-front. Dark **branch** limbs under the big trees.
- **Leaves carry the year** (per-leaf, staggered): spring **leaf-out** (scale 0→1) +
  **blossom** (pale petals on flagged masses) → summer full green → autumn **colour
  turn** (green→varied amber/orange/red, each leaf turning at its own time) + **leaf
  fall** → winter **bare branches** (leaves culled).
- **Blossom-fall** (spring) and **leaf-fall** (autumn) petal particle fields.
- **Daytime palette**: bright overcast sky, pale haze, soft daylight post (only
  highlights bloom) — the opposite of Nocturne.
**Artifact:** `../trial-09-canopy-day.html`
**Captures:** `captures/step09-summer.png` (full green canopy + yellow Acer),
`captures/step09-autumn-turn.png` (**patchy staggered colour turn** — the headline),
`captures/step09-spring-blossom.png` (partial leaf-out + white blossom shrubs).
**Learned:** the leaf-dab mass + per-leaf seasonal logic is exactly the right model
for "nuance in the leaves" — the autumn turn reading patchy (not a uniform recolour)
is the single most convincing seasonal frame we've made. The Acer accent proves
per-mass colour identity. **Remaining:** composition still reads as a *bank across a
lawn*, not **enclosing** — the big trees need to come closer / arch overhead and fill
the top of frame (lots of empty sky + bare foreground ground); branches are faint;
and this daytime canopy now lives apart from the Nocturne ground garden (07–08) —
they need to become **one scene** (canopy + floor + the layer systems together).

---

## Step 10 — The Merge (daytime master)
**Date:** 2026-06-06
**Input (user):** "Daytime is the master. Trunks need to look more organic and
brown. Merge the three — do the canopy framing first. Think of the colours
throughout autumn, especially with maples."
**Decision:** Bring **canopy (09) + woodland floor (07d) + living layers (08:
dapple, pollinators, petals)** into **one daytime scene**, and fix the three notes:
- **Enclosing framing** — canopy masses moved high & near (an overhead mass at
  `y≈9.8, z≈-5`, side trees leaning in) so foliage fills the top and sides; camera
  low looking up. The frame is now *enclosed*, not a bank across a lawn.
- **Organic brown branches** — replaced the dark sticks with a **recursive 3-D
  branch generator** (`grow()`): trunk → 2–3 sub-branches per level, tapering,
  woody brown, rendered as camera-billboarded thick-line segments. Real trees now.
- **Maple autumn** — each leaf carries **base green + autumn-MID + autumn-LATE**
  stops and progresses green→gold→red across a *staggered* turn; the **maple** mass
  uses gold→**scarlet** while other trees go yellow→amber/brown. The autumn frame
  reads as a varied, blazing canopy.
- **The merge** — the 07d archetype floor strokes (daytime greens, dappled) plant
  the foreground/midground; pollinators hum in summer; blossom-fall (spring) and
  leaf-fall (autumn) particles; one dapple field lights ground + floor.
**Artifact:** `../trial-10-merge.html`
**Captures:** `captures/step10-summer.png` (enclosing green canopy + brown tree +
maple + floor), `captures/step10-autumn-maples.png` (**the best frame yet — maple
blazing orange-red amid gold canopy**), `captures/step10-spring.png` (leaf-out +
blossom + floor waking).
**Learned:** the convergence works — this is the first time it reads as *the whole
garden*, in daylight, alive through the year. Recursive brown branches + the maple
gold→scarlet progression are exactly the asks, landed. **Remaining:** an empty
mid-ground band between canopy-bottom and the low floor (needs continuous shrub /
climber planting to bridge — the photo has no gap); the **floor plants stay green in
autumn** (should turn/decline with the canopy); canopy masses still read a touch
ball-like and the trunk is a little lone; and the substrate (Trial 05) → emergent
inter-layer dynamics is still the long-horizon endgame.

---

## Step 11 — Beds, Path & Flies (ground structure)
**Date:** 2026-06-06
**Input (user):** "Need lawn, earth, garden beds — structure to the bedding, maybe a
little path. More flowers and more varied flies. Keep going."
**Decision:** Give the ground a **composed structure** and plant *into* it:
- **Ground zones** — one shared `bedEdge(z)`/`pathC(z)` definition (JS + GLSL, true
  world coords) carves the floor into **mown lawn**, **earth/soil beds** (side
  borders, wavy edge), a **stone path winding up the middle**, and the front patio.
- **Planting follows the beds** — floor strokes generated *inside* the bed regions
  (drifts of one archetype + one flower colour), not scattered; sparse self-seeded
  grass in the lawn.
- **More flowers** — a richer **8-colour palette** across the whole season, assigned
  per drift, flower-tip brightness boosted so colour reads.
- **Varied flies** — five insect kinds (bumblebee, honeybee, hoverfly, two
  butterflies) with distinct size, banded colour, speed and **motion mode** (bee
  buzz / hoverfly hover-and-flick / butterfly slow flap), ~240 working the beds.
**Artifact:** `../trial-11-beds.html`
**Captures:** `captures/step11-summer.png`, `captures/step11-flowers.png`,
`captures/step11-autumn.png`.
**Learned:** ground structure is what makes it read as a *designed garden* not plants
on a plane — the path leads the eye in, the beds give the planting a home, lawn/earth/
stone read distinctly; varied flies add life cheaply. **Remaining:** floor plants
still **stay green in autumn** (unify the seasonal clock so beds brown/sleep); path a
touch wide/straight (stepping-stones would soften); flies could be denser.

---

## Step 12 — A Real Plant Palette (+ unified seasonal clock)
**Date:** 2026-06-06
**Input (user):** "Do it [unify the clock]. Too many grasses — doesn't feel like a
London cottage / bedding garden. Use the plant list I gave you; do more realistic
replicants."
**Decision:** Replace the generic archetypes with a **plant library of ~23 named
London cottage / woodland species** (from the MODEL.md list), each with its own
form, foliage, flower *and lifecycle* — and the lifecycle is what **unifies the
seasonal clock**:
- **Library** — hellebore, brunnera, pulmonaria, epimedium, **heuchera** (purple
  foliage), **bergenia** (big leaves), **fern** (new frond shape), Solomon's seal,
  ajuga · foxglove, verbascum, veronicastrum, **ammi** (flat-umbel shape), agapanthus
  · nepeta, allium, geranium, **hydrangea**, lobelia · **snowdrop, crocus, daffodil**
  (bulbs) · grass (now rare). Each: shape, foliage colour, flower colour+window,
  height, **wake / sleep / evergreen / autumn-foliage** params, planting weight.
- **Per-plant lifecycle in the shader** — each plant wakes in its season, grows,
  **browns toward its autumn colour**, and dies back to nothing (unless evergreen);
  bulbs pulse in late winter then vanish. Foliage scale + colour both driven by
  `day`. (Two new silhouette shapes: fern frond, flat umbel. Packed scalar
  attributes into vec4s to stay under the 16 vertex-attribute GPU limit.)
- **Planting** — drifts of one species per clump (gardener's repetition), grass
  weighted right down; naturalised snowdrop/crocus drifting into the lawn edge.
**Artifact:** `../trial-12-plants.html`
**Captures:** `captures/step12-summer.png` (varied border — purple heuchera, mixed
foliage, accents), `captures/step12-autumn.png` (**beds brown WITH the canopy** —
the clock unified), `captures/step12-winter.png` (**bare architectural trees,
dormant beds, evergreens persisting, snowdrops emerging** — the year completes).
**Learned:** giving every plant its own lifecycle is what turns a season *curve*
into a **garden year** — spring bulbs → flowering border → autumn die-back in sync
with the canopy → winter bare-bones with evergreen structure and the first
snowdrops. The named palette + distinctive foliage (purple heuchera, big bergenia,
ferns) reads as a real London border, not a generic meadow. Winter especially
showcases the recursive brown branches. **Remaining:** flower forms are still
approximate (no true foxglove spike / allium globe geometry — they're coloured tip
masks); bulbs/accents could be denser; path still wide; and the long-horizon
substrate-driven (emergent) version remains the endgame. But as a *daytime garden
through the year*, this is the strongest the piece has been.

---

## Step 13 — Flower Forms & Full Beds
**Date:** 2026-06-06
**Input (user):** "Do it [real flower forms]. Keep going. Fill those beds in."
**Decision:** Stop faking flowers as coloured tip-masks; give each plant a real
**flower form** built from a cluster of **florets** (small billboarded flower dabs),
and pack the borders fuller.
- **Floret system** — a per-species `FORMS` map drives a `emitFlorets()` generator
  that lays florets in the right shape: **spike** (foxglove/verbascum/veronicastrum —
  bells up the stem), **globe** (allium/agapanthus — a sphere of florets), **umbel**
  (ammi — flat disc), **mophead** (hydrangea — big rounded clusters), **head**
  (geranium/hellebore/bergenia), **haze** (nepeta/brunnera — airy scatter), **bell**
  (Solomon's seal — hanging), **single** (snowdrop/crocus/daffodil), **plume**
  (grass). ~16–30k florets, instanced billboards, each fading in/out on its own bloom
  window, with a brighter centre. Foliage strokes are now pure green (flower removed
  from the stroke shader).
- **Full beds** — drift count 170→300, drift size up, border width +4.5→+5.8,
  `FMAX` 17k→24k — the borders read packed, much less bare earth.
**Artifact:** `../trial-13-flowerforms.html`
**Captures:** `captures/step13-summer.png`, `captures/step13-flowers.png`
(**pink foxglove spikes + purple allium globes + massed florets in full borders**),
`captures/step13-autumn.png` (florets gone out of season, **beds browning with the
canopy** — unified clock intact through the upgrade).
**Learned:** flower *form* is a big realism jump — a foxglove now reads as a spike of
bells, an allium as a globe, rather than a colour smear; and the form clusters fade on
each plant's own bloom window so the borders change shape through the season. Filling
the drifts denser is what makes it look gardened, not sparse. **Remaining:** floral
*abundance* could still go higher (more florets / more of the bed flowering at once);
florets are billboard dabs, not true petal geometry; path still wide; and the
MODEL.md zones + human-trace layer, plus the long-horizon emergent-substrate version,
remain ahead. But as a daytime cottage garden moving through the year, it now has
real plants, real flower forms, full beds, and one unified seasonal clock.

---

## Step 13b — Cranked the bloom + PUBLISHED LIVE
**Date:** 2026-06-06
**Input (user):** "Crank the floral abundance, and push this to here.now to let it
actually work online."
**Decision:**
- **Floral riot** — bumped every floret-form count ~50–80% (spikes, globes, umbels,
  mopheads, hazes), raised floret sizes, lifted the floret cap to 55k and `FMAX` to
  30k, denser drifts (380), and tilted species weights toward flowering border plants
  (nepeta/geranium/foxglove/allium/hydrangea/lobelia up; fern down). High summer now
  reads as a packed cottage-garden border of massed colour.
- **Published** — the trial is a single self-contained HTML file (Three.js from the
  jsdelivr CDN, no build step), staged as `publish/index.html` and pushed to here.now
  with the saved API key → **permanent**.
**LIVE URL:** **https://eternal-birch-wjhm.here.now/**
**Artifact:** `../trial-13-flowerforms.html` (= `../publish/index.html`)
**Capture:** `captures/step13b-riot.png` (the cranked high-summer border),
`captures/step13b-live.png` (verified rendering live online).
**Learned:** the piece is now a real, shareable thing on the open web — GardenOS as a
daytime London garden you can watch move through the year, anywhere. First public
artifact of the project.

---

## Step 13c — Mobile framing (responsive camera + path-edge flowers)
**Date:** 2026-06-06
**Input (user):** On iOS the portrait screen crops to a narrow rectangle showing
mostly the path/lawn — the side-bed flowers fall off-frame, so the abundance is lost.
**Diagnosis:** the composition was fixed for a wide landscape frame; the flowers live
in the side beds, which a tall portrait viewport crops away (vertical-FOV camera →
horizontal coverage shrinks as the screen narrows).
**Decision:** two fixes together —
- **Responsive `layout()`** — recomputed on load + resize: as aspect narrows toward
  portrait it widens the FOV (60°→84°) and pulls the camera back (z 8.5→13.5, slightly
  higher), so the side beds stay in frame instead of cropping to the path.
- **Path-edge border** — a new planting pass drifts flowering species (nepeta,
  geranium, allium, heuchera, lobelia…) right along both sides of the path, so the
  central column the phone *does* show is full of bloom. (Also enriches landscape.)
  `FMAX` 30k→36k to fit.
**Artifact:** `../trial-13-flowerforms.html` → re-published to the same URL.
**LIVE:** **https://eternal-birch-wjhm.here.now/** (verified rendering full in a
390×844 portrait viewport).
**Captures:** `captures/step13c-portrait.png`, `captures/step13c-landscape.png`,
`captures/step13c-live-portrait.png`.
**Learned:** a web art piece has to be responsive — the framing is part of the work,
and "abundance" only reads if the flowers are where the viewport actually looks.
Lining the path with flowers makes the composition robust to any aspect ratio.
**Remaining:** portrait still has some empty path/patio in the lower frame (could lift
the look-angle or shorten the foreground); mobile GPU load (lots of instances) is
worth watching for performance.

---

## Step 14 — Engine pass: wind · perf · build-up · leaf shapes
**Date:** 2026-06-06
**Input (user):** "Keep going on the main engine." Then two notes: trees/shrubs
shouldn't switch ON on a day — they should build up / grow / blossom then flesh out;
and leaves shouldn't all be round dots — give shape variety (some maple) + porosity.
**Decisions (one pass on the live engine):**
- **Wind** — a shared `windOffset()` (rolling gusts, taller things sway more) applied
  in world space to canopy leaves, florets, and floor strokes, so a coherent breeze
  moves the whole garden together (replacing the old per-instance jitter).
- **Performance scaling** — `MOBILE` detection → `Q=0.5` halves all instance counts
  (leaves, florets, plants, flies) and caps pixel ratio at 1.2 on phones, full quality
  on desktop. Keeps it smooth on iOS.
- **Portrait foreground** — `layout()` now looks higher on narrow screens (less empty
  patio in the lower frame).
- **Gradual build-up** — leaves now emerge **staggered per-leaf** (`iSeed`-offset
  window) and **grow from a tiny bud** (size 0.05→1, not popping in at 55%), with a
  **fresh pale-green flush that deepens**, and **blossom shifted earlier** so it shows
  on emerging growth *before* the canopy fleshes out. The canopy fills in over weeks.
- **Leaf-shape variety + porosity** — each leaf carries a shape (`iLeaf`): round /
  oval / **maple (pointed lobes)** / oak-lobed, assigned per tree (maple gets maple
  leaves) with a few mixed in, each **randomly rotated** with **ragged porous edges** —
  the canopy reads as foliage texture, not polka dots.
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step14-landscape.png`, `captures/step14-leafout.png`
(**day 75 — canopy mid-emergence, branches through thin early leaves, blossom out**),
`captures/step14-leafshapes.png` (lusher textured summer canopy).
**Learned:** the *temporality* of growth matters as much as the forms — leaves
building up gradually (emerge tiny, staggered, blossom-then-flesh) reads as life, where
a same-day switch-on read as a toggle. Shape variety + ragged edges + wind together
lift the canopy from "dots" to "foliage." This is the engine becoming genuinely alive.
**Remaining:** could push leaf-shape variety further (compound leaves, finer maple);
floor plants could also emerge more gradually/staggered like the canopy; verify mobile
frame-rate on-device.

---

## Step 15 — Whole-garden build-up
**Date:** 2026-06-06
**Input (user):** "Keep going."
**Decision:** Extend the canopy's build-up to the *whole* garden so spring is a
coherent emergence, not a canopy-only effect:
- **Floor/bed plants** now wake **staggered per-plant** (`iWake` offset by `iSeed`),
  **grow from almost nothing** (height 0.04→full instead of 0.10), with a **fresh
  pale-green spring flush** that deepens as they flesh out — the beds build up over
  weeks like the trees.
- **Flower heads open floret-by-floret** — each floret's bloom window is offset by its
  seed and it **swells from a bud** (0.18→full), so a head/spike/globe fills in
  gradually rather than fading in as a block.
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step15-buildup.png` (day 95 — canopy *and* beds mid-emergence,
fresh growth, first flowers opening), `captures/step15-summer.png` (full at peak —
build-up doesn't cost the high-summer abundance).
**Learned:** consistency of the temporal model across layers is what sells it — once
the beds build up on the same logic as the canopy, the whole spring reads as one
living emergence. The garden now has a coherent life-cycle from bare winter → staggered
spring build-up → full summer → synchronized autumn die-back → bare again.
**Remaining:** finer botanical leaf/flower geometry; zones (front/woodland/patio); the
human-trace layer; on-device mobile perf check; the long-horizon emergent substrate.

---

## Step 16 — English cottage-garden pass
**Date:** 2026-06-06
**Input (user):** more English cottage garden — a bird bath; more realistic grass;
daffodils + snowdrops in spring; less mud/earth (it's bedded now); leaves should come
on the trees more organically; then finer botanical geometry.
**Decisions (one pass):**
- **Bird bath** — a stone focal ornament (base + tapered pedestal + bowl + a rippling,
  sky-reflecting water disc), fake top-lit shader, on the open lawn beside the path; a
  cleared apron (`nearBath`) keeps planting/grass off it so it always reads.
- **Realistic lawn** — ~14k short instanced **grass blades** (tapered, wind-swayed,
  depth-graded green) carpeting the lawn zones, so the mown lawn is grass, not a plane.
- **Spring bulbs** — naturalised **daffodil & snowdrop** drifts (plus crocus) sweeping
  through the lawn and bed edges; prominent in late winter/spring.
- **Less earth** — bed soil recoloured to **dark mulch + leaf-litter** (was raw
  orange); with the denser planting the borders read bedded, not muddy.
- **More organic leaf-out** — widened the emergence window (≈day 58→160 across the
  per-leaf stagger) so the canopy fills in slowly, branch by branch.
- **Finer geometry** — sharper 5-lobed **maple** leaf silhouette (deeper notches).
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step16-summer.png`, `captures/step16-spring-bulbs.png`
(crocus/daffodil/snowdrop drifts + near-bare trees mid-emergence),
`captures/step16-birdbath.png` (the bath reading on the lawn by the path).
**Learned:** the cottage-garden read comes from the *furniture and groundwork* as much
as the flowers — a bird bath gives the eye a focal point, real grass grounds the lawn,
mulch (not mud) makes the beds look tended, and naturalised bulbs sell the season.
**Remaining:** bird bath is simple (could add a visiting bird, moss, planting at its
foot); grass could be denser/longer at bed edges; finer flower geometry still owed;
zones + human-trace layer ahead.

---

## Step 17 — Tree physics: wind down · leaves-on-branches · cherry blossom
**Date:** 2026-06-06
**Input (user):** die the wind down; tree leaves still appear "from space" not the
smaller branches they should grow from (think tree physics); some trees need spring
cherry blossom.
**Decisions:**
- **Wind down** — all `windOffset` amplitudes cut ~2–3× (canopy 0.10→0.028, florets
  0.07→0.022, floor 0.06→0.022, grass 0.05→0.022). A gentle stir now, not a gale.
- **Leaves grow from branches** — replaced the gaussian crown-blob with real tree
  structure: a trunk rises, splits into **main limbs**, each **recursively branches**,
  and leaves are generated as **tufts clustered on the outer twigs** (`branchRec`
  adds leaves at depth ≤1). So the canopy is hung on the branch architecture — and
  during the slow leaf-out you watch it fill in *along the branches*, bare limbs
  showing in spring. Re-balanced tuft size/density (fatter clusters, more leaves) so
  it still reads lush, not skeletal.
- **Cherry blossom** — added an ornamental **cherry** (`cherry:1`) whose leaves carry
  blossom flag 2 → **pink** (`vec3(1,0.58,0.74)`) vs the shrubs' white; blossom now
  **fills the tree before the leaves** (`scale = max(leafOut, blossom)`), so it flowers
  pink on near-bare branches in spring, then leafs.
**Artifact:** `../trial-13-flowerforms.html` → re-published (one retry — here.now
timed out once).
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step17-summer.png` (trees with visible branch architecture +
foliage on the limbs), `captures/step17-cherry.png` (**pink cherry in blossom among
bare branching trees, bird bath, white blossom shrubs, spring bulbs**).
**Learned:** structure beats blob — hanging the leaves on an actual branch skeleton
fixed the "leaves from space" problem *and* made the slow leaf-out read as real growth
(you see the bare architecture, then it clothes itself). The trade is a slightly more
open, see-through canopy — which is more truthful (sky through branches) than the old
solid dome. **Remaining:** could fill the overhead canopy a touch more; finer flower
geometry; zones + human-trace layer; on-device mobile perf.

---

## Step 18 — Apple tree · fuller trees · birds · petalled flowers
**Date:** 2026-06-06
**Input (user), two notes:** trees a bit big, not enough branches, fuller canopy
looked cooler; then — leaves should cover the front of the main tree, maybe remodel it
as an apple tree (have a deep think).
**Decisions:**
- **Fuller, more-branched, smaller trees** — `growTree`: trunk + **5–8 main limbs**,
  **depth-5** recursion, leaves over the **outer three twig levels**; crowns shrunk.
  Lush again, real branch density, smaller.
- **Central tree → APPLE tree** (the remodel) — `growApple`: short **gnarled trunk** +
  spreading scaffold limbs (visible), then a **dense gaussian crown that covers its
  front**, and a full **seasonal story**: pale pink-white **blossom** (spring) → green
  summer → **apples ripening green→red** late summer (fruit instance system, hung
  lower-front, glossy highlight) → **fruit + leaf drop** (autumn). Old overhead mass →
  high gaussian arch for top framing.
- **Birds** — a drifting **flock** of flapping V-silhouettes + a couple **visiting the
  bird bath**. First of the human/life layer.
- **Finer flowers** — florets are now **5-petal** silhouettes with a warm centre.
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step18-apple-summer.png`, `captures/step18-apples.png` (red
apples through green crown), `captures/step18-blossom.png` (apple+cherry blossom, bird
at bath, spring bulbs).
**Learned:** a *feature tree* with a full life-cycle (blossom→leaf→fruit→drop) is worth
far more than a generic canopy — it anchors the garden and tells the year in one object.
Covering the front needed a *dense crown* (gaussian), not more twigs; branch-tuft suits
see-through backdrop trees, dense-crown suits a foreground feature. Different trees want
different construction.
**Remaining:** apple windfall on the ground; a bird that truly lands on the rim; zones
+ dusk/patio-lights; on-device mobile perf.

---

## Step 19 — Per-tree autumn · evergreens · cleanup
**Date:** 2026-06-06
**Input (user):** high canopy leaves left in after the apple swap; apple can be bigger;
in autumn each tree should have a slightly different tone + timing of browning (not all
the same); some shrubs should be evergreen too.
**Decisions:**
- **Removed the overhead gaussian arch** — those were the "left-in" high leaves that
  floated disconnected once the centre became a (shorter) apple. Top of frame is open
  sky now; side trees + apple do the framing.
- **Bigger apple** — crown r3.4→4.3, taller trunk.
- **Per-tree autumn** — each tree gets its own **`at`** (turn-timing base) folded into
  the leaf's `iTurn`, plus its own **mid/late tones**: R tree GOLD (early), L tree
  ORANGE (late), apple RUSSET (mid), maple SCARLET (latest), cherry warm-red. At any
  autumn day the garden shows several trees at different stages — green / gold / russet
  at once.
- **Evergreens** — new per-leaf **`iEver`** flag (LSTR 18→19): evergreen leaves stay in
  leaf year-round, never turn, never drop. Marked the **back-wall hedge** + two **box
  shrubs** evergreen → winter structure.
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step19-summer.png` (no floating leaves, bigger apple, evergreen
domes), `captures/step19-autumn.png` (**gold / russet / still-green trees together —
varied timing + tone**), `captures/step19-winter.png` (bare deciduous + evergreens
holding green + snowdrops).
**Learned:** desynchronising the autumn (per-tree time *and* hue) is what makes the
season feel real — a single synchronous turn reads as a global recolour; staggered
trees read as a garden. Evergreens earn their keep in winter, giving the bare scene
structure. Both are cheap per-instance flags with outsized payoff.
**Remaining:** apple windfall; bird landing on the rim; zones; dusk + patio lights;
on-device mobile perf.

---

## Step 20 — Dusk, patio lights & apple windfall
**Date:** 2026-06-06
**Input (user):** "do it" (the offered list — dusk + patio lights, windfall).
**Decisions:**
- **Day/night drift** — a slow `sun` cycle (~74 s) layered over the seasonal year. The
  post grade tints + dims by `sun`: day (neutral) → **golden dusk** → **cool blue
  evening** (never full dark — a twilight glow), with a soft evening vignette and extra
  bloom as the light fades. Test hook `window.__sun` to force a time of day.
- **Patio string lights** — a catenary of ~18 warm bulbs strung over the patio
  (additive, gentle twinkle) that **come on as the light fades** (`1-smoothstep(sun)`)
  and bloom warmly in the dusk. The first real "human-trace" mood.
- **Apple windfall** — extended the fruit system with a **ground flag**: ~20 fallen
  apples lie on the grass/path under the apple tree in **late autumn** (appear ~day 300
  as the tree drops, linger to ~360), completing the apple's year.
**Artifact:** `../trial-13-flowerforms.html` → re-published.
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step20-dusk.png` (**blue evening, warm string lights glowing
over the path** — the best mood frame yet), `captures/step20-windfall.png` (varied gold
/orange autumn, evergreens holding, **windfall apples on the ground**).
**Learned:** a time-of-day layer on top of the time-of-year transforms the piece — the
same garden at golden dusk with lights on is a completely different emotional register,
and it's nearly free (a post tint + a handful of emissive points). Twilight, not
midnight, keeps it legible and magical.
**Remaining:** zones (front/woodland/patio as distinct areas); a bird that lands on the
rim; stars/moon at the darkest dip; on-device mobile perf.

---

## Step 21 — Fresh-eyes review pass: enclosure, festoon scale, painterly floor
**Date:** 2026-06-10
**Input (user):** a cold review of the live piece three days on ("if you want to do
those improvements, that would be great").
**Decisions:**
- **Enclosure** — the garden floated on an infinite mulch plane. Added weathered larch
  **side fences** (slat shader, fogged) and a dark **hedge body plane** behind the back
  hedge's leaf-dabs (irregular fbm-clipped top + sides, fog-resistant darkness) so the
  dabs read as a clipped surface. Winter no longer shows a floating confetti cloud;
  every season now reads as a *walled London garden*.
- **Festoon scale** — the string lights were enormous floating orbs slicing across the
  apple crown. Now 14 small bulbs (pointSize ~¼ previous), short low span (x ±1.8,
  y≈1.6–2.0, z=5.0) so **every bulb reads against foliage, not sky**. Tried physical
  posts to anchor the ends — they loomed black at frame edge; deleted (lesson below).
- **Painterly floor strokes** — bed plants were hard-edged vector paddles fighting the
  painterly canopy. Added per-stroke ragged edge (two sine bands on the silhouette) +
  fbm interior veining, unifying the two visual languages.
- **Foreground scale damping** — `nearDamp(z)`: plant + floret height scales down 0→50%
  as z approaches the patio, killing the giant dark blades looming at frame edges.
- **Honesty fixes** — caption now matches the scene ("golds deepen" 285, "the maple
  blazes" 322 when it actually turns); windfall apples cleared by early winter (~day
  336–352, staggered); pollinators fade out at dusk (they read as glowing lanterns
  against the dark fences).
- **Perf** — desktop pixel ratio 1.6→1.35 + bloom blur 36→24 taps: **25→38 fps** on the
  M-series MBP at 1440×734. Mobile Q unchanged.
**Artifact:** `../trial-13-flowerforms.html` → re-published (live verified byte-identical).
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step21-winter-enclosure.png` (fences + clipped hedge — winter
finally reads as *his* enclosed garden), `captures/step21-dusk-festoon.png` (small
festoon draped against foliage, insects gone home), `captures/step21-maple-blazes.png`
(scarlet maple alone in a bare garden, caption true).
**Learned:** enclosure is identity — the same planting reads as "demo" on an infinite
plane and as "a garden" inside a fence line. And scale outliers near the camera or
against the sky are what break the illusion first; fixing four small honesty details
(captions, windfall, insects at dusk, floating bulbs) did more than any new feature
would have. Anchoring a prop physically (the posts) can be worse than removing the
need for the anchor (drape the string against foliage).
**Remaining:** zones A–D; bird landing on the bath rim; stars/moon at darkest dip;
on-device mobile frame-rate check.

---

## Step 22 — Botanical truth: real bulb forms, cottage vocabulary, daylight master
**Date:** 2026-06-10/11
**Input (user):** "the plants that we had listed, do you want to model them a bit
better, especially the daffodils and the spring layers? … it doesn't really look and
feel like an English cottage garden, does it?" Then mid-build: "doesn't need darkness
I don't think."
**Decisions:**
- **Per-floret KIND** (stride 11→12): daffodils are now a 6-petal perianth with a deep
  orange trumpet; snowdrops are narrow hanging white drops with green tips; crocuses
  are upright cups with orange stamens. Spring stops being generic 5-petal confetti.
- **THE BUG OF THE STEP**: the floret buffer was generating **413k** florets and
  silently truncating at the 55–75k cap — in emission order. Everything emitted late
  (lawn bulbs, new cottage species) simply never rendered. Fix: thinned the mass
  fillers (haze/globe/umbel/mophead halved, bed drifts emit florets at p=0.45),
  **reordered emission so deliberate features draw first**, cap raised to 110k.
  Lesson: a silent cap is a lie — features were "in the code" but not on screen.
- **Cottage vocabulary**: hollyhocks stand against the fence lines; lavender edges the
  path both sides; delphinium / lupin / shrub-rose joined the drift mix (rose wt 6);
  **climbing roses clothe the fence panels** (leaf dabs into the canopy system + ~95
  pink blooms per climber, 6 climbers). Bergenia/hellebore paddles shrunk + multiplied
  (the agave look is gone). Bulb die-back greened (was reading as dead grey tufts).
- **Porous blossom**: only 45% of dabs blossom and the size boost dropped — the apple
  reads as flowering branches now, not a cotton ball.
- **Night built, then parked**: full darkness grade + 220 twinkling stars + moon (HDR
  ~7× values to survive the night grade — key trick). Andy: doesn't need darkness. The
  auto cycle is now clamped **day ↔ golden dusk (sun 0.38–1.0)**; the whole night
  system stays dormant behind `window.__sun` for film captures.
**Artifact:** `../trial-13-flowerforms.html` → re-published (live verified).
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step22-daffodil-spring.png` (daffodil drifts sweeping the
path, porous blossom), `captures/step22-cottage-summer.png` (roses on the fences,
lavender edging, mixed pink/white/blue border — it finally reads English cottage),
`captures/step22-night-filmonly.png` (the parked night: moon between crowns, stars,
festoon — film-only).
**Learned:** "looks like an English cottage garden" is mostly *vocabulary + placement*,
not rendering: climbers on the fence, spires against it, edging along the path. The
silent floret cap was the real reason past planting changes under-delivered. Desktop
30 fps with 110k florets drawn.
**Remaining:** zones A–D; bird landing on the bath rim; on-device mobile perf.

---

## Step 23 — Blue sky, zones A–D, real insects, higher birds
**Date:** 2026-06-11
**Input (user):** "that looks really nice… do the rest of it… sky could be a little
less grey, maybe some blue… bees and butterflies could probably be better… quite like
the birds as they are, but maybe a little bit bigger or a little bit higher."
**Decisions:**
- **Blue sky** — sky gradient deepened (top 0.38/0.58/0.93) and the global FOG colour
  shifted from grey-green to pale blue; the whole piece reads as a fresh summer day
  instead of overcast. The biggest mood shift per character changed in the file.
- **Zones A–D landed** (the last big MODEL.md move): `pickSpecies(z)` bends species
  weights by depth — ferns/hellebores/foxgloves cluster in the shaded back (woodland,
  zone B), roses/nepeta/delphiniums at the sunny front (zone A); the lawn was already
  zone C; **terracotta patio pots with scarlet pelargoniums** (zone D) now anchor the
  bottom corners by the viewer's feet — leaf-dab mounds + long-season florets.
- **Real insects** — the banded-circle point sprites became shaped ones: butterflies
  are two flapping wing lobes (per-insect flap phase) with a dark body and two-tone
  wings; bees are striped round bodies with a blurred wing-pair above; hoverflies a
  tiny dart. Sprites enlarged so the shapes read (bumble 19px, butterflies 23–24px).
- **Birds** — sky flock raised (y≈12.5–19) and enlarged (0.5→0.85); bath birds
  untouched (Andy likes them as they are).
**Artifact:** `../trial-13-flowerforms.html` → re-published (live verified).
**LIVE:** **https://eternal-birch-wjhm.here.now/**
**Captures:** `captures/step23-bluesky-spring.png`, `captures/step23-pots-zones-summer.png`.
**Learned:** atmosphere is cheaper than geometry — the fog/sky recolour did more for
"feels like a nice day" than any planting change. Zones come almost free once placement
is probabilistic: bend the weights by depth and communities emerge. 33 fps desktop.
**Remaining:** bird landing on the bath rim (current perch/flight cycle may be enough);
on-device mobile frame-rate check.
