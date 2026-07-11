# Domain Docs

This document explains how engineering skills should use the repository's domain documentation
when exploring the codebase.

## Required reading before exploration

- **`CONTEXT.md`** at the repository root, or
- **`CONTEXT-MAP.md`** at the repository root, if it exists. It identifies one `CONTEXT.md` file per context. Read each file relevant to the topic.
- **`docs/adr/`**. Read ADRs that apply to the relevant area. In multi-context repositories, also check `src/<context>/docs/adr/` for context-specific decisions.

If any of these files do not exist, **proceed silently**. Do not report their absence or suggest
creating them in advance. The `/domain-modeling` skill, reached through `/grill-with-docs` and
`/improve-codebase-architecture`, creates them when terms or decisions are resolved.

## File structure

Single-context repository (most repositories):

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repository (indicated by `CONTEXT-MAP.md` at the root):

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                          # system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  # context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When an output names a domain concept in an issue title, refactoring proposal, hypothesis, or test
name, use the term defined in `CONTEXT.md`. Do not use synonyms that the glossary explicitly avoids.

If a required concept is absent from the glossary, determine whether the proposed language is
unnecessary or whether the glossary has a genuine gap. Record genuine gaps for `/domain-modeling`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
