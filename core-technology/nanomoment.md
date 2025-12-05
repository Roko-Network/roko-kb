# NanoMoment Architecture

## The Timestamp Data Type

128 bits. Nanoseconds since Unix epoch. Enough precision to order two transactions signed a billionth of a second apart. Enough range to timestamp events until the heat death of the universe. This is ROKO's atomic unit of time.

## What is a NanoMoment?

A **128-bit unsigned integer**. Nanoseconds since January 1, 1970, 00:00:00 UTC. Not milliseconds like JavaScript. Not microseconds like databases. Nanoseconds. Because when you're ordering financial transactions, a millisecond is an eternity.

```rust
/// NanoMoment: u128 representing nanoseconds since Unix epoch
pub struct NanoMoment(pub u128);

impl NanoMoment {
    /// Current time with hardware attestation
    pub fn now() -> Self {
        let hw_time = TimeCard::get_attested_time();
        NanoMoment(hw_time)
    }
    
    /// Maximum representable time (year 292,277,026,596)
    pub const MAX: u128 = u128::MAX;
}
```

## Why 128 Bits?

64 bits at nanosecond precision? You get 584 years. Network launches in 2025, overflows in 2609. Blockchain that can't survive a millennium isn't infrastructure - it's a prototype.

128 bits gives you 10 quintillion years. Sun burns out in 5 billion. Universe goes cold in trillions. NanoMoment keeps counting.

### The Math

```
1 second = 1,000,000,000 nanoseconds (10^9)
1 year ≈ 31,536,000 seconds
1 year ≈ 31,536,000,000,000,000 nanoseconds (3.1536 × 10^16)

u64 max = 18,446,744,073,709,551,615
Years in u64 = 584 years (not enough!)

u128 max = 340,282,366,920,938,463,463,374,607,431,768,211,455
Years in u128 = 10,783,118,943,836,478,994 years (plenty!)
```

## Core Implementation

### Data Structure

Solidity wraps it in a custom type. Type safety without runtime overhead.

```solidity
// Solidity implementation
library NanoMoment {
    type Moment is uint128;
    
    function now() internal view returns (Moment) {
        return Moment.wrap(TimeOracle.getNanoTime());
    }
    
    function add(Moment self, uint128 nanos) internal pure returns (Moment) {
        return Moment.wrap(Moment.unwrap(self) + nanos);
    }
    
    function isAfter(Moment self, Moment other) internal pure returns (bool) {
        return Moment.unwrap(self) > Moment.unwrap(other);
    }
}
```

### Hardware Integration

Time comes from the metal. OCP TAP cards return nanoseconds directly. No software clock drift. No NTP uncertainty. Hardware truth.

```c
// Hardware time card interface
typedef unsigned __int128 nano_moment_t;

nano_moment_t get_hardware_nano_time() {
    struct timespec ts;
    // Get time from OCP TAP hardware
    ocp_tap_gettime(&ts);
    
    nano_moment_t nanos = ts.tv_sec * 1000000000ULL;
    nanos += ts.tv_nsec;
    
    return nanos;
}
```

## Precision Guarantees

### Accuracy Levels

Three tiers. Hardware-attested timestamps hit ±30 nanoseconds - tight enough for high-frequency trading where microseconds move millions. Network consensus relaxes to ±100 nanoseconds - still tighter than anything else in crypto. Software fallback at ±1 microsecond for operations where precision matters less than availability.

```html
<table class="spec-table">
  <thead>
    <tr><th>Level</th><th>Precision</th><th>Use Case</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Hardware</strong></td><td>±30 nanoseconds</td><td>Critical financial transactions</td></tr>
    <tr><td><strong>Network</strong></td><td>±100 nanoseconds</td><td>Standard transactions</td></tr>
    <tr><td><strong>Software</strong></td><td>±1 microsecond</td><td>Non-critical operations</td></tr>
  </tbody>
</table>
```

### Synchronization Protocol

