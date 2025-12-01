# Selfient Patterns

## Self-Executing Temporal Logic

Selfient patterns are self-executing smart contract patterns that trigger automatically based on temporal conditions.

## Core Patterns

### Auto-Settlement
```solidity
contract AutoSettle {
    function createOrder(uint128 settleAt) external payable {
        // Automatically settles at exact nanosecond
        settlements[settleAt] = Settlement(msg.sender, msg.value);
    }
}
```

### Temporal Escrow
```solidity
contract TemporalEscrow {
    uint128 public releaseTime;
    
    modifier afterRelease() {
        require(Time.nanoNow() >= releaseTime);
        _;
    }
    
    function claim() external afterRelease {
        // Auto-release after time
    }
}
```

### Time-Decay Functions
```solidity
function getCurrentPrice() public view returns (uint256) {
    uint128 elapsed = Time.nanoNow() - startTime;
    return startPrice - (elapsed * decayRate / 1e9);
}
```

---

> **Self-Executing**: Contracts that run themselves based on time.