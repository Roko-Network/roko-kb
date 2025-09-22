# Temporal Contracts

## Time-Aware Smart Contract Patterns

Temporal contracts leverage ROKO's nanosecond precision to enable time-based logic impossible on other blockchains.

## Core Patterns

### Time-Locked Vaults
```solidity
contract TemporalVault {
    mapping(address => uint128) public unlockTimes;
    
    function deposit(uint128 unlockAt) external payable {
        require(unlockAt > Time.nanoNow());
        unlockTimes[msg.sender] = unlockAt;
    }
    
    function withdraw() external {
        require(Time.nanoNow() >= unlockTimes[msg.sender]);
        // Transfer funds
    }
}
```

### Scheduled Execution
```solidity
contract ScheduledTask {
    struct Task {
        uint128 executeAt;
        bytes data;
        bool executed;
    }
    
    function scheduleTask(uint128 when, bytes calldata data) external {
        tasks.push(Task(when, data, false));
    }
    
    function executeDue() external {
        uint128 now = Time.nanoNow();
        for (uint i = 0; i < tasks.length; i++) {
            if (!tasks[i].executed && tasks[i].executeAt <= now) {
                execute(tasks[i].data);
                tasks[i].executed = true;
            }
        }
    }
}
```

### Temporal Auctions
```solidity
contract NanoAuction {
    function bid() external payable {
        uint128 bidTime = Time.nanoNow();
        bids[bidTime] = Bid(msg.sender, msg.value);
        // Automatic ordering by nanosecond
    }
}
```

---

> **Time is Code**: Build logic that executes at precise nanoseconds.