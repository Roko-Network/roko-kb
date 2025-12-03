# Temporal Transactions

## Type 3 Transactions with Proven Signing Time

Temporal Transactions (Type 3) extend standard blockchain transactions with cryptographic proof of when they were signed. This enables **temporal ordering** - executing transactions in the order they were created, not the order they arrived.

---

## Why Temporal Transactions?

Traditional transactions compete for gas and block space. The block producer decides ordering, enabling:
- Front-running
- Sandwich attacks
- MEV extraction

Temporal transactions compete for **time**. The signing timestamp determines execution order.

---

## Transaction Structure

```
┌─────────────────────────── Temporal Transaction ───────────────────────────┐
│ Address:  5G9v…XJwa                                                        │
│ Calldata: 0x…                                                              │
│ Nonce:    42                                                               │
│                                                                            │
│ Temporal Metadata:                                                         │
│   • beaconProofHash:    0xb377…f9aa                                        │
│   • medianTimestampUs:  1730123470123456  (≈ 2024-09-28 10:17:50.123Z)     │
│                                                                            │
│ Embedded Time Beacon Proof (K = 3):                                        │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │ validator babe1qf…2k7h | timestamp 1730123469123456 | sig σ₁       │   │
│   │ validator babe1zk…xp4m | timestamp 1730123470456123 | sig σ₂       │   │
│   │ validator babe1mv…hnt9 | timestamp 1730123470812345 | sig σ₃       │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│ User Signature: 0x…                                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

The wallet collects fresh beacons when creating the transaction, proving the signing time.

---

## Validation Flow

When a temporal transaction enters the mempool:

1. **Check user signature + nonce** (standard)
2. **Verify each beacon signature** with epoch randomness
3. **Ensure beacon timestamps** fall within allowed spread
4. **Confirm median timestamp** meets ordering rules
5. **Check transaction deadline** (optional expiry)

---

## Temporal Ordering

> "Imagine a system where all transactions are executed in the order in which they are signed by their users."

With temporal transactions:
- Block height doesn't determine order
- Execution order is predetermined at signing time
- As transactions reach the mempool, history is already written
- The chain catches up to confirm the final state

### Implications

```
Transaction A signed at: 10:17:36.789
Transaction B signed at: 10:17:36.791
Transaction C signed at: 10:17:36.785

Execution order: C → A → B (by signing time)
NOT by: arrival time, gas price, or validator preference
```

---

## MEV Prevention

Temporal transactions make front-running impossible:

**Traditional attack:**
```
User submits: Buy 100 tokens at 10:17:36.500
MEV bot sees tx → Creates: Buy 100 tokens at 10:17:36.499 (fake earlier time)
Result: Bot front-runs user
```

**With temporal transactions:**
```
User submits: Buy 100 tokens with beacon proof median 10:17:36.500
MEV bot cannot create earlier beacon proof (would need to forge validator signatures)
Result: Temporal ordering preserved
```

The bot cannot back-date because:
1. Beacons are signed by validators
2. Beacon signatures cannot be forged
3. Stale beacons are rejected

---

## Wallet Integration

Wallets producing temporal transactions must:

1. **Subscribe to beacon gossip** - Receive validator beacons
2. **Maintain beacon cache** - Store recent beacons
3. **Select K beacons** - Choose beacons for proof
4. **Calculate median** - Determine transaction timestamp
5. **Embed proof** - Include beacons in transaction

### Example Flow

```
User clicks "Swap" in wallet
        │
        ▼
Wallet collects K fresh beacons from cache
        │
        ▼
Wallet calculates median timestamp
        │
        ▼
Wallet assembles transaction with beacon proof
        │
        ▼
User signs transaction
        │
        ▼
Transaction broadcast to network
        │
        ▼
Validators verify beacon proof and queue by timestamp
```

---

## Storage Optimization

Full beacon storage in every transaction would be expensive. Optimizations under development:

- **Beacon proof hashes** - Reference beacons by hash
- **Aggregated proofs** - Combine multiple beacon signatures
- **Block-relative proofs** - Reference beacons already in recent blocks

---

## Current Limitations

### Back-dating Risk

Users could potentially sign transactions with stale (but valid) beacons to claim an earlier timestamp. Mitigations being researched:

- Beacon freshness requirements
- Witness-based verification
- Reputation penalties for stale beacon usage

### Gossip Reliability

If a transaction's timestamp places it before other transactions the block producer hasn't received yet, skipping is currently unavoidable. Unlike traditional blockchains where order is flexible, temporal ordering requires all earlier transactions be present.

---

## Integration Levels

### Light Integration
- Standard transactions (Type 1/2)
- No temporal ordering
- Works with any wallet

### Full Integration
- Temporal transactions (Type 3)
- Guaranteed temporal ordering
- Requires beacon-aware wallet

### Hybrid
- Both transaction types supported
- Type 3 for MEV-sensitive operations
- Type 1/2 for simple transfers

---

## EVM Compatibility

The forked **Frontier pallet** brings temporal ordering to the EVM environment:

- Solidity contracts can access temporal timestamps
- EVM transactions can be wrapped as Type 3
- Existing DeFi contracts gain MEV protection

---

## See Also

- [Time Beacons](./time-beacons.md) - Beacon architecture
- [MEV Prevention](./mev-prevention.md) - How temporal ordering prevents MEV
- [Consensus Mechanism](./consensus.md) - BABE/GRANDPA integration
