# Testing Framework

## Testing Temporal Smart Contracts

### Time Manipulation
```javascript
const { TimeTestUtils } = require('@roko/test-utils');

describe('Temporal Contract', () => {
    let time;
    
    beforeEach(() => {
        time = new TimeTestUtils();
    });
    
    it('should execute at precise time', async () => {
        const targetTime = time.nanoNow() + 1000000000n; // +1 second
        await time.setNextBlockTime(targetTime);
        
        const tx = await contract.scheduleExecution(targetTime);
        expect(tx.timestamp).to.equal(targetTime);
    });
});
```

### Testing Patterns

#### Temporal Assertions
```javascript
// Assert transaction ordering
expect(tx1.nanoTime).to.be.lessThan(tx2.nanoTime);

// Assert time windows
expect(execution.time).to.be.within(
    startTime,
    startTime + windowDuration
);
```

#### Mock Time Provider
```javascript
const mockTime = {
    nanoNow: () => 1234567890123456789n,
    blockTime: () => 1234567890123456000n
};

await contract.connect(mockTime).execute();
```

### Performance Testing
```bash
npx hardhat test --network roko-local --time-precision nano
```

---

> **Test with precision**: Validate nanosecond-accurate execution.