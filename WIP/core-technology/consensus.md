# Consensus Mechanism

## Temporal Proof of Stake (TPoS)

ROKO Network introduces **Temporal Proof of Stake (TPoS)**, a revolutionary consensus mechanism that combines traditional Proof of Stake security with nanosecond-precision temporal ordering.

## Overview

TPoS ensures that:
- Blocks are produced in deterministic time slots
- Transactions are ordered by hardware timestamps
- Validators cannot manipulate temporal sequencing
- Network achieves sub-3-second finality

## How TPoS Works

### 1. Validator Selection

```rust
pub struct ValidatorSelection {
    epoch: u64,
    slot: u128,  // NanoMoment slot
    validators: Vec<Validator>,
}

impl ValidatorSelection {
    pub fn select_leader(&self, slot: NanoMoment) -> Address {
        // Deterministic selection based on:
        // 1. Stake weight
        // 2. Temporal performance score
        // 3. Verifiable random function (VRF)
        
        let vrf_output = self.compute_vrf(slot);
        let weighted_validators = self.apply_stake_weights();
        
        weighted_validators[vrf_output % weighted_validators.len()]
    }
}
```

### 2. Block Production Timeline

Each block production follows a precise nanosecond schedule:

```
Time (nanoseconds)    | Action
---------------------|---------------------------
0                    | Slot begins
0 - 500,000,000      | Transaction collection (0.5s)
500,000,000 - 1,000,000,000 | Block assembly (0.5s)
1,000,000,000 - 1,500,000,000 | Attestation collection (0.5s)
1,500,000,000 - 2,000,000,000 | Block propagation (0.5s)
2,000,000,000        | Block finalization
```

### 3. Temporal Attestation

Validators attest to blocks with hardware timestamps:

```solidity
struct BlockAttestation {
    uint128 blockTime;      // NanoMoment of block
    uint128 attestTime;     // NanoMoment of attestation
    bytes32 blockHash;
    address validator;
    bytes hardwareProof;    // OCP TAP signature
}
```

## Consensus Properties

### Byzantine Fault Tolerance

TPoS tolerates up to **1/3 malicious validators** while maintaining:
- Temporal ordering integrity
- Nanosecond precision
- Network liveness

### Time-Based Finality

```python
class TemporalFinality:
    def calculate_finality(self, block):
        attestations = self.get_attestations(block)
        
        # Need 2/3+ stake attesting within time window
        total_stake = sum(v.stake for v in self.validators)
        attested_stake = sum(a.stake for a in attestations)
        
        if attested_stake > (2 * total_stake) / 3:
            # Check temporal alignment
            time_variance = self.check_time_variance(attestations)
            
            if time_variance < 100_000_000:  # 100ms
                return FinalityStatus.FINALIZED
        
        return FinalityStatus.PENDING
```

### Fork Resolution

Forks are resolved using temporal precedence:

```javascript
function resolveFork(fork1, fork2) {
    // 1. Compare temporal attestations
    const time1 = fork1.getMedianAttestationTime();
    const time2 = fork2.getMedianAttestationTime();
    
    if (time1 < time2) {
        // Fork1 has temporal precedence
        return fork1;
    }
    
    // 2. If equal, compare stake weight
    if (time1 === time2) {
        return fork1.totalStake > fork2.totalStake ? fork1 : fork2;
    }
    
    return fork2;
}
```

## Validator Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 8 cores, 3.0 GHz | 16 cores, 3.5 GHz |
| **RAM** | 16 GB | 32 GB ECC |
| **Storage** | 500 GB NVMe | 2 TB NVMe RAID |
| **Network** | 100 Mbps | 1 Gbps dedicated |
| **Time Card** | OCP TAP 2.0 | OCP TAP 2.0+ with GPS |

### Time Synchronization

Validators must maintain:
- **< 100 nanosecond** drift from network time
- **Hardware time attestation** capability
- **PTP grandmaster** connectivity

```bash
# Check time sync status
roko validator time-status

# Output:
# Time Synchronization Status
# ===========================
# Current NanoMoment: 1704067200500000000
# Network Time:       1704067200500000045
# Drift:              +45 nanoseconds ✅
# Accuracy:           ±30 nanoseconds
# PTP Status:         Locked to Grandmaster
# Hardware Source:    OCP-TAP-2.0 (GPS)
```

## Staking Mechanics

### Stake Requirements

```solidity
contract ValidatorStaking {
    uint256 constant MIN_STAKE = 32_000 * 10**18;  // 32,000 ROKO
    uint128 constant LOCK_DURATION = 180 days * 10**9;  // In nanoseconds
    
    function stake(uint128 unlockTime) external payable {
        require(msg.value >= MIN_STAKE, "Insufficient stake");
        require(unlockTime > Time.nanoNow() + LOCK_DURATION, "Lock too short");
        
        validators[msg.sender] = Validator({
            stake: msg.value,
            startTime: Time.nanoNow(),
            unlockTime: unlockTime,
            performanceScore: 100,
            active: true
        });
    }
}
```

### Reward Distribution

Rewards are calculated based on:
1. **Base rewards**: Block production
2. **Attestation rewards**: Timely attestations
3. **Temporal bonus**: Maintaining time accuracy

