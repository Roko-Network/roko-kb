# Temporal Infrastructure

## The Timing Stack

ROKO adds proven time to blockchain. Three layers: hardware clocks at the bottom, beacon consensus in the middle, temporal transactions at the top.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│         Temporal Smart Contracts & DApps                 │
├──────────────────────────────────────────────────────────┤
│                Temporal Consensus Layer                  │
│    Time Beacons • Ordering • Attestation                │
├──────────────────────────────────────────────────────────┤
│                 Hardware Timing Layer                    │
│    OCP-TAP • IEEE 1588 PTP • Atomic Clocks • GPS        │
└──────────────────────────────────────────────────────────┘
```

Each layer:

1. **Hardware Timing Layer**: Physical time sources and synchronization
2. **Temporal Consensus Layer**: Beacon production and block timestamp proofs
3. **Application Layer**: Temporal transactions and smart contracts

---

## Hardware Timing Layer

### OCP-TAP Compliance

ROKO validators run **Open Compute Project Time Appliance** hardware:

#### Time Card Specifications
```yaml
Time Card Specifications:
  - Manufacturer: OCP-compliant vendors
  - GPS/GNSS: Multi-constellation (GPS, Galileo, BeiDou)
  - Oscillator: OCXO with <1ppb stability
  - Interfaces: PCIe Gen3 x1
  - Accuracy: <100ns to UTC
  - Holdover: 24 hours at <1μs drift
```

#### Hardware Requirements for Validators

| Component | Specification | Purpose |
|-----------|--------------|---------|
| **Time Card** | OCP TAP 2.0+ | Hardware timestamp generation |
| **NIC** | Intel X710/E810 | PTP hardware timestamping |
| **CPU** | AVX2 support | Cryptographic operations |
| **GPS Antenna** | Active, 30dB gain | Time source reception |
| **Oscillator** | OCXO or better | Holdover stability |

### IEEE 1588 PTP Implementation

ROKO uses **Precision Time Protocol v2.1** for network synchronization:

#### PTP Configuration
```ini
# ROKO PTP Profile
[global]
domainNumber              44    # ROKO domain
slaveOnly                 0     # Can be grandmaster
priority1                 128   # Standard priority
clockClass                6     # GPS-locked
clockAccuracy            0x21   # <100ns
network_transport        L2
delay_mechanism          E2E    # End-to-end
time_stamping            hardware
```

#### Synchronization Hierarchy

```
                    GPS/GNSS Satellites
                           ↓
                    Stratum 0 (Atomic)
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
  Grandmaster 1      Grandmaster 2      Grandmaster 3
  (Region: US)       (Region: EU)        (Region: Asia)
        ↓                  ↓                  ↓
   Validators          Validators          Validators
```

### Time Source Redundancy

Validators maintain multiple time sources:

1. **Primary**: GPS/GNSS with multi-constellation
2. **Secondary**: Network Time Security (NTS)
3. **Tertiary**: IEEE 1588 PTP from peers
4. **Backup**: Local OCXO holdover

---

## Temporal Consensus Layer

### Time Beacons

Validators broadcast signed timestamps at 150ms intervals. See [Time Beacons](./time-beacons.md) for details.

### Block Timestamp Proofs

Blocks include beacon proofs - K-of-N beacon selection proving the block's timestamp via median calculation.

### Temporal Ordering

Transactions with beacon proofs execute in signing-time order:

```python
class TemporalOrdering:
    def order_transactions(self, tx_pool):
        # Verify beacon proofs
        valid_txs = [tx for tx in tx_pool if self.verify_beacon_proof(tx)]

        # Sort by proven signing time
        valid_txs.sort(key=lambda x: x.median_timestamp)

        return valid_txs
```

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Beacon Interval** | 150ms | Configurable |
| **Drift Tolerance** | 2s launch, 500ms target | Tightens as network matures |
| **Block Time** | 2-3 seconds | GRANDPA finality |
| **Timestamp Precision** | Microseconds in beacons | NanoMoment format supports nanoseconds |

---

## Security

### Attack Prevention

| Attack | Prevention |
|--------|------------|
| **Time Manipulation** | Beacon proofs require multiple validator signatures |
| **Front-running** | Temporal ordering - can't back-date beacon proofs |
| **Replay** | Monotonic sequence numbers in beacons |

### Slashing

Validators can be slashed for:
- Beacons consistently outside drift tolerance
- Invalid beacon signatures
- Producing blocks without valid beacon proofs

---

## Integration

### For Validators

```bash
# Install time card drivers
sudo apt-get install ocp-timecard-driver

# Configure PTP
sudo ptp4l -i eth0 -f /etc/ptp/roko.conf

# Verify synchronization
roko time verify
```

### For Developers

```javascript
// Get proven timestamp
const timestamp = await roko.time.now();

// Verify temporal proof
const isValid = await roko.time.verify(tx.timestamp, tx.proof);
```

---

## See Also

- [Time Beacons](./time-beacons.md) - Beacon architecture details
- [Consensus Mechanism](./consensus.md) - BABE/GRANDPA integration
- [Temporal Transactions](./temporal-transactions.md) - Type 3 transactions
