# Time Beacons

## Decentralized Time Attestation System

Time Beacons are the foundation of ROKO's temporal consensus. Rather than trusting a single block producer's timestamp, ROKO requires validators to continuously broadcast signed timestamps that collectively prove when events occurred.

---

## The Problem with `block.timestamp`

Traditional blockchains have loose timestamp constraints:

> When a node creates a block:
> - The node checks its local system clock
> - It sets the block's timestamp (possibly adjusted)
> - Other nodes verify basic constraints

**Typical constraints:**
- Must be greater than parent block's timestamp
- Cannot be too far in the future (Bitcoin: 2 hours, Ethereum PoS: 15 seconds)

This looseness enables timestamp manipulation and front-running.

---

## How Time Beacons Work

### Beacon Structure

Each validator produces signed beacons at regular intervals:

```json
{
  "validatorId": "babe1qf...2k7h",
  "timestampUs": 1730123456789000,
  "sequence": 42,
  "signature": "0x8afc1c2d4e...dbe1",
  "epochRandomness": "0xb6f0c67a91...a0ff"
}
```

| Field | Purpose |
|-------|---------|
| `validatorId` | Identifies the beacon producer |
| `timestampUs` | Microsecond-precision timestamp |
| `sequence` | Monotonic counter preventing replay |
| `signature` | Validator's cryptographic signature |
| `epochRandomness` | Epoch-derived value for verification |

### Beacon Frequency

- **Launch target**: 150ms intervals
- Configurable per-network
- Higher frequency = tighter time consensus

---

## Beacon Flow

```
                       ┌────────────────────────────────┐
                       │        BABE Epoch N            │
                       └────────────────────────────────┘

        ┌──────────────┐                                     ┌──────────────┐
        │  Validator A │                                     │  Validator B │
        └─────┬────────┘                                     └─────┬────────┘
              │                                                    │
    produces own beacon                                    produces own beacon
              │                                                    │
              ▼                                                    ▼
      ┌──────────────────┐                                ┌──────────────────┐
      │ Beacon aₙ        │                                │ Beacon bₙ        │
      │  timestamp: Ta   │                                │  timestamp: Tb   │
      │  seq:      n     │                                │  seq:      n     │
      │  signature: σ_a  │                                │  signature: σ_b  │
      └────────┬─────────┘                                └────────┬─────────┘
               │                                                   │
               │ broadcasts                                        │ broadcasts
    ───────────┼───────────────────────────────────────────────────┼───────────
               │                                                   │
        ┌──────┴────────────────────┐                   ┌──────────┴──────────┐
        │ Local Beacon Cache (A)    │                   │ Local Beacon Cache (B)│
        │  • Beacon aₙ              │                   │  • Beacon bₙ          │
        │  • Beacon bₙ              │◄────receives──────┤  • Beacon aₙ          │
        │  • Beacon cₙ              │                   │  • Beacon cₙ          │
        └───────────────────────────┘                   └───────────────────────┘
```

Each validator:
1. Produces beacons from their Time Card
2. Signs and broadcasts to the network
3. Caches beacons from other validators
4. Uses cached beacons when producing blocks

---

## Beacon Proofs in Blocks

When producing a block, the validator includes a **Beacon Proof**:

```
┌─────────────────────────────────────────────────────────────┐
│ Block #12,345                                               │
│   Parent Hash:    0x4fd8…8c2a                               │
│   Author:         babe1qf…2k7h                              │
│                                                             │
│   ┌────────────── Time Beacon Proof ────────────────┐       │
│   │ Claimed Block Time: 2024-09-28 10:17:36.789 UTC │       │
│   │ Spread (max-min): 42 ms                         │       │
│   │ Median (canonical): 2024-09-28 10:17:36.791 UTC │       │
│   │                                                 │       │
│   │  • Beacon 1 (validator: babe1qf…2k7h)          │       │
│   │  • Beacon 2 (validator: babe1zk…xp4m)          │       │
│   │  • Beacon 3 (validator: babe1mv…hnt9)          │       │
│   └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

The block timestamp must match the **median** of the included beacon timestamps.

### Proof Validation

1. Verify each beacon signature
2. Confirm beacons are within drift tolerance
3. Calculate median timestamp
4. Verify block timestamp matches median
5. Check beacon freshness (not stale)

---

## Drift Tolerance

Blockchain relies on gossiping - messages take time to propagate. ROKO handles this with configurable drift tolerance:

| Phase | Drift Tolerance | Notes |
|-------|-----------------|-------|
| **Launch** | 2 seconds | Similar to existing chains |
| **Mature network** | 500ms target | With sufficient validator density |
| **Aspirational** | Sub-100ms | With optimized networking |

The tolerance window can be adjusted via governance as network conditions improve.

---

## Slashing Bad Actors

Validators producing out-of-sync beacons can be detected and penalized:

```
Fresh beacons collected
        │
        ▼
Detect drift beyond tolerance
        │
        ▼
Include slashing transaction with drift proof
        │
        ▼
Validator penalized
```

Slashing is configurable and exploratory at launch.

---

## Storage Optimization

Beacons live in runtime memory - they're temporary:
- Only stored when included in a block proof
- Or referenced in a slashing transaction
- Reduces on-chain storage burden

---

## Integration with Consensus

Time Beacons work **alongside** BABE/GRANDPA, not replacing them:

- **BABE**: Block production and slot assignment (unchanged)
- **GRANDPA**: Finality (unchanged)
- **Beacons**: Add temporal proof requirements to blocks

This modular approach allows other Substrate chains to adopt beacon technology.

---

## Current Research Areas

The team is actively working on:

1. **Beacon back-dating prevention**: Ensuring users can't sign transactions with stale beacons
2. **Gossip reliability**: Handling cases where honest block producers miss transactions due to propagation delays
3. **Proof optimization**: Reducing beacon proof size in blocks and transactions

---

## See Also

- [Temporal Transactions](./temporal-transactions.md) - How beacons enable timestamped transactions
- [Consensus Mechanism](./consensus.md) - BABE/GRANDPA integration
- [MEV Prevention](./mev-prevention.md) - How temporal ordering prevents MEV
