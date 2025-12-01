# pwROKO Mechanics

pwROKO (Power-Weighted ROKO) is an enhanced staking token that provides increased voting power and rewards based on lock duration and validator performance.

## What is pwROKO?

pwROKO represents time-locked ROKO with additional benefits:
- **Increased Voting Power**: Up to 4x governance weight
- **Bonus Rewards**: 1.5x to 3x reward multiplier
- **Priority Access**: Early access to new features
- **Reduced Fees**: Lower transaction and delegation fees
- **Slashing Insurance**: Partial protection against slashing

## Conversion Mechanics

### ROKO to pwROKO

```javascript
// Convert ROKO to pwROKO with lock period
const pwRokoContract = new ethers.Contract(
  PWROKO_ADDRESS,
  PWROKO_ABI,
  signer
);

// Lock periods and multipliers
const lockOptions = {
  '30': { multiplier: 1.1, votingPower: 1.2 },
  '90': { multiplier: 1.3, votingPower: 1.5 },
  '180': { multiplier: 1.6, votingPower: 2.0 },
  '365': { multiplier: 2.0, votingPower: 3.0 },
  '730': { multiplier: 3.0, votingPower: 4.0 }
};

// Convert 10,000 ROKO to pwROKO with 180-day lock
const amount = ethers.utils.parseEther("10000");
const lockDays = 180;

const tx = await pwRokoContract.convert(
  amount,
  lockDays,
  {
    validator: validatorAddress,
    autoCompound: true,
    delegatable: false
  }
);

// Calculate pwROKO received
const pwRokoAmount = amount.mul(160).div(100); // 1.6x for 180 days
console.log(`Received: ${ethers.utils.formatEther(pwRokoAmount)} pwROKO`);
```

### Lock Period Benefits

| Lock Period | Reward Multiplier | Voting Power | Early Unlock Penalty |
|-------------|------------------|--------------|--------------------|
| 30 days | 1.1x | 1.2x | 10% |
| 90 days | 1.3x | 1.5x | 15% |
| 180 days | 1.6x | 2.0x | 20% |
| 365 days | 2.0x | 3.0x | 25% |
| 730 days | 3.0x | 4.0x | 30% |

## Power Score Calculation

### Formula

```python
def calculate_power_score(roko_amount, lock_days, performance_score):
    """
    Calculate pwROKO power score
    
    Args:
        roko_amount: Base ROKO staked
        lock_days: Lock duration in days
        performance_score: Validator performance (0-100)
    """
    # Base conversion
    base_multiplier = get_lock_multiplier(lock_days)
    
    # Performance bonus (up to 20%)
    performance_bonus = performance_score / 100 * 0.2
    
    # Early adopter bonus (first 6 months)
    early_bonus = 0.1 if is_early_adopter() else 0
    
    # Calculate final power score
    power_score = roko_amount * base_multiplier * (1 + performance_bonus + early_bonus)
    
    return power_score

# Example calculation
power = calculate_power_score(
    roko_amount=10000,
    lock_days=365,
    performance_score=95
)
print(f"Power Score: {power:,.0f} pwROKO")
# Output: Power Score: 23,900 pwROKO
```

## Staking with pwROKO

### Enhanced Validator Staking

```javascript
// Stake pwROKO as validator
const validatorStake = await pwRokoContract.stakeAsValidator({
  amount: ethers.utils.parseEther("16000"), // 16,000 pwROKO
  nodeAddress: "0xNodeAddress",
  commission: 1000, // 10%
  metadata: {
    name: "Premium Validator",
    tier: "gold",
    features: ["atomic-clock", "redundant-nodes", "24-7-support"]
  }
});

// Benefits of pwROKO staking:
// - Priority block production
// - Higher attestation rewards
// - Reduced slashing risk
// - Premium support tier
```

### Delegation with pwROKO

```javascript
// Delegate pwROKO for maximum returns
const delegation = await pwRokoContract.delegate(
  validatorAddress,
  ethers.utils.parseEther("1000"),
  {
    compound: true,
    rewardsAddress: rewardsWallet,
    minApy: 15 // Auto-redelegate if APY < 15%
  }
);

// Track delegation performance
const stats = await pwRokoContract.getDelegationStats(delegatorAddress);
console.log(`
Delegation Stats:
  Total pwROKO: ${stats.totalPwRoko}
  Current APY: ${stats.currentApy}%
  Rewards Earned: ${stats.totalRewards}
  Rank: ${stats.delegatorRank}
