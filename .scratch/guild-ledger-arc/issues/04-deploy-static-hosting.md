# 04 — Deploy to static hosting

Status: needs-triage
Blocked by: 03

## Problem

The prototype is unreachable by a playtester: no hosting, no published URL. Playtesting
requires a URL that opens in a browser with zero setup.

## Open decision (why needs-triage)

The founder has not yet chosen the host. Standing recommendation from the grilling session:
**Cloudflare Pages** — free, root-path URL, native SPA fallback for TanStack Router deep
links, deploys on push. Alternatives considered: Netlify (equivalent; pick if an account
already exists) and GitHub Pages (no new account, but costs a Vite `base` path, router
`basepath`, and the `404.html` SPA redirect hack).

## Facts established

- sql.js runs single-threaded WebAssembly: no COOP/COEP headers required, so any static host
  works.
- Deep links (`/mission/$missionId`, `/grimoire`) need an SPA fallback to `index.html`.
- The production build already passes (`pnpm build`).

## Acceptance

A fresh browser with no prior state can open the URL, play the full Arc, refresh mid-Mission
without losing Player Progress, and deep-link directly to `/grimoire`.
