# ROKO Network Use Cases

ROKO is a Substrate + Frontier EVM chain whose distinguishing primitives are temporal: nanosecond-resolution canonical timestamps assigned at pool admission, deterministic fee-priority ordering, signed temporal receipts with an inclusion deadline, and a consensus time oracle readable from RPC and from contracts. This page maps those primitives to the kinds of applications they make practical. Benefits below are framed as what the primitives enable — measure your own numbers on the network. <!-- fact:CC-18,CC-19,CC-17,CC-20 -->

Everything here builds with unmodified Ethereum tooling: 20-byte accounts, standard `eth_*` RPC on one port, MetaMask with no extra fields. <!-- fact:EVM-21,EVM-07,EVM-28 -->

## Time-sensitive DeFi: auctions and order-driven markets

**The problem.** On a conventional chain, the block producer decides transaction order. For auctions, liquidations, and order books, that discretion is the attack surface: bids and orders can be reordered or sandwiched after submission.

**What ROKO provides.** Ordering is fixed by a deterministic rule at receipt, not by the producer: every transaction — Substrate or Ethereum-format — gets a canonical nanosecond timestamp at pool admission, assigned by a fee-priority queue (higher fee, earlier timestamp), and per-block temporal ordering is enforced at finalization against a monotonic watermark. <!-- fact:CC-19,EVM-31,CC-18 -->

**What you'd build.** Batch auctions settled strictly by canonical timestamp, on-chain limit order books where sequence disputes are resolvable by querying `temporal_getTransactionTimestamp` (which accepts an Ethereum tx hash directly), and liquidation engines whose ordering rules are auditable rather than asserted. <!-- fact:EVM-10 -->

## Fair launches and mints

**The problem.** Popular mints degenerate into ordering games: whoever influences the producer — or outbids in a private channel — wins allocation.

**What ROKO provides.** The ordering rule is published and protocol-level: descending fee order on a 100 ms stamping tick, with no private path around it. Receipts make exclusion provable — every transaction gets an ECDSA-signed temporal receipt, and block import rejects blocks that omit a receipted transaction past its 15-second inclusion deadline (a censorship check, not a speed claim). <!-- fact:EVM-12,CC-17 -->

**What you'd build.** First-come allocation keyed to canonical timestamps, or fee-tiered allocation where the priority rule is the same transparent one every participant faces. Fee priority still exists by design — what's removed is producer discretion. <!-- fact:CC-19 -->

## Verifiable timestamping and attestation

**The problem.** "This existed at time T" usually rests on a trusted party's clock.

**What ROKO provides.** Timestamps are nanosecond-resolution `u128` values bound to consensus: ordering is enforced on-finalize, and the watermark is monotonic across blocks. The node exposes 14 `temporal_*` RPC methods for retrieving per-transaction and per-block temporal metadata. <!-- fact:CC-18,EVM-08 -->

**What you'd build.** Document and data-existence proofs (anchor a hash, retrieve its canonical timestamp later), IP priority claims, and sensor or event attestations where the proof of *when* is queryable by anyone over standard RPC. <!-- fact:EVM-10 -->

## Audit trails for regulated workflows

**The problem.** Regulated workflows need event sequences that are reconstructible and tamper-evident after the fact.

**What ROKO provides.** A consensus-enforced temporal record: each transaction's canonical timestamp, signed receipt, and the per-block metadata to reconstruct sequence, all retrievable via `temporal_getBlockTransactionTimestamps` and related RPCs. <!-- fact:CC-18,CC-17,CC-20 -->

**What you'd build.** Trade-event recorders, custody handoff logs, and approval-chain registries with a verifiable timeline. To be clear: ROKO provides timestamps and ordering proofs — it does not provide regulatory compliance. Mapping records to any regime's requirements is the application's job.

## Time-locked and scheduled contract logic

**The problem.** Solidity's `block.timestamp` is seconds-level and producer-influenced — a coarse foundation for time-conditional logic. On ROKO it remains the standard seconds-level value by design. <!-- fact:EVM-25 -->

**What ROKO provides.** A consensus time oracle: `temporal_getConsensusTime` returns nanosecond consensus time with quality and convergence metrics, and on testnet contracts read the same state on-chain through the Temporal precompile at `0x...0600` (`getConsensusTime()`, `getTransactionTimestamp(bytes32)`, `getWatermark()` — standard keccak256 ABI selectors). The mainnet runtime does not yet include this precompile. <!-- fact:CC-21,EVM-17,EVM-15 -->

**What you'd build.** Vesting and unlock schedules, option expiries, and deadline-driven settlement that key off consensus time instead of block heights or producer-set timestamps.

## A note on what these claims mean

Nanosecond figures here are *resolution* — the granularity of the canonical timestamp format — not an accuracy guarantee for any individual clock. The 15-second receipt deadline is an inclusion-enforcement bound, not transaction latency. The network is pre-public-launch; verify behavior against a live node before depending on it. <!-- fact:CC-18,CC-17,CC-05 -->