`);
```

## Governance Benefits

### Voting Power Calculation

```solidity
// Smart contract voting power logic
function getVotingPower(address voter) public view returns (uint256) {
    uint256 rokoBalance = rokoToken.balanceOf(voter);
    uint256 pwRokoBalance = balanceOf(voter);
    
    // Get lock duration multiplier
    uint256 lockMultiplier = getLockMultiplier(voter);
    
    // Calculate total voting power
    uint256 votingPower = rokoBalance + (pwRokoBalance * lockMultiplier);
    
    // Apply reputation bonus
    uint256 reputation = reputationSystem.getScore(voter);
    votingPower = votingPower * (100 + reputation) / 100;
    
    return votingPower;
}
```

### Proposal Creation Rights

```javascript
// Only pwROKO holders can create certain proposals
const proposalTypes = {
  'PARAMETER_CHANGE': 1000,    // 1,000 pwROKO required
  'TREASURY_ALLOCATION': 5000, // 5,000 pwROKO required
  'PROTOCOL_UPGRADE': 10000,   // 10,000 pwROKO required
  'EMERGENCY_ACTION': 50000    // 50,000 pwROKO required
};

// Create governance proposal
const proposal = await governance.createProposal({
  type: 'PROTOCOL_UPGRADE',
  title: 'Implement Temporal Sharding',
  description: 'Upgrade to support 1M TPS',
  execution: upgradeCalldata,
  requiredPwRoko: proposalTypes.PROTOCOL_UPGRADE
});
```

## Liquidity Provisions

### pwROKO/ROKO Pool

```javascript
// Provide liquidity to pwROKO/ROKO pool
const liquidityAmount = ethers.utils.parseEther("5000");

// Approve tokens
await rokoToken.approve(POOL_ADDRESS, liquidityAmount);
await pwRokoToken.approve(POOL_ADDRESS, liquidityAmount);

// Add liquidity
const liquidity = await liquidityPool.addLiquidity(
  liquidityAmount, // ROKO
  liquidityAmount.mul(16).div(10), // pwROKO (1.6x rate)
  {
    slippage: 100, // 1% slippage
    deadline: Math.floor(Date.now() / 1000) + 3600,
    recipient: userAddress
  }
);

// Earn additional rewards
console.log(`LP Token Rewards:
  - Trading fees: 0.3% of volume
  - pwROKO bonus: 2% APY
  - Liquidity mining: 5% APY
`);
```

## Unlocking Mechanisms

### Scheduled Unlock

```javascript
// View unlock schedule
const schedule = await pwRokoContract.getUnlockSchedule(userAddress);

schedule.forEach(unlock => {
  console.log(`
  Amount: ${ethers.utils.formatEther(unlock.amount)} pwROKO
  Converts to: ${ethers.utils.formatEther(unlock.rokoAmount)} ROKO
  Unlock Date: ${new Date(unlock.timestamp * 1000)}
  Status: ${unlock.status}
  `);
});

// Claim unlocked tokens
if (schedule[0].status === 'UNLOCKED') {
  await pwRokoContract.claim(schedule[0].id);
}
```

### Emergency Unlock

```javascript
// Emergency unlock with penalty
const emergencyUnlock = await pwRokoContract.emergencyUnlock(
  ethers.utils.parseEther("1000"),
  {
    acceptPenalty: true, // Required flag
    reason: "Medical emergency"
  }
);

// Calculate penalty
const penalty = emergencyUnlock.penalty;
console.log(`
Emergency Unlock:
  Requested: 1000 pwROKO
  Penalty: ${ethers.utils.formatEther(penalty)} (20%)
  Received: ${ethers.utils.formatEther(emergencyUnlock.received)} ROKO
`);
```

## Advanced Strategies

### Ladder Strategy

```javascript
// Create pwROKO ladder for optimal liquidity
async function createPwRokoLadder(totalAmount) {
  const ladderSteps = 12; // Monthly unlocks
  const amountPerStep = totalAmount.div(ladderSteps);
  
  for (let i = 1; i <= ladderSteps; i++) {
    const lockDays = i * 30;
    await pwRokoContract.convert(
      amountPerStep,
      lockDays,
      { autoCompound: true }
    );
    
    console.log(`Step ${i}: Locked ${ethers.utils.formatEther(amountPerStep)} for ${lockDays} days`);
  }
}

// Execute ladder strategy
await createPwRokoLadder(ethers.utils.parseEther("12000"));
```

