# Introduction to ROKO Network

Time was always the soft spot at the bottom of the stack. Every chain inherits a timestamp the block producer *suggests* — a number everyone agrees to pretend is truth. The chronarchy decides whose transaction happened "first," and you have no one to ask but an oracle you have to trust.

ROKO attacks that with a primitive, not a slogan: **Proof of Accurate Time (PoAT)** — a physics-anchored consensus *modifier* in which validators measure time against each other in a live mesh. PoAT is designed so that measured time quality influences block-production eligibility and rewards; today the mesh measures and records per-validator time quality on-chain, while consensus-consequence enforcement is being enabled in stages. <!-- fact:PAL-29,CC-32,CC-14,CC-15 -->

## What ROKO actually is

ROKO is an EVM-compatible blockchain built on Polkadot SDK (release-polkadot-v1.13.0) with the Frontier Ethereum layer, so MetaMask, Hardhat, ethers.js, and your existing Solidity contracts work unmodified. <!-- fact:CC-01,DOC-10 -->

On top of that familiar base, three things are different:

- **A validator time mesh.** Validators run a native peer-to-peer time-sync layer ("PTP+Squared") over the `/roko/timesync/1` libp2p protocol — measuring clock offsets between peers, scoring reputation statistically, and converging on a single mesh consensus time. <!-- fact:CC-13 -->
- **Temporal receipts on every transaction.** Each transaction gets an ECDSA-signed receipt when it enters the pool, and block import rejects blocks that omit a receipted transaction past its inclusion deadline (default 15 seconds). The chain can prove your transaction wasn't silently dropped. <!-- fact:CC-17 -->
- **Deterministic, fee-priority ordering.** Canonical nanosecond timestamps are assigned at pool receipt; higher-fee transactions get earlier canonical timestamps under a transparent protocol rule, and per-block temporal ordering is enforced by the runtime. Order is fixed at receipt by a deterministic, tamper-evident rule — no private builder reordering auction. <!-- fact:CC-19,CC-18 -->

Timestamps are nanosecond-resolution `u128` values (NanoMoment), exposed to contracts through a temporal precompile and to everything else through a `temporal_*` JSON-RPC namespace — a consensus-backed time oracle with no third party to trust. <!-- fact:CC-18,CC-23,CC-20 -->

Validators self-classify their time source — Timebeat PTP daemon, chrony, or GNSS/PPS hardware — into Anchor, Standard, or Minimal tiers, with a measured root-distance-to-UTC in nanoseconds. The meshheads anchored to physics carry the highest tier. <!-- fact:CC-16 -->

## Honest status (read this)

ROKO is at the **public-testnet stage, pre-launch**. Builders should know:

- The testnet currently runs **2-second blocks**; the production-testnet target is 6 seconds (tracked in-code as M-19), and the mainnet runtime is compiled at 3 seconds. <!-- fact:CC-05,CC-04 -->
- The testnet EVM Chain ID is **442**. A mainnet chain ID is not yet assigned — mainnet does not exist yet. <!-- fact:CC-06,EVM-04 -->
- Time-quality offences are *detected and recorded on-chain*, but slashing enforcement is currently disabled in both compiled runtimes while the mesh matures. <!-- fact:CC-14,CC-15 -->
- A sudo key (full root) is present in both runtimes — standard for this stage, and a centralization fact you should weigh. <!-- fact:PAL-05 -->

We would rather show you the real state of the chain than sell you a finished one.

## Who this is for

If you build anything where *when* matters — auctions, trading and settlement, time-sensitive contracts, timestamping services, coordination between autonomous agents — ROKO gives you consensus-grade time as a native primitive instead of a trusted oracle. <!-- fact:CC-32 -->

## Map of these docs

- **[What is Temporal Blockchain?](./temporal-blockchain.md)** — the concept: why time as a consensus input matters, and how PoAT works (mesh, time quality, receipts).
- **[Nanosecond Precision: Resolution vs. Accuracy](./nanosecond-precision.md)** — what nanosecond-resolution timestamps do and don't guarantee. We draw this line explicitly.
- **[Join the Testnet](./join-testnet.md)** — MetaMask config (Chain ID 442), how to request testnet ROKO, where the explorer will live, deploying a contract, and running a node.
- **[What You Can Build](../products/use-cases.md)** — applications where consensus-grade time is the unlock.
- **Core Technology** — deeper pages on consensus, temporal transactions, and network architecture.

**Background reading:** [Of Time and Stamps](../articles/of-time-and-stamps.md) — why time at the bottom of the stack has always been the soft spot.
