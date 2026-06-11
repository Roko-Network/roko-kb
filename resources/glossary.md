# Glossary

The terms you'll meet in Roko's docs, RPCs, and code — each with a plain-English version and the precise definition. If a term isn't here, it usually means it's standard Substrate or Ethereum vocabulary and works the way you already expect.

---

## Time and consensus

**Proof of Accurate Time (PoAT)** — *time, measured by consensus.*
A physics-anchored consensus modifier layered on top of BABE and GRANDPA. It is designed so that a validator's time quality influences block-production eligibility and rewards; today the mesh measures and records per-validator time quality on-chain, while consensus-consequence enforcement is being enabled in stages. <!-- fact:PAL-29,CC-32,CC-14,CC-15 -->

**Time mesh (PTP+Squared)** — *the network's shared clock.*
Roko's native peer-to-peer time-synchronization layer, running over the `/roko/timesync/1` libp2p protocol. It estimates inter-validator clock offsets, scores each peer's reputation, detects convergence, and produces a single mesh consensus time. The PTP+Squared algorithms are credited to Lasse Limkilde Johnsen (September 2021 Technical Preview). <!-- fact:CC-13,DOC-27 -->

**Mesh consensus time** — *the time the whole network agrees on.*
The time value backed by multi-validator agreement. Mesh state reaches the runtime each block, where per-validator time quality is stored on-chain. <!-- fact:CC-14 -->

**Consensus time oracle** — *a trustworthy clock you can query.*
On-chain time backed by the validator mesh, exposed via the `temporal_getConsensusTime` RPC — it returns nanosecond consensus time, a time-quality score, convergence state, and peer count. No third-party time feed required. <!-- fact:CC-20,CC-21 -->

**Time quality** — *how good a validator's clock is, as a score.*
A fixed-point on-chain value (0–10,000, where 10,000 = 100%) recorded per validator per block by the timesync pallet. <!-- fact:CC-14 -->

**Validator time tiers (Anchor / Standard / Minimal)** — *how validators rank their own time source.*
Validators self-classify their time source — a Timebeat PTP daemon, chrony, GNSS/PPS hardware, or NIC hardware timestamping — reporting a measured root distance to UTC in nanoseconds. GNSS/PPS hardware yields the Anchor tier; other sources land in Standard or Minimal. <!-- fact:CC-16 -->

---

## Ordering and receipts

**Fee-priority ordering** — *deterministic ordering, set at arrival.*
A timestamping queue (enabled by default) records each transaction's arrival and assigns canonical timestamps so that higher-fee transactions receive earlier canonical timestamps. The rule is deterministic and applied at the pool — not at a block producer's discretion. <!-- fact:CC-19,EVM-12 -->

**Canonical timestamp** — *the official time your transaction happened.*
The nanosecond timestamp assigned to a transaction at pool receipt; it determines the transaction's ordering. This applies to Ethereum-submitted transactions too, with no extra fields required from wallets. <!-- fact:CC-19,EVM-31 -->

**Temporal receipt** — *proof the chain saw your transaction.*
Every transaction receives an ECDSA-signed receipt at pool admission. Blocks that omit a receipted transaction past its inclusion deadline are rejected at block import. <!-- fact:CC-17 -->

**Inclusion deadline** — *include it in time, or the block is invalid.*
The window after which omitting a receipted transaction makes a block invalid — 15 seconds by default, with enforcement on by default. This is an inclusion guarantee against silent censorship, **not** a latency or speed claim. <!-- fact:CC-17,DOC-12 -->

**Watermark** — *the chain's temporal high-water mark.*
A monotonic value maintained by the temporal-transactions pallet, which also enforces per-block temporal ordering at finalization. Contracts can read it via `getWatermark()` on the temporal precompile. <!-- fact:CC-18,CC-23 -->

**NanoMoment** — *a nanosecond timestamp.*
Roko's timestamp type: a nanosecond-precision 128-bit unsigned integer (nanoseconds since the Unix epoch). <!-- fact:CC-18 -->

