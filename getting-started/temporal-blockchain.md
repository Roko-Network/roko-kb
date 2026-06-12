# What is Temporal Blockchain?

A temporal blockchain treats time as a **consensus input**, not metadata. On most chains, the block timestamp is a value the block producer asserts and other validators loosely sanity-check; nothing in consensus measures whether it is true, and nothing stops the producer from quietly reordering or dropping transactions. ROKO's design changes both: validators continuously measure time against each other, and transactions carry signed receipts that consensus enforces.

## Why time as a consensus input matters

Two concrete failure modes on conventional chains:

1. **Ordering manipulation.** The block producer chooses transaction order. Private reordering is invisible and profitable.
2. **Silent censorship.** A producer can simply omit your transaction, and no rule of the chain is violated.

ROKO addresses both with mechanisms you can verify in the code, not with a vague "MEV-resistant" label:

- **Deterministic ordering fixed at receipt.** A timestamping queue assigns each transaction a canonical nanosecond timestamp when it enters the pool. The queue is fee-priority: higher-fee transactions receive earlier canonical timestamps under a transparent, protocol-level rule (the queue runs by default and can be disabled with `--no-fee-priority-queue`). The runtime then enforces per-block temporal ordering and maintains a monotonic transaction watermark. Fees still set priority — openly — but there is no discretionary reordering by the block producer. <!-- fact:CC-19,CC-18 -->
- **Per-receipt inclusion enforcement.** Every transaction receives an ECDSA-signed temporal receipt at pool admission. A block that omits a receipted transaction past its inclusion deadline — 15 seconds by default — is rejected at block import. The 15-second figure is an *inclusion deadline*, not a latency claim: it is the window after which omission makes a block invalid. <!-- fact:CC-17 -->

## PoAT mechanics, at overview level

**Proof of Accurate Time (PoAT)** is a consensus *modifier* layered on Substrate's standard BABE (block production) + GRANDPA (finality). It is designed so that measured time quality influences block-production eligibility and rewards; today the mesh measures and records per-validator time quality on-chain, while consensus-consequence enforcement is being enabled in stages. <!-- fact:CC-02,PAL-29,CC-32,CC-14,CC-15 -->

The architecture has four layers: libp2p networking, the validator time mesh, the BABE+GRANDPA+PoAT blockchain layer, and applications on top. <!-- fact:DOC-01 -->

### 1. The time mesh

Validators run "PTP Squared" — a native Rust peer-to-peer time-sync layer over the `/roko/timesync/1` libp2p protocol. It estimates clock offsets between peers using lucky-packet sampling, scores peer reputation with Welch's t-test, detects convergence, and selects time sources by path cost. The output is a single **mesh consensus time** backed by multi-validator agreement. <!-- fact:CC-13 -->

The PTP Squared algorithms are credited to Lasse Limkilde Johnsen (September 2021 Technical Preview). <!-- fact:DOC-27 -->

### 2. Time quality, on-chain

Mesh state reaches the runtime through a block inherent consumed by a timesync pallet, which stores per-block and per-validator time quality on-chain as a fixed-point score (0–10,000), records health checkpoints every 100 blocks, and defines time-sync offences with slash fractions (persistent drift 1%, low reputation 1%, contradictory offsets 5%). <!-- fact:CC-14 -->

**Current status, disclosed:** offence *enforcement* is disabled in both compiled runtimes today — violations are detected and recorded, but do not slash. This is a deliberate maturation step, not a hidden gap. <!-- fact:CC-15 -->

Each validator also self-classifies its physical time source — a Timebeat PTP daemon, chrony (NTP), or GNSS/PPS hardware with NIC hardware timestamping — reporting a measured root-distance-to-UTC in nanoseconds. GNSS/PPS hardware earns the Anchor tier; software-disciplined clocks land in Standard or Minimal. <!-- fact:CC-16 -->

### 3. Receipts and the consensus time oracle

Beyond ordering and inclusion enforcement, the mesh consensus time is queryable by anyone: the node exposes a `temporal_*` JSON-RPC namespace (consensus time, per-transaction timestamps, mesh state, validator time quality, and more) on the standard RPC port, and smart contracts can read consensus time directly from a temporal precompile. <!-- fact:CC-20,CC-23 -->

Temporal timestamps are nanosecond-resolution `u128` values (NanoMoment). For what that resolution does and does not guarantee, read [Nanosecond Precision: Resolution vs. Accuracy](./nanosecond-precision.md). <!-- fact:CC-18 -->

## What this does NOT change for builders

Ethereum tooling semantics are preserved. The EVM's `block.timestamp` remains the standard seconds-level value; nanosecond temporal data is additive, exposed through the `temporal_*` RPCs and the precompile rather than by changing the Ethereum JSON-RPC schema. Your existing contracts and wallets behave exactly as they do elsewhere — temporal features are opt-in. <!-- fact:EVM-25,EVM-31 -->