GPS as ground truth. Hardware oscillator as continuous reference. Drift exceeds 100 nanoseconds? Automatic correction. No manual intervention. Precision maintained autonomously.

```python
class NanoMomentSync:
    def synchronize(self):
        # Get hardware time
        hw_time = self.time_card.get_nano_time()
        
        # Get GPS reference
        gps_time = self.gps_receiver.get_nano_time()
        
        # Calculate drift
        drift = hw_time - gps_time
        
        # Adjust if needed (max 100ns drift allowed)
        if abs(drift) > 100:
            self.time_card.adjust(drift)
            
        return NanoMoment(hw_time)
```

## Operations

### Arithmetic Operations

Standard math. Add nanoseconds, subtract to get durations, convert between units. BigInt handles the 128-bit values JavaScript's Number type can't touch.

```javascript
class NanoMoment {
    constructor(value) {
        this.value = BigInt(value);
    }
    
    // Addition
    add(nanos) {
        return new NanoMoment(this.value + BigInt(nanos));
    }
    
    // Subtraction (returns duration in nanoseconds)
    subtract(other) {
        return this.value - other.value;
    }
    
    // Add duration
    addDuration(amount, unit) {
        const nanos = this.toNanos(amount, unit);
        return new NanoMoment(this.value + nanos);
    }
    
    toNanos(amount, unit) {
        const conversions = {
            'nanosecond': 1n,
            'microsecond': 1000n,
            'millisecond': 1000000n,
            'second': 1000000000n,
            'minute': 60000000000n,
            'hour': 3600000000000n,
            'day': 86400000000000n
        };
        return BigInt(amount) * conversions[unit];
    }
}
```

### Comparison Operations

Ordering is the whole point. Which transaction came first? Compare NanoMoments. Validity windows prevent replay attacks - timestamps too old or too future get rejected.

```rust
impl Ord for NanoMoment {
    fn cmp(&self, other: &Self) -> Ordering {
        self.0.cmp(&other.0)
    }
}

impl NanoMoment {
    /// Check if moment is within validity window
    pub fn is_valid(&self, window_nanos: u128) -> bool {
        let now = Self::now();
        let diff = now.0.saturating_sub(self.0);
        diff <= window_nanos
    }
    
    /// Check if moment is in the future
    pub fn is_future(&self) -> bool {
        self.0 > Self::now().0
    }
}
```

## Serialization

### Binary Format

16 bytes on the wire. Little-endian split across two 64-bit words. Compact enough for transaction payloads, standard enough for any language to parse.

```
NanoMoment Binary Layout (16 bytes):
[0-7]   Lower 64 bits (little-endian)
[8-15]  Upper 64 bits (little-endian)
```

### JSON Representation

APIs return both the raw integer and human-readable ISO format. Hardware attestation travels with the timestamp - signature proves it came from real hardware, not a spoofed clock.

```json
{
    "nanoMoment": "1704067200500000000",
    "formatted": "2024-01-01T12:00:00.500000000Z",
    "precision": "nanosecond",
    "attestation": {
        "hardware": true,
        "signature": "0x7f3a9b..."
    }
}
```

## Storage Optimization

### Database Schema

PostgreSQL doesn't have native u128. Custom domain with numeric type handles it. Indexes on timestamp columns enable temporal queries - find all transactions in a nanosecond window.

```sql
-- PostgreSQL with custom type
CREATE DOMAIN nanomoment AS NUMERIC(39, 0)
    CHECK (VALUE >= 0 AND VALUE <= 340282366920938463463374607431768211455);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    timestamp nanomoment NOT NULL,
    block_time nanomoment NOT NULL,
    execution_time nanomoment,
    INDEX idx_timestamp (timestamp),
    INDEX idx_temporal_order (block_time, timestamp)
);
```

### Compression

Network bandwidth matters. Varint encoding shrinks recent timestamps - most NanoMoments don't need all 16 bytes. Typical transaction timestamps compress to 8-10 bytes.

