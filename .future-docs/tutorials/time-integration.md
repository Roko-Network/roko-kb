# Time Integration

## Adding Temporal Features to Your DApp

### Understanding ROKO Time

#### Time Units
```javascript
const NANOSECOND = 1n;
const MICROSECOND = 1_000n;
const MILLISECOND = 1_000_000n;
const SECOND = 1_000_000_000n;
const MINUTE = 60_000_000_000n;
const HOUR = 3_600_000_000_000n;
```

### Frontend Integration

#### Real-Time Clock
```javascript
import { useNanoTime } from '@roko/react-hooks';

function NanoClock() {
    const nanoTime = useNanoTime();
    
    const formatTime = (nano) => {
        const date = new Date(Number(nano / 1_000_000n));
        const nanos = nano % 1_000_000_000n;
        return `${date.toISOString()}.${nanos.toString().padStart(9, '0')}`;
    };
    
    return <div>{formatTime(nanoTime)}</div>;
}
```

### Smart Contract Integration

#### Time-Based Logic
```solidity
contract TimeBasedRewards {
    using Time for uint128;
    
    mapping(address => uint128) lastClaim;
    
    function claimReward() external {
        uint128 timeSinceClaim = Time.nanoNow() - lastClaim[msg.sender];
        require(timeSinceClaim >= 86_400_000_000_000, "Wait 24 hours");
        
        uint reward = calculateReward(timeSinceClaim);
        lastClaim[msg.sender] = Time.nanoNow();
        
        // Transfer reward
    }
}
```

### Best Practices
- Always use BigInt for nanoseconds
- Cache time values when needed
- Handle time zone conversions
- Test with time manipulation

---

> **Time mastered**: Your DApp now thinks in nanoseconds!