```python
def calculate_rewards(validator, epoch):
    base_reward = BLOCKS_PROPOSED * BLOCK_REWARD
    
    # Attestation rewards
    attestation_reward = 0
    for attestation in validator.attestations:
        if attestation.is_timely():  # Within 500ms
            attestation_reward += ATTESTATION_REWARD
    
    # Temporal accuracy bonus (up to 50% boost)
    time_accuracy = validator.get_time_accuracy()
    temporal_bonus = base_reward * min(time_accuracy / 100, 0.5)
    
    return base_reward + attestation_reward + temporal_bonus
```

## Slashing Conditions

Validators can be slashed for:

### 1. Time Manipulation
```solidity
// Attempting to submit blocks with false timestamps
if (block.timestamp > Time.nanoNow() + TOLERANCE) {
    slash(validator, TIME_MANIPULATION_PENALTY);
}
```

### 2. Double Signing
```solidity
// Signing two different blocks at same slot
if (hasSignedBlock(validator, slot)) {
    slash(validator, DOUBLE_SIGN_PENALTY);
}
```

### 3. Clock Drift
```solidity
// Excessive time drift from network
if (validator.timeDrift > MAX_DRIFT) {
    slash(validator, CLOCK_DRIFT_PENALTY);
}
```

## Network Topology

### Validator Hierarchy

```
                    Grandmaster Clock
                          |
                    TimeRPC Nodes
                    /     |     \
              Primary  Primary  Primary
              Validators  ...  Validators
              /    \            /    \
          Secondary  Secondary  ...  Secondary
          Validators            Validators
```

### Geographic Distribution

Validators are incentivized to distribute globally:
- Reduces latency variance
- Improves temporal coverage
- Enhances network resilience

## Performance Metrics

### Current Network Stats

| Metric | Value |
|--------|-------|
| **Block Time** | 2.3 seconds average |
| **Finality Time** | 4.6 seconds |
| **Transactions per Block** | ~5,000 |
| **Temporal Accuracy** | ±45 nanoseconds |
| **Validator Count** | 1,000+ |
| **Network Stake** | 320M ROKO |

### Theoretical Limits

| Parameter | Maximum |
|-----------|---------|
| **TPS** | 50,000 |
| **Block Size** | 10 MB |
| **Validator Set** | 10,000 |
| **Precision** | 1 nanosecond |

## Advanced Features

### Temporal Sharding

Future implementation will include temporal shards:

```rust
pub struct TemporalShard {
    shard_id: u32,
    time_range: Range<NanoMoment>,
    validators: Vec<Address>,
    
    // Each shard processes specific time ranges
    // Enables parallel processing while maintaining order
}
```

### Cross-Shard Communication

```python
def cross_shard_transaction(from_shard, to_shard, tx):
    # Lock time on source shard
    lock_proof = from_shard.lock_at_time(tx.timestamp)
    
    # Relay with temporal proof
    relay_proof = relay_network.forward(tx, lock_proof)
    
    # Execute on destination with guaranteed ordering
    to_shard.execute_with_proof(tx, relay_proof)
```

## Security Considerations

### Time-Based Attacks

**Long-Range Attacks**: Prevented by temporal checkpoints
```solidity
// Checkpoints every 1000 blocks
if (block.number % 1000 == 0) {
    checkpoint = createTemporalCheckpoint(block);
    // Cannot reorg beyond checkpoint
}
```

**Nothing-at-Stake**: Solved by stake locking
```solidity
// Stake locked for minimum period
require(currentTime < validator.unlockTime, "Cannot withdraw");
```

**Time Manipulation**: Hardware attestation required
```rust
// All timestamps must be hardware-attested
verify_hardware_signature(block.timestamp, block.hw_proof)?;
```

## Comparison with Other Consensus Mechanisms

| Feature | TPoS (ROKO) | PoS (Ethereum) | PoW (Bitcoin) |
|---------|-------------|----------------|---------------|
| **Energy Efficiency** | ✅ High | ✅ High | ❌ Low |
| **Time to Finality** | 4.6 seconds | 12 minutes | 60 minutes |
| **MEV Protection** | ✅ Protocol level | ⚠️ Application level | ❌ None |
| **Temporal Ordering** | ✅ Nanosecond | ❌ Block-based | ❌ Block-based |
| **Hardware Requirements** | Time card required | Standard | ASICs |

## Implementation Details

### Consensus State Machine

```go
type ConsensusState int

const (
    StateNewSlot ConsensusState = iota
    StateProposing
    StateAttesting
    StateFinalizing
    StateFinalized
)

func (cs *ConsensusStateMachine) Transition(event Event) {
    switch cs.state {
    case StateNewSlot:
        if event.Type == EventSlotStart {
            cs.state = StateProposing
            cs.proposeBlock()
        }
    case StateProposing:
        if event.Type == EventBlockProposed {
            cs.state = StateAttesting
            cs.collectAttestations()
        }
    // ... continued state transitions
    }
}
```

## Future Enhancements

### Planned Improvements

1. **Quantum-Resistant Signatures**: Post-quantum cryptography
2. **Adaptive Block Times**: Dynamic adjustment based on network load
3. **Temporal Rollups**: Layer-2 with inherited time guarantees
4. **Cross-Chain Time Bridges**: Temporal proofs for other chains

## Getting Started as a Validator

Ready to join the validator set?

1. [Hardware Setup Guide →](../validators/hardware.md)
2. [Validator Installation →](../validators/node-setup.md)
3. [Staking Tutorial →](../validators/staking.md)
4. [Monitoring Best Practices →](../validators/monitoring.md)

---

> **Key Innovation**: TPoS is the first consensus mechanism to make nanosecond-precision time a fundamental part of blockchain consensus, enabling use cases impossible with traditional mechanisms.