### Compound Strategy

```python
# Optimal compound frequency calculator
def optimal_compound_frequency(stake_amount, gas_price, reward_rate):
    """
    Calculate optimal compound frequency to maximize returns
    """
    daily_rewards = stake_amount * reward_rate / 365
    compound_cost = gas_price * 150000 * 1e-9  # Gas cost in ROKO
    
    # Find optimal frequency
    best_frequency = 1
    best_return = 0
    
    for frequency in range(1, 366):  # Daily to annual
        compound_times = 365 / frequency
        total_cost = compound_cost * compound_times
        
        # Calculate compound returns
        apr = reward_rate
        apy = (1 + apr/compound_times) ** compound_times - 1
        total_return = stake_amount * apy - total_cost
        
        if total_return > best_return:
            best_return = total_return
            best_frequency = frequency
    
    return {
        'optimal_days': best_frequency,
        'expected_return': best_return,
        'apy': (best_return / stake_amount) * 100
    }

# Example
result = optimal_compound_frequency(
    stake_amount=10000,
    gas_price=50,  # gwei
    reward_rate=0.20  # 20% APR
)
print(f"Compound every {result['optimal_days']} days")
print(f"Expected APY: {result['apy']:.2f}%")
```

## Risk Management

### Slashing Protection

```javascript
// Enable slashing insurance with pwROKO
const insurance = await pwRokoContract.enableInsurance({
  coverage: ethers.utils.parseEther("10000"), // Cover up to 10,000 ROKO
  premium: 100, // 1% annual premium
  deductible: 500 // 5% deductible
});

// Check insurance status
const coverage = await pwRokoContract.getInsuranceCoverage(validatorAddress);
console.log(`
Slashing Insurance:
  Coverage: ${coverage.maxCoverage} ROKO
  Premium: ${coverage.annualPremium} ROKO/year
  Deductible: ${coverage.deductible}%
  Claims Available: ${coverage.claimsRemaining}
`);
```

## Migration from Other Protocols

### Import Staking Position

```javascript
// Migrate from other staking protocols
const migration = await pwRokoContract.migrate({
  sourceProtocol: "ETHEREUM_STAKING",
  proof: merkleProof,
  amount: ethers.utils.parseEther("32"),
  bonus: true // Claim migration bonus
});

console.log(`
Migration Complete:
  Original: 32 ETH staking
  Converted: ${migration.pwRokoAmount} pwROKO
  Bonus: ${migration.bonusAmount} pwROKO
  Lock Period: ${migration.lockDays} days
`);
```

## Analytics Dashboard

```typescript
// Real-time pwROKO analytics
interface PwRokoAnalytics {
  totalSupply: BigNumber;
  averageLockDuration: number;
  totalValueLocked: BigNumber;
  averageAPY: number;
  topValidators: ValidatorInfo[];
}

async function getPwRokoAnalytics(): Promise<PwRokoAnalytics> {
  const analytics = await fetch('https://api.roko.network/pwroko/analytics');
  return analytics.json();
}

// Display analytics
const data = await getPwRokoAnalytics();
console.log(`
pwROKO Analytics:
  TVL: $${(data.totalValueLocked / 1e18 * 3).toFixed(2)}M
  Avg Lock: ${data.averageLockDuration} days
  Avg APY: ${data.averageAPY}%
  Holders: ${data.totalHolders}
`);
```

## FAQ

### Q: Can I transfer pwROKO?
No, pwROKO is non-transferable. It's bound to your address until unlock.

### Q: What happens to rewards during lock?
Rewards can be claimed anytime or auto-compounded for higher returns.

### Q: Can I increase my lock period?
Yes, extending lock period provides additional multiplier benefits.

### Q: Is pwROKO used in DeFi?
Yes, pwROKO can be used as collateral in approved protocols.

## Next Steps

1. **Start Staking** → [Staking Guide](./staking.md)
2. **Advanced ROKO Staking** → [ROKO Staking](./roko-staking.md)
3. **Monitor Performance** → [Monitoring](./monitoring.md)
4. **Governance Participation** → [Governance](../governance/overview.md)

---

*For pwROKO support: pwroko@roko.network*