```go
// Varint encoding for network transmission
func EncodeNanoMoment(nm NanoMoment) []byte {
    buf := make([]byte, binary.MaxVarintLen128)
    n := binary.PutUvarint128(buf, nm.Value)
    return buf[:n]
}

func DecodeNanoMoment(data []byte) (NanoMoment, error) {
    value, n := binary.Uvarint128(data)
    if n <= 0 {
        return NanoMoment{}, errors.New("invalid encoding")
    }
    return NanoMoment{Value: value}, nil
}
```

## Use Cases

### Financial Trading

High-frequency trading lives and dies by timestamp precision. Two orders at the "same time"? NanoMoment resolves it. First signed, first executed. No ambiguity. No race conditions. No MEV extraction.

```solidity
contract HighFrequencyTrading {
    using NanoMoment for uint128;
    
    struct Order {
        uint128 timestamp;
        uint256 price;
        uint256 amount;
        address trader;
    }
    
    function placeOrder(uint256 price, uint256 amount) external {
        uint128 orderTime = Time.nanoNow();
        
        orders.push(Order({
            timestamp: orderTime,
            price: price,
            amount: amount,
            trader: msg.sender
        }));
        
        // Orders executed in exact nanosecond order
        executeOrdersAtTime(orderTime);
    }
}
```

### Scientific Data

Scientific instruments measure at nanosecond precision. Particle accelerators. Astronomical observations. Seismic sensors. NanoMoment captures the actual measurement time, enabling correlation across globally distributed sensors.

```python
class ScientificMeasurement:
    def record_observation(self, sensor_data):
        measurement = {
            'nano_moment': NanoMoment.now(),
            'sensor_id': sensor_data.id,
            'value': sensor_data.value,
            'precision_ns': sensor_data.timing_precision
        }
        
        # Correlate with other sensors at exact nanosecond
        correlated = self.correlate_at_time(measurement['nano_moment'])
        
        return measurement
```

## Conversion Utilities

### To/From Other Formats

Real systems use different time formats. Unix seconds. JavaScript milliseconds. ISO strings. NanoMoment converts cleanly to all of them - precision loss only when the target format demands it.

```typescript
class NanoMomentConverter {
    // To Unix timestamp (seconds)
    static toUnixSeconds(nm: NanoMoment): number {
        return Number(nm.value / 1000000000n);
    }
    
    // From Unix timestamp
    static fromUnixSeconds(seconds: number): NanoMoment {
        return new NanoMoment(BigInt(seconds) * 1000000000n);
    }
    
    // To JavaScript Date
    static toDate(nm: NanoMoment): Date {
        const millis = Number(nm.value / 1000000n);
        return new Date(millis);
    }
    
    // From JavaScript Date
    static fromDate(date: Date): NanoMoment {
        const millis = BigInt(date.getTime());
        return new NanoMoment(millis * 1000000n);
    }
    
    // Human-readable format
    static format(nm: NanoMoment): string {
        const date = this.toDate(nm);
        const nanos = Number(nm.value % 1000000000n);
        return `${date.toISOString().slice(0, -1)}${nanos.toString().padStart(9, '0')}Z`;
    }
}
```

## Performance Considerations

### Benchmarks

Fast. Creation takes 3 nanoseconds. Comparison takes 2. The expensive operation is attestation verification at 1 microsecond - still negligible compared to network latency. Gas costs scale proportionally.

```html
<table class="spec-table">
  <thead>
    <tr><th>Operation</th><th>Time (ns)</th><th>Gas Cost</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Create NanoMoment</strong></td><td>3</td><td>200</td></tr>
    <tr><td><strong>Add/Subtract</strong></td><td>5</td><td>300</td></tr>
    <tr><td><strong>Compare</strong></td><td>2</td><td>150</td></tr>
    <tr><td><strong>Hash</strong></td><td>15</td><td>500</td></tr>
    <tr><td><strong>Verify Attestation</strong></td><td>1000</td><td>5000</td></tr>
  </tbody>
</table>
```

