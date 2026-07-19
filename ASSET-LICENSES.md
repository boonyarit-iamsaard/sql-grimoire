# Asset licenses

| Asset                                      | Source                                                             | License                                                  |
| ------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| JetBrains Mono font                        | `@fontsource/jetbrains-mono` (self-hosted, bundled)                | SIL Open Font License 1.1 — commercial web use permitted |
| Catppuccin Macchiato editor theme          | `@catppuccin/codemirror`                                           | MIT                                                      |
| `apps/web/src/assets/ui/xp-icon.svg`       | Hand-authored for this project                                     | Same as project (no third-party rights)                  |
| Button click and mission completion sounds | Synthesized at runtime with WebAudio (`src/shared/audio/sound.ts`) | Not applicable; no audio files                           |

All art is hand-authored SVG and all sound is synthesized at runtime, so nothing beyond the font
and the editor theme is third-party. The fantasy-era assets (world map, character portraits, and
location illustrations) were removed with the business-incident reframing
(`docs/adr/0001-business-incident-framing.md`); they remain available in git history.
