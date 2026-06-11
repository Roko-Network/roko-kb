# Nanosecond Precision: Resolution vs. Accuracy

ROKO's temporal layer works in nanoseconds. Before you build on that, you should understand exactly what is guaranteed — and what isn't. This page draws the line explicitly, because the distinction is where trust comes from.

## Two different claims

- **Resolution** is how finely a timestamp is *represented*: how many distinguishable values the format can hold.
- **Accuracy** is how close a timestamp is to *true UTC time*.

A clock can have nanosecond resolution and millisecond accuracy. They are independent properties, and conflating them is how timing systems oversell themselves.

## What ROKO ships today: nanosecond resolution

Temporal timestamps on ROKO are `u128` nanosecond values — the **NanoMoment** type. The temporal-transactions pallet enforces per-block temporal ordering on these values at block finalization and maintains a monotonic transaction watermark. <!-- fact:CC-18 -->

That resolution is real and surfaces everywhere a builder touches time:

- `temporal_getConsensusTime` returns `consensusTimeNs` as a u128 string (nanoseconds since the UNIX epoch), alongside a time-quality score, convergence state, peer count, and the signed consensus offset. <!-- fact:EVM-09 -->
- The temporal precompile at `0x...0600` exposes `getConsensusTime()`, `getMyTimestamp()`, `getTransactionTimestamp(bytes32)`, `getWatermark()`, and `getBlockTimestamp(uint64)` — all returning `uint128` nanosecond values to Solidity. <!-- fact:CC-23,EVM-17 -->
- Every transaction's canonical timestamp is a nanosecond value assigned at pool receipt. <!-- fact:CC-19 -->

Nanosecond resolution buys you something concrete even before any accuracy claim: **unambiguous ordering**. Two transactions assigned distinct canonical timestamps have a total order the runtime enforces; there is no "same second, who knows" ambiguity. <!-- fact:CC-18 -->

## What ROKO does not claim: shipped sub-100ns accuracy

You may find older material describing "sub-100 nanosecond accuracy" as a network property. **That is not a shipped, proven guarantee, and we don't claim it.** What the network actually does about accuracy is more interesting, because it is measurable:

- **Accuracy is measured per validator, not assumed.** Each validator self-classifies its time source — Timebeat PTP daemon, chrony (NTP), or GNSS/PPS hardware with NIC hardware timestamping — and reports a measured root-distance-to-UTC in nanoseconds. GNSS/PPS hardware yields the Anchor tier; software-disciplined clocks yield Standard or Minimal (a system-clock-only mode assumes a 10 ms root distance). <!-- fact:CC-16 -->
- **Time quality is scored on-chain.** The timesync pallet stores per-validator and per-block time quality as a fixed-point score (0–10,000) and records health checkpoints every 100 blocks. You can inspect it rather than take our word. <!-- fact:CC-14 -->
- **Convergence is reported honestly.** The consensus-time RPC tells you whether the mesh is `Initializing`, `Converging`, `Converged`, or `Degraded` — accuracy state is part of the API, not a marketing constant. <!-- fact:EVM-09 -->

So the honest statement is: **timestamps have nanosecond resolution; accuracy is whatever the mesh measures it to be, per validator, and the network exposes that measurement.** As more Anchor-tier (GNSS-disciplined) validators join, measured accuracy improves — and you can watch it happen via `temporal_getValidatorTimeQuality` and `temporal_getMeshState`. <!-- fact:CC-20 -->

### Testnet caveat

On the current testnet, validators may run in `mock-anchor` mode, which claims a perfect time source for development purposes. Treat testnet time-quality figures as plumbing verification, not as accuracy benchmarks. <!-- fact:OPS-25 -->

What you'll actually see querying the live testnet today: a small mesh (~3 peers), possibly `mock-anchor`, with `consensusOffsetNs` at 0. That's the plumbing under test — not an accuracy claim. Anchor-tier physics arrives as GNSS-disciplined validators join the mesh. <!-- fact:OPS-25 -->

## One more honest boundary: the EVM clock

`block.timestamp` in your Solidity contracts remains the standard seconds-level value. Nanosecond time is exposed *additively* through the `temporal_*` RPC namespace and the `0x...0600` precompile — the Ethereum JSON-RPC schema is unchanged. If your contract needs nanosecond time, call the precompile; don't expect `block.timestamp` to change meaning. <!-- fact:EVM-25 -->

## Why the distinction builds trust

Any system can print 19 digits. The question that matters is what stands behind them. ROKO's answer: a peer-measured time mesh, per-validator quality scores on-chain, self-classified hardware tiers with measured root distance, and APIs that report convergence state — verifiable machinery instead of a brochure number. When we do publish accuracy figures, they will come from that machinery. <!-- fact:CC-13,CC-14 -->

**Next:** [Join the Testnet](./join-testnet.md) and read consensus time yourself.
