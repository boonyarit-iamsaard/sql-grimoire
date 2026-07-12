# Asset resources — curated shortlist

A working reference of online sources for game assets, filtered for license clarity (the project
has commercial ambitions, so `ASSET-LICENSES.md` discipline applies) and stylistic fit with the
hand-drawn ledger look. Before use, selected entries must be migrated into `ASSET-LICENSES.md` with
their exact licensing details.

## 2D art and icons

- **[Kenney.nl](https://kenney.nl)** — free, everything CC0 (no attribution, commercial
  use allowed). Enormous, consistent packs: RPG icons, UI elements, map tiles. The safest
  license available; a good default yes.
- **[Game-icons.net](https://game-icons.net)** — roughly 4,000 monochrome SVG icons, heavily
  fantasy-themed (scrolls, ledgers, potions, wax seals), CC-BY 3.0. The closest fit to the
  existing art pipeline: editable vectors that can be recolored to the Catppuccin tokens.
  Attribution required — one line in `ASSET-LICENSES.md` covers it.
- **[OpenGameArt.org](https://opengameart.org)** — free, but licenses vary per asset (CC0,
  CC-BY, GPL). GPL assets may be used commercially subject to their copyleft and source-sharing
  obligations. Good for one-off finds; record each asset's exact license and the compatibility
  decision for this project.
- **[itch.io asset marketplace](https://itch.io/game-assets)** — the deepest pool of both
  free and paid indie packs (character portraits, UI kits, tilesets). License terms are set by
  each creator; read each page, then record the asset's exact license and the compatibility
  decision for this project.
- **[CraftPix](https://craftpix.net)** — freebie section plus affordable paid packs, leaning
  polished-casual 2D. Royalty-free license for commercial games.

## Audio

Current sounds are WebAudio-synthesized; these are for when that ceiling arrives.

- **[Freesound.org](https://freesound.org)** — huge sound-effects library; filter searches
  by CC0 only to keep licensing simple.
- **[Sonniss GDC bundles](https://sonniss.com/gameaudiogdc)** — tens of gigabytes of
  professional sound effects released free most years, royalty-free for commercial use. The
  best value in game audio.
- **[Pixabay Audio](https://pixabay.com/sound-effects)** — free music and sound effects, no
  attribution required, and commercial use allowed. Standalone redistribution is prohibited;
  recognizable trademarks, brands, and other third-party rights require separate review. Quality
  varies, but browsing is fast.
- **[incompetech](https://incompetech.com)** (Kevin MacLeod) — the classic CC-BY music
  library; tavern-and-parchment moods are well represented. A paid no-attribution license is
  available.

## Fonts

- **[Google Fonts](https://fonts.google.com) / [Fontsource](https://fontsource.org)** — the
  project already self-hosts JetBrains Mono via Fontsource. Select a specific font, verify its
  actual license, which may be OFL, Apache, UFL, FFL, or another license, and record that exact
  license in `ASSET-LICENSES.md`.
- **[Fontshare](https://fontshare.com)** — free, high-quality faces from the Indian Type
  Foundry with a permissive license; the middle ground between Google Fonts and paid
  foundries.

## License traps

- "Free for personal use" means not free for this project — SQL Grimoire is a commercial
  prototype, so treat those as paid.
- Asset packs on general marketplaces increasingly contain undisclosed AI-generated content
  with murky provenance — favor named creators with track records.
- Nothing enters the repository without a line in `ASSET-LICENSES.md` recording what it is,
  where it came from, and under which license.
