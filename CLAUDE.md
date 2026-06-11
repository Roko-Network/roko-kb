# CLAUDE.md

Guidance for agents working in this repository.

## What this repo is

Public documentation for **docs.roko.network** — GitBook-style markdown, no build system. ROKO Network is a Substrate (Polkadot SDK 1.13) + Frontier **EVM Layer 1** whose differentiator is **Proof of Accurate Time (PoAT)**: a physics-anchored consensus modifier (PTP+Squared validator time mesh, temporal receipts, fee-priority canonical ordering, `temporal_*` RPC namespace).

## Truth discipline (non-negotiable)

- **Source of truth is the `roko_network` node repo** — not this KB, not older drafts, not memory. If a claim isn't evidenced there, it doesn't ship here.
- **Fact registry**: `_facts/facts.yaml` — evidence-graded facts (proven/likely/uncertain) extracted from the node repo. Every factual claim about the network cites fact ids inline: `<!-- fact:CC-05 -->` (invisible in GitBook, mechanically auditable).
- A claim with no supporting fact: reframe as an explicit target/roadmap (only if a fact evidences it as a stated target) or **cut it**.
- **Banned as shipped claims**: sub-100ns accuracy · "MEV-resistant by design" · "2-3 second blocks" · OCP-TAP / IEEE-1588 *compliance* (they are supported time-source technologies, not certifications) · any treasury/supply/audit figure absent from the registry.
- **Key truths** (as of registry generation): testnet runs 2s blocks today, 6s is the production-testnet target (M-19); mainnet runtime is 3s but **no mainnet exists** (EVM chain id TBD); slashing enforcement is disabled; testnet validator registration is gated.
- **Framing traps**: the 15-second window is an **inclusion deadline** (censorship check), never a latency/speed claim. Ordering is **fee-priority**, never "time-priority". Nanosecond = timestamp **resolution**, never an accuracy guarantee.

## Voice

- `README.md` and `getting-started/introduction.md` carry the ROKO voice (mythology terms — chronarchy, meshheads, atomictruth — allowed there only).
- All reference pages: clean technical. Public term bank: `resources/glossary.md`.

## Structure

- Nav comes from `_manifest.json` files (root + per-directory). Adding/retitling a page = update the manifest + `PAGE_HIERARCHY_GUIDE.md`.
- **Do not touch**: `meetings/` and `archive/` (internal record — REMOVED from public nav 2026-06-11 by legal review; never re-add to `_manifest.json` without counsel sign-off), `.public/` (legal).
- **Project Rosé is excluded** from this KB by owner decision (2026-06-11). Do not re-add.

## Maintaining the registry

`_facts/facts.yaml` is generated from the docs-parity capability extraction (capability map lives outside this repo). Never hand-edit claims without verifying evidence in the node repo first; record corrections in the evidence field.
