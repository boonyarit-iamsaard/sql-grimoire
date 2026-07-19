---
name: SQL Grimoire
description: A browser-based SQL-learning game — a candlelit investigator's desk where production incidents become Cases.
colors:
  ink-base: "#24273a"
  ink-mantle: "#1e2030"
  ink-crust: "#181926"
  slate-raised: "#363a4f"
  slate-border: "#494d64"
  slate-edge: "#5b6078"
  muted-deep: "#6e738d"
  muted: "#8087a2"
  muted-bright: "#939ab7"
  parchment-text: "#cad3f5"
  parchment-dim: "#b8c0e0"
  parchment-dimmer: "#a5adcb"
  candle-gold: "#eed49f"
  candle-gold-hi: "#f2dcae"
  candle-gold-edge: "#a98f52"
  ember-peach: "#f5a97f"
  rune-lavender: "#b7bdf8"
  seal-green: "#a6da95"
  warning-red: "#ed8796"
  warning-red-hi: "#f09aa7"
  warning-red-edge: "#a95863"
  warning-maroon: "#ee99a0"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.6rem, 6vw, 4.2rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.06em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  mono:
    fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "22px"
  xxl: "30px"
components:
  button-default:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.parchment-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
  button-primary:
    backgroundColor: "{colors.candle-gold}"
    textColor: "{colors.ink-crust}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
  button-primary-hover:
    backgroundColor: "{colors.candle-gold-hi}"
    textColor: "{colors.ink-crust}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
  button-danger:
    backgroundColor: "{colors.warning-red}"
    textColor: "{colors.ink-crust}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
  card:
    backgroundColor: "{colors.ink-base}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.md}"
    padding: "14px"
  feedback-modal:
    backgroundColor: "{colors.ink-base}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.xl}"
    padding: "26px 30px"
  concept-chip:
    backgroundColor: "{colors.slate-border}"
    textColor: "{colors.parchment-text}"
    typography: "{typography.mono}"
    rounded: "{rounded.full}"
    padding: "3px 12px"
  xp-badge:
    backgroundColor: "{colors.ink-base}"
    textColor: "{colors.candle-gold}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  table-header:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.candle-gold}"
    typography: "{typography.mono}"
    padding: "7px 12px"
---

# Design System: SQL Grimoire

## 1. Overview

**Creative North Star: "The Candlelit Ledger Desk"**

SQL Grimoire is a developer's workbench lit like a scholar's desk. The surface is cool slate — the
Catppuccin Macchiato palette — but a single radial pool of warm light spills from the top of every
page, and every accent that matters (headings, primary actions, earned rewards) is struck in candle
gold. The result is a tool that reads as calm, precise, and quietly magical: the query editor, the
result grid, and the schema are always the primary surface; narrative and reward frame the work and
then step back into the candlelight.

The system rejects the four failure modes named in the product brief. It is **not** a corporate
learning-management console (no certificates, no streak calendars, no course-catalog marketing
cards — the Casebook shows progress as solved Missions and earned XP, nothing more). It is
**not** superficial gamification (no streaks, no confetti, no persistent mascot). It is **not** a
generic software-as-a-service dashboard (no left sidebar of icons, no statistic cards, no default
administrative dark template). And it is **not** grimdark fantasy (no skulls, no blood-red, no
oppressive murk) — warmth, scholarship, and subtle magic carry the mood instead. Where a normal
product UI would go flat and gray, this one goes warm and tactile: buttons press like keys, cards
sit on soft paper shadow, and gold is spent sparingly enough to still feel like treasure.

**Key Characteristics:**

- Cool slate base, warm gold-and-peach accents, lit by a top-center radial "candlelight" glow.
- Georgia serif for every heading and button; JetBrains Mono for every code and data surface at a
  fixed 14px; Segoe UI sans for prose.
- Calm density: developer-tool precision (mono grids, sticky headers, dotted schema trees) without
  dashboard ornament.
- Tactile, bookish components — pressable buttons with a hard bottom edge, paper-shadow cards.
- Restrained accent economy: gold means "primary, current, or earned," never decoration.

## 2. Colors: The Candlelight-on-Slate Palette

A cool slate substrate (Catppuccin Macchiato) warmed by a narrow band of gold, peach, and lavender
accents. All tokens map to the project's `--color-ctp-*` custom properties defined in
`apps/web/src/styles.css`; the descriptive names below are the design-system vocabulary.

### Primary

- **Candle Gold** (`#eed49f`, `--color-ctp-yellow`): the one warm voice. Every heading, the primary
  action button (as a gold gradient), the XP figure, active schema table names, and the objective
  label. It is the color of light and of things earned.
- **Candle Gold Highlight** (`#f2dcae`): the top stop of the primary button's vertical gradient and
  the color the button brightens toward on hover.
