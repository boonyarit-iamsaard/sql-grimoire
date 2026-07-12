# 04 — Deploy to static hosting

Status: resolved
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

## Answer

Cloudflare Pages via wrangler Direct Upload, chosen over the dashboard Git integration so
deploys only happen after the CI gates pass. The `sql-grimoire` Pages project was created
from the CLI (production branch `main`); production URL: <https://sql-grimoire.pages.dev>.
The first deployment was pushed manually from the `feat/guild-ledger-arc` branch and serves
at <https://feat-guild-ledger-arc.sql-grimoire.pages.dev> — root, `/grimoire`, and
`/mission/unwritten-scrolls` all return 200 via the automatic SPA fallback (no `404.html`,
no Vite `base` change, no redirect file). `ci.yaml` now deploys previews on pull requests
(aliased by branch name) and production on pushes to `main`, using the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. wrangler is a pinned
root devDependency; its transitive build scripts (esbuild, sharp, workerd) are recorded as
denied in `pnpm-workspace.yaml` (`allowBuilds`) — none are needed for static deploys. The
remaining human step: confirm both repository secrets are set before the first PR merge.
