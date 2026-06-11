# Temporal Infrastructure

Roko's clock is not an appliance you buy — it is a protocol the validators run. The **PTP Squared time mesh** is a native Rust peer-to-peer time-synchronization layer built into the node, measuring clock offsets between validators and converging on a single network time that consensus can hold validators to. <!-- fact:CC-13 -->

The stack has four layers: libp2p networking at the bottom, the PTP Squared time mesh above it, BABE+GRANDPA+PoAT consensus on top of that, and applications at the top. <!-- fact:DOC-01 -->

## The PTP Squared Mesh

The mesh runs over the libp2p notification protocol **`/roko/timesync/1`**, exchanging SCALE-encoded `Probe`, `ProbeResponse`, and `AnnounceV4` messages. Its moving parts: <!-- fact:CC-13 -->

- **Lucky-packet offset estimation** — validators continuously probe peers and estimate clock offsets from the lowest-latency exchanges.
- **Welch's t-test reputation scoring** — peers whose reported time is statistically inconsistent lose reputation; the mesh is built to distrust bad clocks, not just average them.
- **Convergence detection** — the mesh tracks whether the network has agreed on a consensus time (`Initializing → Converging → Converged`).
- **Path-cost source selection and seat management** — each node selects which peers to trust as time sources and manages mesh membership.

<!-- fact:CC-13,EVM-09 -->

The PTP Squared algorithms are credited to Lasse Limkilde Johnsen (September 2021 Technical Preview). <!-- fact:DOC-27 -->

The mesh's output is **mesh consensus time**: your local clock plus a consensus offset, agreed across validators. It reaches the runtime as a block inherent consumed by `pallet-timesync`, which stores per-validator time quality on-chain (fixed-point 0–10,000) and records health checkpoints every 100 blocks. <!-- fact:CC-14 -->

## Time-Source Self-Classification

Validators don't all need atomic-grade hardware — they need to be *honest about what they have*. Each validator detects and classifies its own time source, reporting a measured root-distance-to-UTC in nanoseconds: <!-- fact:CC-16 -->

| Source | Typical tier |
|---|---|
| GNSS receiver with PPS, hardware-disciplined | **Anchor** |
| Timebeat PTP daemon | Standard/Anchor depending on root distance |
| chrony (NTP) | **Standard** |
| Plain system clock | **Minimal** |

<!-- fact:CC-16 -->

Repo deployment guidance describes the tiers as roughly: Anchor < 1 µs root distance (GNSS/PPS-disciplined), Standard < 10 µs (NTP via chrony), Minimal above that — with a production network wanting at least 2–3 anchor validators. <!-- fact:OPS-23 -->

Detection modes are `Auto` (inspect `chronyc tracking`, scan `/dev/pps*`, check NIC hardware timestamping via `ethtool -T`), `MockAnchor` (testnet/development only — claims a perfect source, bypassing detection), and `SystemOnly` (assume a 10 ms root distance). <!-- fact:CC-16,OPS-24,OPS-25 -->

A real reference deployment exists: a Raspberry Pi CM5 validator runs on the testnet using a u-blox GNSS module with Timebeat and chrony, per the repo's runbooks. <!-- fact:OPS-26 -->

## Observing the Mesh

The mesh is fully inspectable over JSON-RPC (standard port 9944): <!-- fact:CC-20 -->

```bash
curl -s -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"temporal_getConsensusTime","params":[]}' \
  http://localhost:9944
```

`temporal_getConsensusTime` returns `consensusTimeNs` (u128 as string), `timeQuality` (0–10,000), `convergenceState`, `peerCount`, and `consensusOffsetNs`. `temporal_getMeshState` and `temporal_getValidatorTimeQuality` expose mesh internals and per-validator quality. <!-- fact:EVM-09,CC-20,OPS-29 -->

Prometheus metrics (default port 9615) include `timesync_time_source_type`, `timesync_local_root_distance_nanoseconds`, and `timesync_convergence_state`; a full Prometheus/Grafana monitoring stack ships in-repo. <!-- fact:OPS-28 -->

## Operator Controls

Timesync behavior is tunable from the CLI: `--timesync-time-source (auto|mock-anchor|system-only)`, `--timesync-no-enforce`, `--timesync-strict`, `--timesync-probe-interval-ms`, `--timesync-rate-limit`, and `--timesync-min-sources`. <!-- fact:OPS-07 -->

One sharp edge worth knowing: a **single-validator or local dev node must run `--timesync-no-enforce`** — with no peers to converge with, the mesh cannot reach consensus. <!-- fact:OPS-08 -->

## Enforcement Status

On-chain consequences for bad time are defined but currently dormant: `pallet-timesync` ships `TimeSyncOffence` with configured slash fractions, but enforcement is disabled (`EnforcementEnabled = false`) in both compiled runtimes during the testnet phase. Quality is measured and recorded; slashing waits. <!-- fact:CC-14,CC-15 -->

## See Also

- [Consensus Mechanism](./consensus.md) — how mesh quality feeds consensus
- [Validator Requirements](./validator-requirements.md) — hardware per tier
- [NanoMoment](./nanomoment.md) — the timestamp type the mesh produces