- **Candle Gold Edge** (`#a98f52`): the muted gold used for the primary button's border and its 2px
  bottom "press" edge.

### Secondary

- **Ember Peach** (`#f5a97f`, `--color-ctp-peach`): the mentor's voice. Hint text and its card
  border, Primer section headings, the company eyebrow on Case cards, the current-Case name in the
  progress panel, and completed-mission titles in the Grimoire.

### Tertiary

- **Rune Lavender** (`#b7bdf8`, `--color-ctp-lavender`): quiet structural accent for in-card section
  headings ("Concepts learned", "How it works") inside the feedback modal and Grimoire entries.

### Neutral

- **Ink Base** (`#24273a`, `--color-ctp-base`): the primary content surface — every card, panel,
  editor shell, and result table sits on it.
- **Ink Mantle** (`#1e2030`, `--color-ctp-mantle`): the recessed layer — toolbars beneath the editor
  and inset code blocks.
- **Ink Crust** (`#181926`, `--color-ctp-crust`): the deepest tone — the outer edge of the page
  background gradient, and the dark text printed on gold and green surfaces.
- **Slate Raised** (`#363a4f`, `--color-ctp-surface0`): the lit top stop of raised gradients
  (default button, manuscript cards) and the sticky table-header fill.
- **Slate Border / Slate Edge** (`#494d64` / `#5b6078`, `surface1` / `surface2`): the standard 2–3px
  card borders and hairline dividers.
- **Parchment Text** (`#cad3f5`, `--color-ctp-text`): default body and data text.
- **Parchment Dim / Dimmer** (`#b8c0e0` / `#a5adcb`, `subtext1` / `subtext0`): secondary prose and
  italic flavor lines.
- **Muted** (`#6e738d` / `#8087a2` / `#939ab7`, `overlay0`–`overlay2`): non-essential metadata only —
  row counts, timestamps, column types, NULL/blob placeholders.

### Signal colors

- **Seal Green** (`#a6da95`, `--color-ctp-green`): success only — the "Mission Complete" heading and
  the completed mission-number circle in the Casebook's mission list.
- **Warning Red / Maroon** (`#ed8796` / `#ee99a0`, `red` / `maroon`): SQL errors, the danger button
  (Reset Database), the failed-submission heading, and the uppercase failure-reason label.

### Named Rules

**The One Candle Rule.** Candle Gold is the single warm voice and appears on a small fraction of any
screen — headings, one primary action, the XP figure. Its rarity is what makes rewards feel earned;
never spend gold on decoration or on inactive controls.

**The Warmth-From-Accent Rule.** The base is cool slate by design. Warmth is delivered by gold, peach,
and the top-center radial glow — never by tinting the base toward brown or "parchment." The substrate
stays cool; the light is warm.

## 3. Typography

**Display / Heading Font:** Georgia (with Times New Roman, serif fallback)
**Body Font:** Segoe UI (with system-ui, sans-serif fallback)
**Code / Data Font:** JetBrains Mono (self-hosted via Fontsource; with Cascadia Code, Consolas
fallback)

**Character:** A serif-and-mono pairing on a true contrast axis: bookish Georgia headings for the
scholarly, grimoire mood, and crisp JetBrains Mono for every surface where SQL or query results live.
Segoe UI carries plain prose between them. The serif-plus-mono contrast is the whole personality —
one side is the study, the other is the terminal.

### Hierarchy

- **Display** (Georgia 400, `clamp(2.6rem, 6vw, 4.2rem)`, line-height 1.1, tracking 0.06em): the
  landing title only, with a hard drop-shadow (`0 3px 0 rgba(12,12,22,0.55)`). The single fluid
  heading in the system; everything else is fixed.
- **Headline** (Georgia 400, 2rem): mission and page `h1` titles ("Casebook", the Mission title in
  the workbench top bar).
- **Title** (Georgia 400, 1.5rem / 1.17rem for `h3`): in-card headings and the result-table `h2`.
- **Body** (Segoe UI 400, 1rem, line-height 1.5): prose, objectives, explanations. Cap prose at
  65–75ch (the mission objective already holds a 72ch max).
- **Label** (Georgia 400, 1rem, tracking 0.04em): all button labels and XP badges.
- **Mono** (JetBrains Mono 400, 14px): every code and data surface — the SQL editor, result grids,
  schema explorer, concept chips, code blocks, and inline row/duration meta.

### Named Rules

**The Serif-Button Rule.** Buttons wear the Georgia display face, not the sans or the mono — this is a
deliberate departure from generic product UI and is core to the bookish character. Keep it; do not
"correct" button labels to a sans.

**The Fixed-Scale Rule.** Only the landing Display heading is fluid. All in-app type is a fixed rem
scale so headings never shrink oddly inside panels or the sidebar-width schema column.

