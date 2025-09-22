# Time-Locked Operations

Advanced patterns and implementations for time-locked operations using ROKO's nanosecond precision temporal features.

## Overview

Time-locked operations enable:
- Precise scheduling of contract executions
- Temporal access control
- Time-based token vesting
- Scheduled payments and escrows
- Temporal governance mechanisms

## Core Time-Lock Patterns

### Basic Time Lock

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@roko/contracts/interfaces/ITimeOracle.sol";

contract BasicTimeLock {
    ITimeOracle public immutable timeOracle;
    
    struct TimeLock {
        address beneficiary;
        uint256 amount;
        uint256 unlockNanoTime;
        bool claimed;
    }
    
    mapping(bytes32 => TimeLock) public timeLocks;
    uint256 public totalLocked;
    
    event Locked(bytes32 indexed lockId, address indexed beneficiary, uint256 amount, uint256 unlockTime);
    event Unlocked(bytes32 indexed lockId, address indexed beneficiary, uint256 amount);
    
    constructor(address _timeOracle) {
        timeOracle = ITimeOracle(_timeOracle);
    }
    
    function createTimeLock(
        address beneficiary,
        uint256 unlockNanoTime
    ) external payable {
        require(msg.value > 0, "No value sent");
        require(unlockNanoTime > timeOracle.getCurrentNanoTime(), "Unlock time in past");
        
        bytes32 lockId = keccak256(abi.encodePacked(
            msg.sender,
            beneficiary,
            msg.value,
            unlockNanoTime,
            block.timestamp
        ));
        
        timeLocks[lockId] = TimeLock({
            beneficiary: beneficiary,
            amount: msg.value,
            unlockNanoTime: unlockNanoTime,
            claimed: false
        });
        
        totalLocked += msg.value;
        
        emit Locked(lockId, beneficiary, msg.value, unlockNanoTime);
    }
    
    function unlock(bytes32 lockId) external {
        TimeLock storage lock = timeLocks[lockId];
        require(!lock.claimed, "Already claimed");
        require(msg.sender == lock.beneficiary, "Not beneficiary");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime >= lock.unlockNanoTime, "Still locked");
        
        lock.claimed = true;
        totalLocked -= lock.amount;
        
        payable(lock.beneficiary).transfer(lock.amount);
        
        emit Unlocked(lockId, lock.beneficiary, lock.amount);
    }
    
    function getTimeUntilUnlock(bytes32 lockId) external view returns (uint256) {
        TimeLock memory lock = timeLocks[lockId];
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        
        if (currentTime >= lock.unlockNanoTime) {
            return 0;
        }
        
        return lock.unlockNanoTime - currentTime;
    }
}
```

### Vesting Schedule

```solidity
contract NanoVesting {
    using SafeMath for uint256;
    
    ITimeOracle public immutable timeOracle;
    IERC20 public immutable token;
    
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 startNanoTime;
        uint256 cliffNanoTime;
        uint256 endNanoTime;
        uint256 claimed;
        bool revocable;
        bool revoked;
    }
    
    mapping(bytes32 => VestingSchedule) public vestingSchedules;
    mapping(address => bytes32[]) public beneficiarySchedules;
    
    uint256 public constant NANOSECONDS_PER_DAY = 86400000000000;
    
    event VestingCreated(bytes32 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event TokensClaimed(bytes32 indexed scheduleId, uint256 amount);
    event VestingRevoked(bytes32 indexed scheduleId, uint256 refunded);
    
    function createVesting(
        address beneficiary,
        uint256 amount,
        uint256 startDelayNanos,
        uint256 cliffDurationNanos,
        uint256 vestingDurationNanos,
        bool revocable
    ) external returns (bytes32) {
        require(amount > 0, "Amount must be > 0");
        require(vestingDurationNanos > 0, "Duration must be > 0");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        uint256 startTime = currentTime.add(startDelayNanos);
        uint256 cliffTime = startTime.add(cliffDurationNanos);
        uint256 endTime = startTime.add(vestingDurationNanos);
        
        bytes32 scheduleId = keccak256(abi.encodePacked(
            beneficiary,
            amount,
            startTime,
            block.timestamp
        ));
        
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: amount,
            startNanoTime: startTime,
            cliffNanoTime: cliffTime,
            endNanoTime: endTime,
            claimed: 0,
            revocable: revocable,
            revoked: false
        });
        
        beneficiarySchedules[beneficiary].push(scheduleId);
        
        // Transfer tokens to contract
        token.transferFrom(msg.sender, address(this), amount);
        
        emit VestingCreated(scheduleId, beneficiary, amount);
        return scheduleId;
    }
    
    function claim(bytes32 scheduleId) external {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(msg.sender == schedule.beneficiary, "Not beneficiary");
        require(!schedule.revoked, "Vesting revoked");
        
        uint256 vested = calculateVested(scheduleId);
        uint256 claimable = vested.sub(schedule.claimed);
        
        require(claimable > 0, "Nothing to claim");
        
        schedule.claimed = schedule.claimed.add(claimable);
        token.transfer(schedule.beneficiary, claimable);
        
        emit TokensClaimed(scheduleId, claimable);
    }
    
    function calculateVested(bytes32 scheduleId) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];
        
        if (schedule.revoked) {
            return schedule.claimed;
        }
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        
        if (currentTime < schedule.cliffNanoTime) {
            return 0;
        }
        
        if (currentTime >= schedule.endNanoTime) {
            return schedule.totalAmount;
        }
        
        uint256 elapsedTime = currentTime.sub(schedule.startNanoTime);
        uint256 vestingDuration = schedule.endNanoTime.sub(schedule.startNanoTime);
        
        // Calculate with nanosecond precision
        return schedule.totalAmount.mul(elapsedTime).div(vestingDuration);
    }
    
    function revoke(bytes32 scheduleId) external {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");
        require(msg.sender == owner, "Not owner");
        
        uint256 vested = calculateVested(scheduleId);
        uint256 unvested = schedule.totalAmount.sub(vested);
        
        schedule.revoked = true;
        
        if (unvested > 0) {
            token.transfer(owner, unvested);
        }
        
        emit VestingRevoked(scheduleId, unvested);
    }
}
```

## Scheduled Payments

### Recurring Payments

```solidity
contract RecurringPayments {
    ITimeOracle public immutable timeOracle;
    
    struct PaymentSchedule {
        address from;
        address to;
        uint256 amount;
        uint256 intervalNanos;
        uint256 nextPaymentTime;
        uint256 endTime;
        uint256 totalPayments;
        uint256 paymentsMade;
        bool active;
    }
    
    mapping(bytes32 => PaymentSchedule) public schedules;
    mapping(address => uint256) public deposits;
    
    event ScheduleCreated(bytes32 indexed scheduleId, address indexed from, address indexed to);
    event PaymentExecuted(bytes32 indexed scheduleId, uint256 paymentNumber, uint256 nanoTime);
    event ScheduleCancelled(bytes32 indexed scheduleId);
    
    function createRecurringPayment(
        address to,
        uint256 amount,
        uint256 intervalNanos,
        uint256 totalPayments,
        uint256 startDelayNanos
    ) external payable returns (bytes32) {
        require(msg.value >= amount.mul(totalPayments), "Insufficient deposit");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        uint256 firstPaymentTime = currentTime.add(startDelayNanos);
        uint256 endTime = firstPaymentTime.add(intervalNanos.mul(totalPayments));
        
        bytes32 scheduleId = keccak256(abi.encodePacked(
            msg.sender,
            to,
            amount,
            currentTime
        ));
        
        schedules[scheduleId] = PaymentSchedule({
            from: msg.sender,
            to: to,
            amount: amount,
            intervalNanos: intervalNanos,
            nextPaymentTime: firstPaymentTime,
            endTime: endTime,
            totalPayments: totalPayments,
            paymentsMade: 0,
            active: true
        });
        
        deposits[msg.sender] = deposits[msg.sender].add(msg.value);
        
        emit ScheduleCreated(scheduleId, msg.sender, to);
        return scheduleId;
    }
    
    function executePayment(bytes32 scheduleId) external {
        PaymentSchedule storage schedule = schedules[scheduleId];
        require(schedule.active, "Schedule not active");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime >= schedule.nextPaymentTime, "Payment not due");
        
        // Calculate number of due payments
        uint256 duePayments = 0;
        uint256 nextTime = schedule.nextPaymentTime;
        
        while (nextTime <= currentTime && 
               schedule.paymentsMade + duePayments < schedule.totalPayments) {
            duePayments++;
            nextTime = nextTime.add(schedule.intervalNanos);
        }
        
        require(duePayments > 0, "No payments due");
        
        uint256 totalAmount = schedule.amount.mul(duePayments);
        require(deposits[schedule.from] >= totalAmount, "Insufficient balance");
        
        // Update state
        schedule.paymentsMade = schedule.paymentsMade.add(duePayments);
        schedule.nextPaymentTime = nextTime;
        deposits[schedule.from] = deposits[schedule.from].sub(totalAmount);
        
        // Check if schedule complete
        if (schedule.paymentsMade >= schedule.totalPayments) {
            schedule.active = false;
        }
        
        // Transfer funds
        payable(schedule.to).transfer(totalAmount);
        
        emit PaymentExecuted(scheduleId, schedule.paymentsMade, currentTime);
    }
    
    function cancelSchedule(bytes32 scheduleId) external {
        PaymentSchedule storage schedule = schedules[scheduleId];
        require(msg.sender == schedule.from, "Not owner");
        require(schedule.active, "Already inactive");
        
        uint256 remainingPayments = schedule.totalPayments.sub(schedule.paymentsMade);
        uint256 refund = remainingPayments.mul(schedule.amount);
        
        schedule.active = false;
        deposits[schedule.from] = deposits[schedule.from].sub(refund);
        
        payable(schedule.from).transfer(refund);
        
        emit ScheduleCancelled(scheduleId);
    }
}
```

## Temporal Escrow

### Multi-Stage Escrow

```solidity
contract TemporalEscrow {
    ITimeOracle public immutable timeOracle;
    
    enum EscrowState { Created, Funded, Released, Refunded, Disputed }
    
    struct Escrow {
        address buyer;
        address seller;
        address arbiter;
        uint256 amount;
        uint256 createdAt;
        uint256 fundingDeadline;
        uint256 deliveryDeadline;
        uint256 inspectionPeriod;
        EscrowState state;
        bytes32 deliveryHash;
    }
    
    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool approved;
    }
    
    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => Milestone[]) public milestones;
    
    event EscrowCreated(bytes32 indexed escrowId, address buyer, address seller);
    event EscrowFunded(bytes32 indexed escrowId, uint256 amount);
    event MilestoneCompleted(bytes32 indexed escrowId, uint256 milestoneIndex);
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount);
    event DisputeRaised(bytes32 indexed escrowId, address by);
    
    function createEscrow(
        address seller,
        address arbiter,
        uint256 fundingPeriodNanos,
        uint256 deliveryPeriodNanos,
        uint256 inspectionPeriodNanos,
        bytes32 deliveryHash
    ) external returns (bytes32) {
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        
        bytes32 escrowId = keccak256(abi.encodePacked(
            msg.sender,
            seller,
            currentTime
        ));
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            arbiter: arbiter,
            amount: 0,
            createdAt: currentTime,
            fundingDeadline: currentTime.add(fundingPeriodNanos),
            deliveryDeadline: currentTime.add(fundingPeriodNanos).add(deliveryPeriodNanos),
            inspectionPeriod: inspectionPeriodNanos,
            state: EscrowState.Created,
            deliveryHash: deliveryHash
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller);
        return escrowId;
    }
    
    function addMilestone(
        bytes32 escrowId,
        string memory description,
        uint256 amount,
        uint256 deadlineNanos
    ) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Not party");
        require(escrow.state == EscrowState.Created, "Wrong state");
        
        milestones[escrowId].push(Milestone({
            description: description,
            amount: amount,
            deadline: escrow.createdAt.add(deadlineNanos),
            completed: false,
            approved: false
        }));
    }
    
    function fundEscrow(bytes32 escrowId) external payable {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Not buyer");
        require(escrow.state == EscrowState.Created, "Wrong state");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime <= escrow.fundingDeadline, "Funding deadline passed");
        
        uint256 totalMilestoneAmount = 0;
        for (uint i = 0; i < milestones[escrowId].length; i++) {
            totalMilestoneAmount = totalMilestoneAmount.add(milestones[escrowId][i].amount);
        }
        
        require(msg.value == totalMilestoneAmount, "Incorrect amount");
        
        escrow.amount = msg.value;
        escrow.state = EscrowState.Funded;
        
        emit EscrowFunded(escrowId, msg.value);
    }
    
    function completeMilestone(
        bytes32 escrowId,
        uint256 milestoneIndex,
        bytes calldata proof
    ) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.seller, "Not seller");
        require(escrow.state == EscrowState.Funded, "Wrong state");
        
        Milestone storage milestone = milestones[escrowId][milestoneIndex];
        require(!milestone.completed, "Already completed");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime <= milestone.deadline, "Milestone deadline passed");
        
        milestone.completed = true;
        
        emit MilestoneCompleted(escrowId, milestoneIndex);
        
        // Start inspection period
        escrow.deliveryDeadline = currentTime.add(escrow.inspectionPeriod);
    }
    
    function approveMilestone(
        bytes32 escrowId,
        uint256 milestoneIndex
    ) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Not buyer");
        
        Milestone storage milestone = milestones[escrowId][milestoneIndex];
        require(milestone.completed, "Not completed");
        require(!milestone.approved, "Already approved");
        
        milestone.approved = true;
        
        // Release milestone payment
        payable(escrow.seller).transfer(milestone.amount);
        
        // Check if all milestones completed
        bool allCompleted = true;
        for (uint i = 0; i < milestones[escrowId].length; i++) {
            if (!milestones[escrowId][i].approved) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            escrow.state = EscrowState.Released;
            emit EscrowReleased(escrowId, escrow.amount);
        }
    }
    
    function raiseDispute(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not party to escrow"
        );
        require(escrow.state == EscrowState.Funded, "Wrong state");
        
        escrow.state = EscrowState.Disputed;
        
        emit DisputeRaised(escrowId, msg.sender);
    }
    
    function resolveDispute(
        bytes32 escrowId,
        uint256 buyerAmount,
        uint256 sellerAmount
    ) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.arbiter, "Not arbiter");
        require(escrow.state == EscrowState.Disputed, "Not disputed");
        require(buyerAmount.add(sellerAmount) <= escrow.amount, "Invalid amounts");
        
        escrow.state = EscrowState.Released;
        
        if (buyerAmount > 0) {
            payable(escrow.buyer).transfer(buyerAmount);
        }
        
        if (sellerAmount > 0) {
            payable(escrow.seller).transfer(sellerAmount);
        }
        
        emit EscrowReleased(escrowId, escrow.amount);
    }
}
```

## Temporal Governance

### Time-Weighted Voting

```solidity
contract TemporalGovernance {
    ITimeOracle public immutable timeOracle;
    IERC20 public immutable governanceToken;
    
    struct Proposal {
        string description;
        address proposer;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startNanoTime;
        uint256 endNanoTime;
        uint256 executionTime;
        bool executed;
        mapping(address => Vote) votes;
    }
    
    struct Vote {
        bool support;
        uint256 weight;
        uint256 voteNanoTime;
        uint256 lockDuration;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    uint256 public constant MIN_PROPOSAL_DURATION = 259200000000000; // 3 days
    uint256 public constant EXECUTION_DELAY = 172800000000000; // 2 days
    
    event ProposalCreated(uint256 indexed proposalId, address proposer);
    event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    
    function createProposal(
        string memory description,
        uint256 durationNanos
    ) external returns (uint256) {
        require(durationNanos >= MIN_PROPOSAL_DURATION, "Duration too short");
        require(governanceToken.balanceOf(msg.sender) > 0, "No governance tokens");
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        uint256 proposalId = proposalCount++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.startNanoTime = currentTime;
        proposal.endNanoTime = currentTime.add(durationNanos);
        proposal.executionTime = proposal.endNanoTime.add(EXECUTION_DELAY);
        
        emit ProposalCreated(proposalId, msg.sender);
        return proposalId;
    }
    
    function castVote(
        uint256 proposalId,
        bool support,
        uint256 lockDurationNanos
    ) external {
        Proposal storage proposal = proposals[proposalId];
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        
        require(currentTime >= proposal.startNanoTime, "Voting not started");
        require(currentTime <= proposal.endNanoTime, "Voting ended");
        require(proposal.votes[msg.sender].weight == 0, "Already voted");
        
        uint256 balance = governanceToken.balanceOf(msg.sender);
        require(balance > 0, "No tokens");
        
        // Calculate time-weighted voting power
        uint256 timeRemaining = proposal.endNanoTime.sub(currentTime);
        uint256 timeWeight = timeRemaining.mul(100).div(proposal.endNanoTime.sub(proposal.startNanoTime));
        
        // Lock duration bonus (up to 2x for 1 year lock)
        uint256 lockBonus = lockDurationNanos.mul(100).div(31536000000000000); // 1 year in nanos
        if (lockBonus > 100) lockBonus = 100; // Cap at 100% bonus
        
        uint256 votingPower = balance.mul(100 + timeWeight).mul(100 + lockBonus).div(10000);
        
        proposal.votes[msg.sender] = Vote({
            support: support,
            weight: votingPower,
            voteNanoTime: currentTime,
            lockDuration: lockDurationNanos
        });
        
        if (support) {
            proposal.forVotes = proposal.forVotes.add(votingPower);
        } else {
            proposal.againstVotes = proposal.againstVotes.add(votingPower);
        }
        
        // Lock tokens
        governanceToken.transferFrom(msg.sender, address(this), balance);
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    function executeProposal(uint256 proposalId, bytes calldata actions) external {
        Proposal storage proposal = proposals[proposalId];
        
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime >= proposal.executionTime, "Execution delay not met");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        
        proposal.executed = true;
        
        // Execute actions (simplified)
        (bool success,) = address(this).call(actions);
        require(success, "Execution failed");
        
        emit ProposalExecuted(proposalId);
    }
}
```

## Integration Examples

### JavaScript Integration

```javascript
const { ethers } = require('ethers');
const { RokoTimeClient } = require('@roko/sdk');

class TimeLockManager {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.rokoClient = new RokoTimeClient();
    }
    
    async createTimeLock(beneficiary, amountEth, lockDurationSeconds) {
        // Convert duration to nanoseconds
        const durationNanos = ethers.BigNumber.from(lockDurationSeconds).mul(1e9);
        
        // Get current time from ROKO
        const currentTime = await this.rokoClient.getCurrentNanoTime();
        const unlockTime = currentTime.add(durationNanos);
        
        // Deploy time lock
        const tx = await this.timeLockContract.createTimeLock(
            beneficiary,
            unlockTime,
            { value: ethers.utils.parseEther(amountEth) }
        );
        
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'Locked');
        
        return {
            lockId: event.args.lockId,
            unlockTime: new Date(Number(unlockTime.div(1e6))), // Convert to milliseconds
            amount: amountEth
        };
    }
    
    async checkUnlockStatus(lockId) {
        const timeRemaining = await this.timeLockContract.getTimeUntilUnlock(lockId);
        
        if (timeRemaining.eq(0)) {
            return { status: 'unlocked', timeRemaining: 0 };
        }
        
        // Convert nanoseconds to human-readable format
        const seconds = timeRemaining.div(1e9);
        const days = seconds.div(86400);
        const hours = seconds.mod(86400).div(3600);
        const minutes = seconds.mod(3600).div(60);
        
        return {
            status: 'locked',
            timeRemaining: {
                days: days.toNumber(),
                hours: hours.toNumber(),
                minutes: minutes.toNumber(),
                totalSeconds: seconds.toNumber()
            }
        };
    }
}
```

## Testing Time-Locked Contracts

```javascript
const { time } = require('@openzeppelin/test-helpers');

