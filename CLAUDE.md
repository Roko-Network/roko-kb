# CLAUDE.md

Guidance for agents working in this repository.

@AIWG.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Public documentation for **docs.roko.network** - a Pagenary-published knowledge base for ROKO Network. ROKO Network is a Substrate (Polkadot SDK 1.13) + Frontier **EVM Layer 1** whose differentiator is **Proof of Accurate Time (PoAT)**: a physics-anchored consensus modifier (PTP Squared validator time mesh, temporal receipts, fee-priority canonical ordering, `temporal_*` RPC namespace).

## Truth discipline (non-negotiable)

- **Source of truth is the `roko_network` node repo** — not this KB, not older drafts, not memory. If a claim isn't evidenced there, it doesn't ship here.
- **Fact registry**: `_facts/facts.yaml` — evidence-graded facts (proven/likely/uncertain) extracted from the node repo. Every factual claim about the network cites fact ids inline: `<!-- fact:CC-05 -->` (invisible in GitBook, mechanically auditable).
- A claim with no supporting fact: reframe as an explicit target/roadmap (only if a fact evidences it as a stated target) or **cut it**.
- **Banned as shipped claims**: sub-100ns accuracy · "MEV-resistant by design" · "2-3 second blocks" · OCP-TAP / IEEE-1588 *compliance* (they are supported time-source technologies, not certifications) · any treasury/supply/audit figure absent from the registry.
- **Key truths** (as of registry generation): testnet runs 2s blocks today, 6s is the production-testnet target (M-19); mainnet runtime is 3s but **no mainnet exists** (EVM chain id TBD); slashing enforcement is disabled; testnet validator registration is gated.
- **Framing traps**: the 15-second window is an **inclusion deadline** (censorship check), never a latency/speed claim. Ordering is **fee-priority**, never "time-priority". Nanosecond = timestamp **resolution**, never an accuracy guarantee.

## Key files

- `README.md` - Pagenary homepage/welcome page and publishing quickstart
- `tenants.json` - Pagenary tenant registry; the active tenant is `roko-kb`
- `config.json` - Site branding, SEO, Docs Map, theme picker, and export settings
- `_manifest.json` - Root Pagenary navigation order and exclusions
- `PAGE_HIERARCHY_GUIDE.md` - Defines the complete documentation structure and page ordering for Pagenary
- `getting-started/` - Introduction and onboarding docs
- `core-technology/` - Technical docs on temporal infrastructure, consensus, network architecture
- `signals/` - Trading signals and market intelligence docs
- `products/` - Project Nexus and use cases
- `meetings/` - Meeting notes and dated project records
- `articles/` - Published articles and long-form content
- `resources/` - Glossary, FAQ, brand assets
- `archive/` - Historical documents

## Voice

- `README.md` and `getting-started/introduction.md` carry the ROKO voice (mythology terms — chronarchy, meshheads, atomictruth — allowed there only).
- All reference pages: clean technical. Public term bank: `resources/glossary.md`.

## Publishing

- All documentation is in Markdown format
- Documentation structure follows Pagenary manifests and `PAGE_HIERARCHY_GUIDE.md`
- Build and preview through npm scripts backed by `@pagenary/publisher`
- Pagenary emits the published Fortemi search index under `dist/roko-kb/search-index/`
- AIWG maintains a separate project artifact index under `.aiwg/.index/project`
- `.future-docs/` is hidden and contains placeholder content for future features - ignore this directory

## Structure

- Nav comes from `_manifest.json` files (root + per-directory). Adding/retitling a page = update the manifest + `PAGE_HIERARCHY_GUIDE.md`.
- **Do not touch**: `meetings/` and `archive/` (internal record — REMOVED from public nav 2026-06-11 by legal review; never re-add to `_manifest.json` without counsel sign-off), `.public/` (legal).
- **Project Rosé is excluded** from this KB by owner decision (2026-06-11). Do not re-add.
- When editing documentation:
  1. Refer to `PAGE_HIERARCHY_GUIDE.md` for the expected page hierarchy
  2. Maintain consistent markdown formatting
  3. Add new pages to the relevant `_manifest.json`
  4. Run `npm run build:docs` and validate the Fortemi search index before release

## Maintaining the registry

`_facts/facts.yaml` is generated from the docs-parity capability extraction (capability map lives outside this repo). Never hand-edit claims without verifying evidence in the node repo first; record corrections in the evidence field.

## Fonts & style override (maintenance note)

`overrides/styles.css` is the engine's `src/styles.css` with brand `@font-face` rules prepended (Rajdhani + JetBrains Mono, self-hosted woff2 in `overrides/fonts/`, both SIL OFL — see fonts/LICENSES.txt) and a heading-typography rule appended. **On Pagenary upgrades, regenerate this file from the new `src/styles.css`** (the engine has no custom-CSS hook yet — feature request candidate). Theme colors from config.json apply AFTER overrides, so the override never needs theme values baked in. HK Guise and Aeonik are commercially licensed — never ship their files.

<!-- AIWG:claude-md-hook:start -->

# AIWG

@AIWG.md

<!--
  This block is managed by `aiwg regenerate` and `aiwg use`.
  Operator content above and below this block is preserved on regenerate.
  To change AIWG.md content, edit .aiwg/AIWG.md (the normalized source)
  then run `aiwg regenerate`.
-->

<!-- AIWG:claude-md-hook:end -->