**The Mono-For-Truth Rule.** Anything the database produces or the player types — SQL, results,
column names, types — renders in JetBrains Mono at 14px. Mono signals "this is real, from the engine."

## 4. Elevation

The system is layered, not flat, and depth is carried by a single warm-tinted paper shadow plus a
tactile press effect — never by heavy borders alone. Cards float a little above the slate on
`--shadow-paper`; buttons carry a hard 2px bottom edge that reads as a physical key and collapses to
0 when pressed. The feedback modal lifts furthest, with an inset hairline highlight along its top to
catch the light.

### Shadow Vocabulary

- **Paper** (`box-shadow: 0 6px 24px rgba(12, 12, 22, 0.5)`, token `--shadow-paper`): the default
  resting elevation for every card, panel, editor shell, and result table.
- **Press Edge** (`box-shadow: 0 2px 0 <edge-color>, var(--shadow-paper)`): buttons stack a 2px solid
  bottom edge in their own darker hue on top of the paper shadow. On `:active` the edge goes to
  `0 0 0`, dropping the button 1px — the tactile "press."
- **Modal Lift** (`box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.6)`):
  the mission-feedback modal — a deep drop for separation plus an inset top highlight reading as
  candlelight on a raised edge.

### Named Rules

**The Pressable-Key Rule.** Interactive buttons are physical: a colored bottom edge at rest, no edge
on press, a 1px drop, and a brightness lift on hover. Static, edgeless buttons are wrong here.

**The Warm-Shadow Rule.** Shadows are tinted toward the crust (`rgba(12,12,22,...)`), not neutral
black. It keeps depth consistent with the candlelit substrate.

## 5. Components

Components are tactile and bookish: substantial, hand-made, lit from a single warm source. Shape,
color, and every interaction state below are drawn from `apps/web/src/shared/ui/` and the mission
feature components.

### Buttons

- **Shape:** gently rounded (8px, `rounded-lg`), 2px border, padding `10px 22px`, Georgia label at
  tracking 0.04em.
- **Default:** vertical slate gradient (Slate Raised → Ink Base), Parchment Text, Slate Edge border,
  Press Edge shadow. The neutral action (Submit Answer, Back to the Casebook).
- **Primary:** vertical gold gradient (Candle Gold Highlight → Candle Gold) with Ink Crust text and a
  gold border/edge. The one emphasized action per surface (Open the Casebook, Run Query, Start or
  Continue on a Case card, Next Mission).
- **Danger:** vertical red gradient (Warning Red Highlight → Warning Red) with Ink Crust text. Reset
  Database only.
- **Ghost:** transparent, Slate Edge border, Parchment Dim text, no shadow. Low-emphasis navigation
  and tools (Grimoire, Format, Hint).
- **Hover / Active / Disabled:** hover brightens 110% and lifts 1px (motion-safe); active drops 1px
  and flattens the press edge; disabled drops to 45% opacity with `not-allowed` cursor. Transitions
  run 120ms over transform, box-shadow, and filter.
- **Focus:** a 2px Rune Lavender `:focus-visible` ring with a 2px Ink-Base offset on every button.

### Named Rules

**The Explore-Then-Seal Rule.** In the workbench, gold stays on **Run Query** — you run many times
and submit once, so the frequently-used, low-stakes action carries the emphasis and exploration is
encouraged. **Submit Answer** is the default slate button until a result exists, at which point it
gains a soft Candle Gold ring (`ring-ctp-yellow/70`) marking it as the earned, terminal step. Submit
never takes the gold gradient; the ring is how it reads as "ready to seal" without stealing the one
candle.

### Cards / Containers

- **Corner Style:** 12px (`rounded-xl`) for standard panels — schema explorer, result table, hint,
  objective, editor shell; 14px for the Grimoire "manuscript" cards; 16px for the feedback modal.
- **Background:** Ink Base for standard cards; a Slate Raised → Ink Base gradient for the elevated
  "manuscript" cards (feedback modal, Grimoire entries).
- **Border:** 2px Slate Border (standard) or 3px Slate Edge (elevated manuscript cards).
- **Shadow Strategy:** Paper at rest; Modal Lift for the feedback modal. See Elevation.
- **Internal Padding:** ~14px standard panels; 22–30px for manuscript cards and the modal.

### Inputs / Editor

- **SQL Editor:** CodeMirror with the `catppuccinMacchiato` theme, 220px tall, JetBrains Mono 14px,
  SQLite dialect with uppercased keywords and autocompletion. Placeholder in muted tone. It sits in
  an Ink-Base shell with a Mantle toolbar strip of buttons beneath it.
- **Read-only SQL blocks:** the same CodeMirror theme, non-editable, line-wrapped, 8px radius, 1px
  Slate Border — used to print the player's query and the reference solution.
- **Do not gate validity client-side:** Run and Submit stay enabled on any non-empty input; SQLite's
  own error message is the teaching surface (see Do's and Don'ts).

