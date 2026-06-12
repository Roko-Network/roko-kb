# Hardware Timestamping

On Roko, hardware time is something a validator **brings and proves**, not something the chain mandates. There is no required time card, no certification gate, and no hardware allowlist. Instead, every validator self-classifies its time source — Timebeat PTP daemon, chrony, GNSS/PPS hardware, or NIC hardware timestamping — and announces a *measured root distance to UTC* in nanoseconds. Validators with GNSS/PPS-disciplined clocks earn **Anchor** tier; everyone else lands in Standard or Minimal. <!-- fact:CC-16 -->

This page covers what the node actually detects, how to wire real timing hardware into it, and what early hardware trials taught the team about what not to buy.

## How classification works

The node's time-source detection runs in one of three modes: `Auto` (the default), `MockAnchor` (testnet/development only), and `SystemOnly` (assumes a 10 ms root distance from the system clock). <!-- fact:CC-16 -->

In `Auto` mode the detector inspects the machine it is running on:

1. Reads `chronyc -c tracking` to find the reference source and compute root distance from chrony's root delay and dispersion
2. Scans `/dev/pps*` for kernel PPS devices
3. Checks `ethtool -T` for NIC hardware timestamping support <!-- fact:OPS-24 -->

You can preview exactly what the detector will see before starting the validator:

```bash
# What the detector parses
chronyc -c tracking

# PPS devices the detector scans
ls /dev/pps*

# NIC hardware timestamping (optional capability)
ethtool -T eth0 | grep -E "hardware-(transmit|receive)"
```

The result maps to a time-quality tier:

| Tier | Root distance | Typical source |
|------|--------------|----------------|
| **Anchor** | < 1 µs | GNSS/PPS-disciplined clock |
| **Standard** | < 10 µs | NTP via chrony, mesh-synced |
| **Minimal** | > 10 µs | System clock, poor NTP |

Anchor validators provide the UTC root of trust for the time mesh; a production network needs at least 2–3 of them for Byzantine fault tolerance. <!-- fact:OPS-23 -->

NIC hardware timestamping (Intel i210/i225, Mellanox ConnectX class cards) is detected as a bonus capability that improves probe timestamp quality — it is **not** required for Anchor status, which is decided by the chrony reference source and root distance. <!-- fact:OPS-24 -->

## Getting PPS into the kernel

A GNSS receiver with PPS (pulse-per-second) output is the practical path to Anchor tier. The pulse has to reach the Linux kernel; three wiring options work:

1. **Serial port DCD pin** — most receivers with UART/RS-232 expose PPS on DCD; gpsd handles it
2. **GPIO pin** — Raspberry Pi and embedded boards, via the `pps-gpio` kernel module
3. **Dedicated PPS card** — PCIe/USB devices that create `/dev/pps*` directly <!-- fact:OPS-24 -->

Documented receiver options range from a ~$30 Pi GPS HAT to a u-blox ZED-F9T (~$200–300, <10 ns PPS accuracy), with gpsd + chrony (`refclock SHM` + `refclock PPS`) disciplining the system clock. <!-- fact:OPS-24 -->

A real Raspberry Pi CM5 validator runs on the testnet today using a u-blox GNSS module with Timebeat and chrony — with one hard-earned caveat: the node reads `CLOCK_REALTIME` (NTP-disciplined) rather than the NIC's PHC, because a PHC with no continuous UTC anchor drifts unboundedly in whole seconds and must never feed consensus timestamps. <!-- fact:OPS-26 -->

## Engineering notes: hardware that didn't work

From the team's early hardware-timing trials (engineering notes, pre-dating the current self-classification architecture — kept because the physics hasn't changed):

- **USB GPS dongles** — 1–10 ms of jitter through the USB stack made them useless for sub-microsecond timing. Direct serial/GPIO PPS only.
- **Realtek NICs (RTL8125)** — no hardware timestamping support. Check `ethtool -T` *before* buying a NIC.
- **AMD EPYC 7002** — TSC not synchronized between chiplets caused 500 ns+ drift between cores.
- **Consumer motherboards** — aggressive power saving caused PCIe clock drift; server boards behaved.
- **Temperature-uncontrolled rooms** — precision oscillators drift with temperature swings; climate control matters.

## What this means on testnet today

You do not need any timing hardware to run a testnet validator: `--timesync-time-source mock-anchor` claims a perfect time source (root distance 0), bypassing detection entirely — development and testnet use only. <!-- fact:OPS-25 -->

Time quality is recorded on-chain per validator each block by the timesync pallet, with health checkpoints every 100 blocks and defined time-sync offences — but offence **enforcement is currently disabled** in both compiled runtimes, so poor time quality is detected and scored without slashing. <!-- fact:CC-14,CC-15 -->

Monitor your own classification via Prometheus (default port 9615): `timesync_time_source_type`, `timesync_local_root_distance_nanoseconds`, and `timesync_convergence_state`. <!-- fact:OPS-28 -->

## See also

- [IEEE 1588 / PTP](./ieee-1588.md) — disciplining the local clock with PTP
- [OCP-TAP](./ocp-tap-compliance.md) — the open time-hardware ecosystem
- [Validator Requirements](./validator-requirements.md) — full hardware and bonding picture