---

## EVM and tooling

**Frontier (EVM compatibility)** — *your Ethereum tools just work.*
The Substrate Ethereum-compatibility layer Roko ships, pulled from a fork matching Polkadot SDK 1.13. Standard `eth_*`, `net_*`, and `web3_*` RPC namespaces are served alongside Substrate RPCs on a single port (default 9944), and `block.timestamp` in Solidity stays the standard seconds-level value — nanosecond data lives in the `temporal_*` RPCs and the temporal precompile instead. <!-- fact:CC-01,EVM-06,EVM-07,EVM-25 -->

**Precompile** — *chain features your Solidity can call.*
Native functionality exposed at fixed EVM addresses. Beyond the standard set, the testnet runtime adds pwROKO at `0x...0500`, Temporal at `0x...0600` (e.g. `getConsensusTime()`, `getWatermark()`), and Staking at `0x...0700`. <!-- fact:CC-22,CC-23 -->

**`temporal_*` RPC namespace** — *the time-aware API.*
Fourteen JSON-RPC methods served on the standard RPC port, including `temporal_getConsensusTime`, `temporal_getTransactionTimestamp` (accepts either a Substrate or an Ethereum transaction hash), `temporal_getWatermarkInfo`, and `temporal_getMeshState`. <!-- fact:EVM-08,EVM-10 -->

**Chain ID 442** — *the testnet's EVM chain ID.*
Set at genesis for all testnet chain specs. The mainnet chain ID is not yet assigned. <!-- fact:CC-06,EVM-04 -->

---

## Tokens and staking

**ROKO** — *the native asset.*
The chain's native token, 18 decimals, on an Ethereum-style chain (accounts are 20-byte Ethereum addresses; your Substrate account *is* your EVM address). <!-- fact:CC-08,CC-09 -->

**pwROKO** — *locked ROKO that does the staking work.*
A wrapped-token pallet: lock native ROKO 1:1 to mint pwROKO; unlock via a two-step request-then-finalize flow with a governance-adjustable cooloff. pwROKO is non-transferable — it can only be minted by locking and burned by unlocking — and it is the staking currency. It's exposed to the EVM through the `0x...0500` precompile. <!-- fact:CC-24,PAL-07,TOK-21 -->

**Cooloff period** — *the wait between requesting and completing an unlock.*
Governance-adjustable. In code today: 10 blocks on testnet (a development placeholder) and 14 days' worth of blocks in the mainnet runtime. <!-- fact:CC-26 -->

---

## Substrate basics

**Polkadot SDK / Substrate** — *the framework Roko is built on.*
Roko targets Polkadot SDK release 1.13.0, built with Rust 1.80.0 and a WebAssembly runtime. <!-- fact:CC-01,CC-31 -->

**BABE** — *who produces the next block.*
Substrate's block-production mechanism. On Roko, PoAT is designed so that time quality additionally influences block-production eligibility; today that quality is measured and recorded on-chain, with consensus-consequence enforcement being enabled in stages. <!-- fact:CC-02,CC-32,CC-14,CC-15 -->

**GRANDPA** — *how blocks become final.*
Substrate's finality gadget, running alongside BABE. <!-- fact:CC-02 -->

**Pallet / runtime / extrinsic** — *the chain's modules, logic, and transactions.*
Standard Substrate vocabulary: a pallet is a runtime module, the runtime is the chain's state-transition logic, and an extrinsic is a transaction or external call. Roko adds four custom pallets: pwROKO, contract-deployment-manager, temporal-transactions, and timesync. <!-- fact:PAL-04 -->

**Slot / epoch / era** — *the chain's time buckets.*
BABE's scheduling units and staking's reward period. On the current testnet runtime, epochs are 50 blocks; on the mainnet runtime, 60 minutes of blocks. <!-- fact:CC-12 -->

---

## See also

- [FAQ](faq.md)
- [Consensus](../core-technology/consensus.md)
- [Temporal Transactions](../core-technology/temporal-transactions.md)