### Chips / Badges

- **Concept chip:** pill (`rounded-full`), Slate Border fill, 1px Muted-Deep border, JetBrains Mono
  12px. Lists the SQL concepts a completed mission taught.
- **XP readout:** gold serif figure with the XP icon in the Casebook's progress panel, above a slim
  gold progress bar of solved Missions.
- **XP reward badge:** pill with a **dashed** Candle Gold border on Ink Mantle, 1.3rem gold serif —
  the earned-XP moment in the feedback modal. Dashed border signals "an inscription," not a metric.
- **Solved-count pill:** pill, Ink Mantle fill, 1px Slate Edge border, mono "n / m solved" on each
  Case card; the mission-number circle beside a completed Mission turns Seal Green.

### Tables (Result Grid)

- **Structure:** full-width, collapsed borders, JetBrains Mono 14px, inside a card with a 320px
  max-height scroll region.
- **Header:** sticky, Slate Raised fill, Candle Gold text, left-aligned — gold names the columns the
  engine returned.
- **Rows:** Parchment Text on Ink Base, zebra striping via `rgba(255,255,255,0.03)` on even rows,
  1px Slate-Raised bottom rule. NULL and blob render as muted italic placeholders.

### Navigation

- Top-bar only: an `h1` on the left, ghost buttons on the right. No persistent side navigation
  anywhere. The Casebook dashboard is the hub: a progress panel beside a column of Case cards, each
  listing its Missions as numbered rows with one Start / Continue action on the next unlocked
  Mission. Locked Cases render dimmed with a coming-soon note.

### Signature Component: The Split Mission Workbench

The clearest expression of the North Star: the Mission screen splits into a lesson pane and a
workbench. The lesson pane holds the incident briefing — the business problem in the company's
voice — and the Primer, its section headings struck in Ember Peach serif. The workbench holds the
SQL editor, the result grid, and the schema explorer, always the primary surface. The story is the
incident itself; it frames the work from its own pane and never interrupts the query loop.

## 6. Do's and Don'ts

### Do

- **Do** keep the workbench primary. The editor, result grid, and schema are the main surface on
  every mission screen; narrative frames and then recedes ("Workbench first, story as candlelight").
- **Do** spend Candle Gold (`#eed49f`) only on headings, the one primary action, current/active
  state, and earned rewards. Rarity is the point.
- **Do** render every SQL and data surface in JetBrains Mono at 14px, and keep Georgia serif on
  headings and buttons.
- **Do** give buttons their press: a colored 2px bottom edge at rest, flattened on `:active`, a 1px
  drop, and a hover brightness lift, plus a visible Rune Lavender `:focus-visible` ring.
- **Do** keep gold on **Run Query** and let **Submit Answer** earn a soft gold ring only once a result
  exists (The Explore-Then-Seal Rule) — never hand Submit the gold gradient.
- **Do** draw toolbar and heading icons as hand-authored SVG inking in `currentColor`; never use OS
  emoji or unicode glyphs (they render inconsistently and break the drawn aesthetic).
- **Do** show SQLite's raw error verbatim in the red error card (`whitespace-pre-wrap`, mono, shake
  animation). The error message is the mentor.
- **Do** provide a `motion-safe:` gate and a reduced-motion alternative for every animation
  (page-fade, fade-in/out, shake, card-rise/settle, and the route crossfade via the View
  Transitions API); motion must convey state, never decorate.
- **Do** verify body/label text hits ≥4.5:1 against Ink Base; if a gray is even close, move it up the
  Parchment ramp toward `#cad3f5`.

### Don't

- **Don't** build certificates, streak calendars, or course-catalog marketing cards. This is not a
  corporate learning-management system; progress is solved Missions and earned XP, nothing more.
- **Don't** add streaks, confetti, celebratory bursts, or a persistent mascot. Rewards are earned and
  quiet — the dashed gold XP badge and a calm "Mission Complete," nothing more.
- **Don't** introduce a left icon sidebar, statistic cards, charts, or a default administrative dark
  template. This is not a generic software-as-a-service dashboard.
- **Don't** reach for skulls, blood-red fields, or oppressive darkness. Warmth, scholarship, and
  subtle magic carry the mood — this is not grimdark.
- **Don't** tint the slate base toward brown or "parchment" to force warmth; warmth comes from gold,
  peach, and the top-center radial glow. The substrate stays cool.
- **Don't** disable Run or Submit based on client-side SQL validity, or hide/soften SQLite's output.
  Submit is disabled only on empty input.
- **Don't** use Muted tones (`overlay0`–`overlay2`) for body text — they are for non-essential meta
  (row counts, timestamps, column types) only.
- **Don't** swap button labels to a sans-serif or add display fonts to data cells; the serif-button /
  mono-data split is deliberate.
