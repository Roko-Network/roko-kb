# Temporal Infrastructure

## The Timing Stack

ROKO adds proven time to blockchain. Three layers: hardware clocks at the bottom, beacon consensus in the middle, temporal transactions at the top.

---

## Architecture Overview

```html
<div class="layer-stack">
  <div class="layer">
    <div class="layer-title">Application Layer</div>
    <div class="layer-detail">Temporal Smart Contracts & DApps</div>
  </div>
  <div class="layer">
    <div class="layer-title">Temporal Consensus Layer</div>
    <div class="layer-detail">Time Beacons • Ordering • Attestation</div>
  </div>
  <div class="layer">
    <div class="layer-title">Hardware Timing Layer</div>
    <div class="layer-detail">OCP-TAP • IEEE 1588 PTP • Atomic Clocks • GPS</div>
  </div>
</div>
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

```html
<table class="spec-table">
  <thead>
    <tr><th>Component</th><th>Specification</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Time Card</strong></td><td>OCP TAP 2.0+</td><td>Hardware timestamp generation</td></tr>
    <tr><td><strong>NIC</strong></td><td>Intel X710/E810</td><td>PTP hardware timestamping</td></tr>
    <tr><td><strong>CPU</strong></td><td>AVX2 support</td><td>Cryptographic operations</td></tr>
    <tr><td><strong>GPS Antenna</strong></td><td>Active, 30dB gain</td><td>Time source reception</td></tr>
    <tr><td><strong>Oscillator</strong></td><td>OCXO or better</td><td>Holdover stability</td></tr>
  </tbody>
</table>
```

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

```html
<table class="spec-table">
  <thead>
    <tr><th>Metric</th><th>Value</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Beacon Interval</strong></td><td>150ms</td><td>Configurable</td></tr>
    <tr><td><strong>Drift Tolerance</strong></td><td>2s launch, 500ms target</td><td>Tightens as network matures</td></tr>
    <tr><td><strong>Block Time</strong></td><td>2-3 seconds</td><td>GRANDPA finality</td></tr>
    <tr><td><strong>Timestamp Precision</strong></td><td>Microseconds in beacons</td><td>NanoMoment format supports nanoseconds</td></tr>
  </tbody>
</table>
```

---

## Security

### Attack Prevention

```html
<table class="spec-table">
  <thead>
    <tr><th>Attack</th><th>Prevention</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Time Manipulation</strong></td><td>Beacon proofs require multiple validator signatures</td></tr>
    <tr><td><strong>Front-running</strong></td><td>Temporal ordering - can't back-date beacon proofs</td></tr>
    <tr><td><strong>Replay</strong></td><td>Monotonic sequence numbers in beacons</td></tr>
  </tbody>
</table>
```

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
