# OCP-TAP and Open Time Hardware

The Open Compute Project's Time Appliances Project (OCP-TAP) is the open-hardware ecosystem Roko's timing story comes from — open-source time cards, an upstream Linux kernel driver, and a community that solved datacenter-grade time distribution in the open. Roko **interoperates with** this ecosystem: OCP-TAP-class hardware is one of the strongest paths to Anchor-tier validator status. Roko does not claim OCP-TAP certification or require OCP-TAP hardware, and validators run today without it. <!-- fact:CC-16 -->

## What OCP-TAP is

OCP-TAP develops the **Time Card**: an open-source PCIe card combining a GNSS receiver, a high-stability local oscillator, and FPGA time processing — turning a commodity server into a time appliance. Its driver (`ptp_ocp`) is upstream in the Linux kernel (5.12+). The project also defines a datacenter PTP profile and oscillator classification work. This is ecosystem heritage worth citing precisely: Roko builds *on* this lineage; it did not author it.

## How it connects to Roko

Roko's Proof of Accurate Time doesn't check what brand of card you installed. Validators self-classify their time source — Timebeat PTP daemon, chrony, GNSS/PPS, NIC hardware timestamping — and announce a measured root distance to UTC; GNSS/PPS-disciplined hardware yields **Anchor** tier. <!-- fact:CC-16 -->

A Time Card or Timebeat appliance is therefore the comfortable, integrated way to reach Anchor tier (< 1 µs root distance), but so is a $50 u-blox receiver wired into gpsd + chrony. The detection is the same: the node reads `chronyc -c tracking`, scans `/dev/pps*`, and checks `ethtool -T`. <!-- fact:OPS-23,OPS-24 -->

The network's live Raspberry Pi CM5 validator runs exactly this stack today — u-blox GNSS module, Timebeat v2.2.8, chrony — on the testnet. <!-- fact:OPS-26 -->

## Field notes: installing time cards

From the team's engineering notes installing OCP-TAP-class cards across server fleets (pre-dating the current architecture; the hardware realities still hold):

**Installation basics.** Cards are PCIe Gen3 x1 and work in any slot; verify kernel support with `modinfo ptp_ocp` (kernel 5.12+ needed). After install you should see the card register as a PTP device and PPS source:

```bash
modprobe ptp_ocp
ls /dev/ptp* /dev/pps*
dmesg | grep ptp_ocp
```

**Antenna placement is the real work.** GNSS needs clear sky — roof mounts with wide sky view work; antennas inside racks, under metal roofs, or next to HVAC units (multipath interference) don't. Urban canyons can drop you below the 8+ satellites needed for good timing.

**Warmup matters.** An OCXO needs ~15 minutes to thermally stabilize; don't trust timestamps until frequency offset settles.

**Holdover degrades fast.** When GNSS is lost, a typical OCXO card holds ~1 µs for the first hour and degrades to milliseconds past 24 hours. Plan alerting around losing satellite lock, not around the card failing.

**What goes wrong:** undetected cards are usually a bad PCIe slot; no GPS lock is usually a loose SMA connector; random resets are usually under-powered slots; temperature warnings need airflow.

These notes are operational experience, not protocol requirements — on today's network, a card that loses GNSS lock means your validator's announced root distance grows and your tier degrades, which the mesh observes and scores. Time-quality offences are defined on-chain but enforcement is currently disabled, so degraded time quality is scored, not slashed. <!-- fact:CC-14,CC-15 -->

## Honest status

- **No compliance certification.** Roko has not been certified against OCP-TAP specifications, and the protocol defines no such gate. OCP-TAP hardware is supported heritage, not a checkbox.
- **No hardware requirement.** Testnet validators can run with `--timesync-time-source mock-anchor` (no timing hardware at all, development/testnet only); NTP-only validators classify as Standard tier. <!-- fact:OPS-25,OPS-23 -->
- **Anchor count is a network-health goal.** A production network wants at least 2–3 geographically distributed anchor validators for Byzantine fault tolerance in the time mesh. <!-- fact:OPS-23 -->

## See also

- [Hardware Timestamping](./hardware-timestamping.md) — tiers, detection, and PPS wiring
- [IEEE 1588 / PTP](./ieee-1588.md) — PTP configuration under a validator
- [Validator Requirements](./validator-requirements.md) — what you actually need to run
