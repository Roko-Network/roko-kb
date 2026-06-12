# Consensus Mechanism

Roko does not replace consensus with something exotic. Block production is BABE and finality is GRANDPA — the same battle-tested Substrate machinery securing Polkadot — with Proof of Accurate Time (PoAT) layered on as a **consensus modifier**: a validator time mesh whose measurements land on-chain and feed back into how the network treats its validators. <!-- fact:CC-02,PAL-29,CC-32 -->

## BABE + GRANDPA

- **BABE** assigns block-production slots. Genesis epoch config allows primary and secondary plain slots with a primary-slot probability of 1/4. <!-- fact:CC-03 -->
- **GRANDPA** provides provable finality. The session key set also includes ImOnline, AuthorityDiscovery, Mixnet, BEEFY, and a Roko-specific Temporal key. <!-- fact:CC-02 -->
- Epochs are 50 blocks on the testnet (~100 s at 2 s blocks, with 3 sessions per era) and 60 minutes of blocks on the mainnet runtime. <!-- fact:CC-12 -->

Block times in the compiled runtimes: the testnet development chain runs **2-second blocks** today, with an in-code note (M-19) that the production testnet target is 6 seconds; the mainnet runtime is built for **3-second blocks**. <!-- fact:CC-05,CC-04 -->

## PoAT: Time as a Consensus Input

PoAT — Proof of Accurate Time — works as a pipeline from physical clocks to on-chain consequences:

1. **The time mesh measures.** Validators run the PTP Squared mesh (`/roko/timesync/1` over libp2p), probing each other's clocks, scoring peers with Welch's t-test reputation, and converging on a mesh consensus time. See [Temporal Infrastructure](./temporal-infrastructure.md). <!-- fact:CC-13 -->
2. **An inherent puts it on-chain.** Each block carries a time-mesh state snapshot consumed by `pallet-timesync`, which stores per-block and per-validator time quality as a fixed-point score (0–10,000) and records health checkpoints every 100 blocks. <!-- fact:CC-14 -->
3. **Quality feeds back into consensus.** The design, as documented in the project README, is that time quality influences block-production eligibility and rewards — making accurate time a condition of full participation rather than a courtesy. (The README also envisions weighting finality votes by time quality; no runtime evidence implements that yet.) <!-- fact:CC-32,CC-15 -->

Validators also self-classify their time source (GNSS/PPS hardware, a Timebeat PTP daemon, chrony, or plain system clock) into Anchor, Standard, or Minimal tiers, with a measured root-distance-to-UTC in nanoseconds. <!-- fact:CC-16 -->

## Offences and Slashing — Current Status

`pallet-timesync` defines a `TimeSyncOffence` integrated with the standard offences pallet, with slash fractions of 0% for excessive offset, 1% for persistent drift, 1% for low reputation, and 5% for contradictory offsets. <!-- fact:CC-14 -->

**Disclosure: enforcement is currently disabled.** Both compiled runtimes set `EnforcementEnabled = false` — time-quality violations are detected and recorded, but nothing is slashed. Drift bounds are configured (5 ms block-mesh drift, 10 s cross-validator drift) and offence reporting is wired up, so flipping enforcement on is a runtime configuration change, not new machinery. Until that happens, PoAT's penalties are observational. <!-- fact:CC-15,PAL-28 -->

## Temporal Rules at Block Import

One temporal rule is already enforced at the consensus level: every transaction gets an ECDSA-signed temporal receipt at pool admission, and **block import rejects blocks that omit a receipted transaction past its inclusion deadline** (15 seconds by default, enforcement on by default). Honest validators will not build on a block that silently dropped a receipted transaction. See [Temporal Transactions](./temporal-transactions.md). <!-- fact:CC-17 -->

## Staking

Staking is denominated in **pwROKO** — wrapped ROKO minted by locking the native token 1:1 — in both runtimes, using the standard Substrate staking pallet with multi-phase validator election and a bags-list voter list. The reward curve targets 2.5–10% inflation with an ideal stake of 50%. <!-- fact:CC-25,PAL-32,PAL-14 -->

## Testnet Governance Caveat

The runtimes include `pallet-sudo` with full root permissions, alongside the council/democracy governance stack. This is normal for a network at this stage and worth knowing: testnet chain state can be modified by the sudo key. <!-- fact:PAL-05,PAL-15 -->

## See Also

- [Temporal Infrastructure](./temporal-infrastructure.md) — how the time mesh works
- [Temporal Transactions](./temporal-transactions.md) — receipts and inclusion enforcement
- [Validator Requirements](./validator-requirements.md) — time-source tiers and hardware
