# Asset licenses

| Asset                                                                      | Source                                                             | License                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| JetBrains Mono font                                                        | `@fontsource/jetbrains-mono` (self-hosted, bundled)                | SIL Open Font License 1.1 — commercial web use permitted |
| Catppuccin Macchiato editor theme                                          | `@catppuccin/codemirror`                                           | MIT                                                      |
| `src/assets/maps/world-map.svg`                                            | Hand-authored for this prototype                                   | Same as project (no third-party rights)                  |
| `src/assets/characters/merchant/{neutral,worried,happy}.svg`               | Hand-authored for this prototype                                   | Same as project                                          |
| `src/assets/characters/archivist/{neutral,stern,troubled}.svg`             | Hand-authored for this prototype                                   | Same as project                                          |
| `src/assets/locations/{merchant-guild,inner-archives,locked-location}.svg` | Hand-authored for this prototype                                   | Same as project                                          |
| `src/assets/ui/xp-icon.svg`                                                | Hand-authored for this prototype                                   | Same as project                                          |
| Button click and mission completion sounds                                 | Synthesized at runtime with WebAudio (`src/shared/audio/sound.ts`) | Not applicable; no audio files                           |

Deviations from the requirements' asset list: `.webp` images are replaced by hand-authored `.svg`
(smaller, sharper, and free of external licensing requirements), the `.ogg` audio files are replaced by WebAudio synthesis,
and the dialogue frame is CSS rather than an image. All are safe for commercial web use because
nothing is third-party.
