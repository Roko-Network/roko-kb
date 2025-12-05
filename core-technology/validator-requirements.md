# Validator Requirements

## Technical and Economic Requirements

Running a ROKO validator isn't just spinning up a node. Time cards. ECC memory. GPS antennas. Staked tokens. Hardware enforces temporal precision. Economics enforce honest behavior.

---

## Hardware Requirements

### Minimum Specifications

Bare minimum to participate. 8 cores process transactions. ECC RAM catches bit flips before they corrupt state. NVMe handles the I/O. 100 Mbps keeps you connected. The time card is non-negotiable - no OCP TAP, no validation.

```html
<table class="spec-table">
  <thead>
    <tr><th>Component</th><th>Requirement</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>CPU</strong></td><td>8 cores, 3.0 GHz</td><td>Transaction processing</td></tr>
    <tr><td><strong>RAM</strong></td><td>16 GB ECC</td><td>State management</td></tr>
    <tr><td><strong>Storage</strong></td><td>500 GB NVMe SSD</td><td>Blockchain data</td></tr>
    <tr><td><strong>Network</strong></td><td>100 Mbps symmetric</td><td>P2P communication</td></tr>
    <tr><td><strong>Time Card</strong></td><td>OCP TAP 2.0</td><td>Hardware timestamping</td></tr>
  </tbody>
</table>
```

### Recommended Specifications

Production-grade setup. 16 cores handle load spikes. 32 GB RAM keeps hot state in memory. RAID storage survives drive failures. Gigabit networking reduces propagation delay. GPS antenna gives you stratum-0 time source - not dependent on network peers for temporal accuracy.

```html
<table class="spec-table">
  <thead>
    <tr><th>Component</th><th>Requirement</th><th>Benefit</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>CPU</strong></td><td>16+ cores, 3.5 GHz</td><td>Higher throughput</td></tr>
    <tr><td><strong>RAM</strong></td><td>32 GB ECC</td><td>Better performance</td></tr>
    <tr><td><strong>Storage</strong></td><td>2 TB NVMe RAID</td><td>Future growth</td></tr>
    <tr><td><strong>Network</strong></td><td>1 Gbps dedicated</td><td>Lower latency</td></tr>
    <tr><td><strong>Time Card</strong></td><td>OCP TAP 2.0 + GPS</td><td>Stratum-0 accuracy</td></tr>
  </tbody>
</table>
```

---

## Economic Requirements

### Staking

32,000 ROKO minimum. Lock it for 180 days. This isn't a deposit - it's collateral. Misbehave and lose up to half. The stake makes attacks expensive. The lock period prevents hit-and-run.

```
Minimum Stake:    32,000 ROKO
Lock Period:      180 days
Slashing Risk:    Up to 50% for malicious behavior
```

### Expected Returns

Block rewards plus performance bonuses. Hit your uptime targets, get the base 8-10%. Maintain tight time sync, earn the accuracy bonus. Top performers clear 15% APY. Underperformers get slashed.

```
Annual Return = Base Rewards + Performance Bonus + Time Accuracy Bonus
              = 8-10%        + 0-3%              + 0-2%
              = 8-15% APY
```

---

## Operational Requirements

Four numbers matter:

- **Uptime**: 99.5% minimum. Miss blocks, miss rewards.
- **Time Accuracy**: ±100 nanoseconds. Drift beyond tolerance, get slashed.
- **Software Updates**: 24-hour window. Security patches wait for no one.
- **Monitoring**: 24/7 recommended. Problems at 3 AM are still problems.

---

## See Also

- [OCP-TAP Compliance](./ocp-tap-compliance.md)
- [Hardware Timestamping](./hardware-timestamping.md)
- [Consensus Mechanism](./consensus.md)
