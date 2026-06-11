# From Time Beacons to the Time Mesh

> **Heritage note.** Earlier Roko designs described dedicated hardware "time beacon" nodes broadcasting signed timestamps, with beacon proofs embedded in blocks. That design — along with the cohort-commitment pipeline — has been retired. In the current architecture, **every validator is a time source**, the validator time mesh plays the role the beacon network once did, and inclusion guarantees come from per-receipt enforcement. This page documents what runs today. <!-- fact:CC-29 -->

## Validators are the time sources

Each validator self-classifies its time source at startup: a Timebeat PTP daemon, chrony (NTP), GNSS with PPS output, or NIC hardware timestamping — with a measured **root distance to UTC** in nanoseconds. GNSS/PPS hardware classifies as Anchor tier; other sources land in Standard or Minimal. Three modes exist: `Auto` (detect what the host has), `MockAnchor` (testnet/dev), and `SystemOnly` (plain system clock, 10 ms assumed root distance). <!-- fact:CC-16 -->

The deployment docs define the tiers as:

| Tier | Root distance | Typical source |
|---|---|---|
| Anchor | < 1 µs | GNSS receiver with PPS, disciplined clock |
| Standard | < 10 µs | NTP via chrony |
| Minimal | > 10 µs | System clock |

A production network needs at least 2–3 Anchor validators for the time consensus to be Byzantine-fault tolerant. <!-- fact:OPS-23 -->

## The mesh is the beacon network

Instead of dedicated beacon broadcasters, validators run the **PTP Squared time mesh** natively over libp2p protocol `/roko/timesync/1`: peers exchange SCALE-encoded probes, estimate offsets via lucky-packet selection, score each other's reputation with Welch's t-test, detect convergence, and select sources by path cost. The output is a single **mesh consensus time** the network agrees on. <!-- fact:CC-13 --> The PTP Squared algorithms are credited to Lasse Limkilde Johnsen (September 2021 Technical Preview). <!-- fact:DOC-27 -->

Mesh state reaches the chain through a block inherent consumed by `pallet-timesync`, which stores per-block and per-validator time quality on-chain (fixed-point 0–10,000), records health checkpoints every 100 blocks, and defines time-sync offences with slash fractions (persistent drift 1%, low reputation 1%, contradictory offsets 5%). <!-- fact:CC-14 -->

**Dev-stage caveat:** offence *enforcement* is currently disabled in both compiled runtimes — time-quality violations are detected and recorded, but nothing slashes yet. <!-- fact:CC-15 -->

## Running a time source

To run an Anchor-tier validator, you need a GNSS receiver with PPS output (documented options range from a ~$50 u-blox NEO-M8T to a ZED-F9T or a GPSDO), wired to the kernel via serial DCD, GPIO, or a PPS card, with gpsd + chrony configured as `refclock SHM` + PPS. The node's auto-detector reads `chronyc -c tracking`, scans `/dev/pps*`, and checks `ethtool -T` for hardware timestamping — no manual classification needed. <!-- fact:OPS-24 -->

Testnet validators without GNSS hardware can run `--timesync-time-source mock-anchor`, which claims a perfect time source — development and testnet only. <!-- fact:OPS-25 --> A single-node or local setup must also run `--timesync-no-enforce`, since there are no peers to converge with. <!-- fact:OPS-08 -->

This is not theoretical: a Raspberry Pi CM5 validator runs on the testnet today using a u-blox GNSS module, Timebeat, and chrony. <!-- fact:OPS-26 -->

Relevant CLI flags: `--timesync-time-source`, `--timesync-no-enforce`, `--timesync-strict`, `--timesync-probe-interval-ms`, `--timesync-rate-limit`, `--timesync-min-sources`. <!-- fact:OPS-07 -->

## Reading the network's clock

The mesh consensus time is queryable by anyone:

```bash
curl -s -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"temporal_getConsensusTime","params":[]}' \
  http://localhost:9944
```

The response carries `consensusTimeNs` (nanoseconds since epoch, as a string), `timeQuality` (0–10,000), `convergenceState` (`Initializing` / `Converging` / `Converged`), `peerCount`, and the signed `consensusOffsetNs`. <!-- fact:CC-21,EVM-09 -->

For operations, `temporal_getMeshState` reports mesh convergence and `temporal_getValidatorTimeQuality` exposes per-validator quality. <!-- fact:CC-20,OPS-29 --> Prometheus metrics on port 9615 include `timesync_time_source_type`, `timesync_local_root_distance_nanoseconds`, and `timesync_convergence_state`, and an in-repo Prometheus/Grafana/AlertManager stack ships ready to run. <!-- fact:OPS-28 -->

## See Also

- [Network Architecture](./network-architecture.md) — where the mesh sits in the stack
- [Temporal Transactions](./temporal-transactions.md) — how mesh time becomes canonical timestamps
- [Validator Requirements](./validator-requirements.md)
