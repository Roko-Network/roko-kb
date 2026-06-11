# GitBook Page Hierarchy & Ordering Guide

Navigation is driven by `_manifest.json` files (root + per-directory). This guide mirrors them — when you add/remove/retitle a page, update the directory's `_manifest.json` AND this tree.

```
📚 ROKO Network Documentation
│
├── 🏠 Welcome to ROKO (README.md)
│
├── 📂 Getting Started
│   ├── Introduction
│   ├── What is a Temporal Blockchain?
│   ├── Nanosecond Precision: Resolution vs Accuracy
│   └── Join the Testnet
│
├── 📂 Core Technology
│   ├── Overview
│   ├── Temporal Infrastructure (PTP Squared mesh)
│   ├── OCP-TAP and Open Time Hardware
│   ├── IEEE 1588 PTP
│   ├── Hardware Timestamping
│   ├── From Time Beacons to the Time Mesh (heritage → current architecture)
│   ├── Consensus (BABE/GRANDPA + PoAT)
│   ├── Temporal Transactions
│   ├── Transaction Ordering & Censorship Resistance
│   ├── NanoMoment
│   ├── Network Architecture
│   └── Validators
│
├── 📂 Products & Solutions
│   └── Use Cases
│
├── 📂 Articles
│   └── Of Time and Stamps
│
├── 📂 Resources
│   ├── FAQ
│   ├── Glossary
│   └── Community
│
└── (end of public nav)
```

Hidden from nav: `CLAUDE.md`, `PAGE_HIERARCHY_GUIDE.md` (root `_manifest.json` exclude), `_facts/` (registry), `.public/` (legal pages served separately), **`meetings/`, `archive/`, and `signals/`** (pulled from public nav 2026-06-11; signals retired with the launch-announcement removal — internal record stays in repo; counsel-supervised return only).

Removed by owner decision (2026-06-11): Project Rosé (`products/project-rose.md`) — excluded from the public KB; era materials live in the private archive.