### Optimization Tips

Constants beat runtime math. Pre-calculate common durations at compile time. One second is always a billion nanoseconds - no reason to multiply every time.

```rust
// Pre-calculate common durations
const ONE_SECOND: u128 = 1_000_000_000;
const ONE_MINUTE: u128 = 60_000_000_000;
const ONE_HOUR: u128 = 3_600_000_000_000;
const ONE_DAY: u128 = 86_400_000_000_000;

// Use constants instead of runtime calculation
impl NanoMoment {
    pub fn add_seconds(&self, seconds: u64) -> Self {
        NanoMoment(self.0 + (seconds as u128 * ONE_SECOND))
    }
}
```

## Security Properties

### Overflow Protection

128 bits won't overflow for quintillions of years, but malicious input might try. SafeMath patterns catch arithmetic overflow before it corrupts state.

```solidity
library SafeNanoMath {
    uint128 constant MAX_NANO = type(uint128).max;
    
    function safeAdd(uint128 a, uint128 b) internal pure returns (uint128) {
        require(a <= MAX_NANO - b, "NanoMoment overflow");
        return a + b;
    }
    
    function safeSub(uint128 a, uint128 b) internal pure returns (uint128) {
        require(b <= a, "NanoMoment underflow");
        return a - b;
    }
}
```

### Time-Based Attacks Prevention

Future timestamps could pre-position transactions. Ancient timestamps could replay old attacks. Validation rejects both - 1 hour future window, 24 hour past window. Hardware attestation proves the timestamp came from real hardware, not fabricated bytes.

```python
def validate_nano_moment(nm: int) -> bool:
    current = NanoMoment.now()
    
    # Reject timestamps too far in future (>1 hour)
    if nm > current + (3600 * 10**9):
        return False
    
    # Reject timestamps too far in past (>24 hours)
    if nm < current - (86400 * 10**9):
        return False
    
    # Verify hardware attestation
    if not verify_hardware_signature(nm):
        return False
    
    return True
```

## Integration Examples

### Smart Contract Events

Indexed NanoMoments enable temporal queries. Find all events in a time range. Correlate actions across contracts. Audit trails with nanosecond precision.

```solidity
event TemporalEvent(
    uint128 indexed nanoMoment,
    address indexed actor,
    string action,
    bytes32 dataHash
);

function logAction(string memory action, bytes32 dataHash) external {
    uint128 eventTime = Time.nanoNow();
    emit TemporalEvent(eventTime, msg.sender, action, dataHash);
}
```

### Cross-Chain Time Bridge

Time crosses chains. ROKO's NanoMoment bridges to other networks with cryptographic proof. Destination chain verifies the timestamp is legitimate ROKO time, not a fabricated value. Temporal ordering survives the hop.

```javascript
// Bridge NanoMoment to other chains
async function bridgeTime(targetChain) {
    const nm = await getNanoMoment();
    const proof = await generateTimeProof(nm);
    
    const message = {
        nanoMoment: nm.toString(),
        proof: proof,
        sourceChain: 'roko',
        targetChain: targetChain
    };
    
    await bridge.send(message);
}
```

## Future Extensions

### Planned Enhancements

Quantum-resistant attestation when RSA falls. Relativistic corrections for satellite validators - GPS already compensates, but deep space nodes need more. Leap second handling automated into the protocol. Time zones are display concerns, not data concerns - NanoMoment stays UTC.

## Best Practices

Hardware attestation for anything financial. Validate timestamps before processing - don't trust input. Store as u128, convert only for display. Pre-calculate durations.

Avoid floating-point for time - precision loss corrupts ordering. Don't assume monotonic time in distributed systems - network partitions happen. Always validate in smart contracts - on-chain data is adversarial. Keep precision until the last moment.

---

## See Also

- [Temporal Infrastructure](./temporal-infrastructure.md)
- [Hardware Timestamping](./hardware-timestamping.md)
- [TimeRPC Protocol](../archive/timerpc.md)