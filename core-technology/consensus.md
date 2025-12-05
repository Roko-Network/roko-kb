# Consensus Mechanism

## BABE/GRANDPA with Temporal Proofs

ROKO Network extends Substrate's proven **BABE/GRANDPA** consensus with temporal proof requirements. Rather than replacing consensus, ROKO adds time beacon verification to block validity rules.

---

## Overview

ROKO's approach:
- **BABE**: Handles block production and slot assignment (standard Substrate)
- **GRANDPA**: Provides finality (standard Substrate)
- **Time Beacons**: Add temporal proof requirements to blocks

This modular design means:
- Battle-tested consensus mechanisms remain unchanged
- Temporal features layer on top via Substrate pallets
- Other chains can adopt beacon technology independently

---

## How It Works

### Block Production with Temporal Proofs

When a validator is assigned a slot by BABE:

1. **Collect transactions** from mempool
2. **Gather fresh beacons** from local cache
3. **Select K beacons** for the proof (K-of-N selection)
4. **Calculate median timestamp** from selected beacons
5. **Assemble block** with beacon proof in header
6. **Sign and broadcast** block to network

### Block Validation

Other validators verify:
1. Standard BABE validity checks
2. Each beacon signature in the proof
3. Beacons are within drift tolerance window
4. Block timestamp matches beacon median
5. Temporal ordering of transactions (if Type 3)

---

## Temporal Proof Structure

```box:Block Header
Parent Hash
Block Number
State Root
Extrinsics Root

─── Beacon Proof ───────────────────────────────────────────────────────────

Claimed Time:   T
Spread:         max - min
Median:         canonical time

• Beacon 1: {validator, ts, sig}
• Beacon 2: {validator, ts, sig}
• Beacon 3: {validator, ts, sig}

─────────────────────────────────────────────────────────────────────────────

BABE Seal (slot, authority, signature)
```

---

## Validator Requirements

### Hardware

```html
<table class="spec-table">
  <thead>
    <tr><th>Component</th><th>Minimum</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Time Card</strong></td><td>OCP TAP 2.0</td><td>Hardware timestamp generation</td></tr>
    <tr><td><strong>GPS Antenna</strong></td><td>Active, 30dB gain</td><td>Time source</td></tr>
    <tr><td><strong>NIC</strong></td><td>PTP-capable (Intel X710/E810)</td><td>Hardware timestamping</td></tr>
    <tr><td><strong>CPU</strong></td><td>8+ cores</td><td>Block production</td></tr>
    <tr><td><strong>RAM</strong></td><td>16 GB+</td><td>Beacon cache</td></tr>
  </tbody>
</table>
```

### Time Synchronization

Validators must maintain synchronization within the network's drift tolerance:

```html
<table class="spec-table">
  <thead>
    <tr><th>Network Phase</th><th>Drift Tolerance</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Launch</strong></td><td>2 seconds</td></tr>
    <tr><td><strong>Mature</strong></td><td>500ms target</td></tr>
  </tbody>
</table>
```

```bash
# Check time sync status
roko validator time-status

# Example output:
# Time Sync Status
# ================
# Local Time:     1730123456789000 μs
# Network Median: 1730123456790000 μs
# Drift:          +1ms ✓
# Beacon Rate:    150ms
# Cache Size:     47 beacons
```

---

## Finality

GRANDPA provides finality as normal. Once a block is finalized:
- Its beacon proof is immutable
- Temporal ordering of transactions is locked
- No reordering possible

Finality time: **2-3 seconds** (inherited from GRANDPA configuration)

---

## Fork Resolution

If forks occur, resolution uses:

1. **GRANDPA votes** (primary - standard Substrate)
2. **Temporal precedence** (tiebreaker - earlier median wins)
3. **Stake weight** (final tiebreaker)

```
Fork A: median timestamp 10:17:36.789
Fork B: median timestamp 10:17:36.792

→ Fork A has temporal precedence (if GRANDPA votes equal)
```

---

## Staking

Standard Substrate staking with temporal performance bonuses:

### Rewards

Validators earn from:
1. **Block production** - Standard BABE rewards
2. **Attestations** - GRANDPA participation
3. **Temporal accuracy** - Bonus for maintaining sync

### Slashing

Validators can be slashed for:
- **Double signing** (standard)
- **Excessive drift** - Beacons consistently outside tolerance
- **Beacon manipulation** - Invalid signatures or timestamps

---

## Pallet Architecture

ROKO's temporal features are implemented as modular Substrate pallets:

```html
<table class="spec-table">
  <thead>
    <tr><th>Pallet</th><th>Depends On</th><th>Function</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Beacons</strong></td><td>-</td><td>Validator beacon production</td></tr>
    <tr><td><strong>Time Blocks</strong></td><td>Beacons</td><td>Beacon proofs in blocks</td></tr>
    <tr><td><strong>Temporal Transactions</strong></td><td>Beacons, Time Blocks</td><td>Type 3 transactions</td></tr>
    <tr><td><strong>Frontier</strong> (forked)</td><td>All above</td><td>EVM with temporal ordering</td></tr>
  </tbody>
</table>
```

This allows partial adoption:
- Beacons only (cross-chain time source)
- Beacons + Time Blocks (proven block timestamps)
- Full stack (temporal ordering)

---

## Current Limitations

Active research areas:

1. **Gossip propagation** - Honest block producers may miss transactions due to network delays
2. **Beacon back-dating** - Preventing stale beacon reuse in transaction proofs
3. **Storage optimization** - Reducing beacon proof overhead

---

## See Also

- [Time Beacons](./time-beacons.md) - Detailed beacon architecture
- [Temporal Transactions](./temporal-transactions.md) - Type 3 transactions
- [MEV Prevention](./mev-prevention.md) - How temporal ordering prevents MEV
