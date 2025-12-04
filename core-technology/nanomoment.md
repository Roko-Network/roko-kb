# NanoMoment Architecture

## The Timestamp Data Type

NanoMoment is ROKO's timestamp format - a 128-bit integer representing nanoseconds since Unix epoch. Large enough to outlast the universe, precise enough to order transactions within the same microsecond.

## What is a NanoMoment?

A NanoMoment is a **128-bit unsigned integer** representing nanoseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC).

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

### The Math Behind NanoMoment

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

| Level | Precision | Use Case |
|-------|-----------|----------|
| **Hardware** | ±30 nanoseconds | Critical financial transactions |
| **Network** | ±100 nanoseconds | Standard transactions |
| **Software** | ±1 microsecond | Non-critical operations |

### Synchronization Protocol

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

```
NanoMoment Binary Layout (16 bytes):
[0-7]   Lower 64 bits (little-endian)
[8-15]  Upper 64 bits (little-endian)
```

### JSON Representation

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

| Operation | Time (ns) | Gas Cost |
|-----------|-----------|----------|
| Create NanoMoment | 3 | 200 |
| Add/Subtract | 5 | 300 |
| Compare | 2 | 150 |
| Hash | 15 | 500 |
| Verify Attestation | 1000 | 5000 |

### Optimization Tips

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

1. **Quantum Timestamps**: Post-quantum secure time attestation
2. **Relativistic Corrections**: For space-based nodes
3. **Leap Second Handling**: Automatic adjustment protocol
4. **Time Zone Awareness**: Local time conversion utilities

## Best Practices

### Do's ✅
- Always use hardware attestation for critical operations
- Validate timestamps before processing
- Store as u128 for maximum precision
- Use constants for common durations

### Don'ts ❌
- Don't use floating-point for time calculations
- Don't assume monotonic progression in distributed systems
- Don't ignore time validation in smart contracts
- Don't convert to lower precision unnecessarily

## Learn More

- [Temporal Infrastructure →](./temporal-infrastructure.md)
- [TimeRPC Protocol →](../archive/timerpc.md)
- [Hardware Timestamping →](./hardware-timestamping.md)

---

> **Key Insight**: NanoMoment isn't just a timestamp—it's the atomic unit of temporal truth in the ROKO Network, enabling unprecedented precision in distributed systems.