describe('TimeLock', function() {
    it('should enforce time locks with nanosecond precision', async function() {
        const lockDuration = ethers.BigNumber.from(86400).mul(1e9); // 1 day in nanos
        
        // Create time lock
        await timeLock.createTimeLock(
            beneficiary.address,
            lockDuration,
            { value: ethers.utils.parseEther('1.0') }
        );
        
        // Try to unlock immediately (should fail)
        await expect(
            timeLock.connect(beneficiary).unlock(lockId)
        ).to.be.revertedWith('Still locked');
        
        // Advance time
        await time.increase(86401);
        
        // Now should succeed
        await timeLock.connect(beneficiary).unlock(lockId);
    });
});
```

## Security Best Practices

1. **Time Validation**: Always validate time inputs against current time
2. **Overflow Protection**: Use SafeMath for time calculations
3. **Re-entrancy**: Protect against re-entrancy in unlock functions
4. **Time Oracle Trust**: Implement fallback mechanisms
5. **Precision Handling**: Be careful with nanosecond arithmetic

## Gas Optimization Tips

- Pack time-related structs efficiently
- Use events for time tracking instead of storage where possible
- Batch time checks in loops
- Cache time oracle calls within transactions

## Next Steps

- [Contract Examples](./contract-examples.md) - More contract patterns
- [Smart Contracts Guide](./smart-contracts.md) - General development
- [Testing Framework](./testing-framework.md) - Testing strategies
- [Temporal Contracts](./temporal-contracts.md) - Advanced temporal patterns

---

*Time-Lock Support: contracts@roko.network*