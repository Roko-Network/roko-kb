# 💰 Staking & Rewards

Staking is the foundation of ROKO Network's Temporal Proof of Stake consensus. This guide covers everything about staking, rewards, and maximizing your validator returns.

## Staking Overview

ROKO Network uses a dual-token staking model:
- **ROKO**: Primary staking token for validators
- **pwROKO**: Power-weighted ROKO with time-locked bonuses

### Why Stake?

1. **Earn Rewards**: 15-25% APY based on performance
2. **Secure Network**: Contribute to temporal consensus
3. **Governance Rights**: Vote on protocol changes
4. **Priority Access**: Early access to new features
5. **MEV Protection**: Earn from preventing MEV attacks

## Staking Requirements

### Minimum Stakes by Tier

| Tier | Minimum ROKO | pwROKO Bonus | Max Validators |
|------|--------------|--------------|----------------|
| Bronze | 10,000 | 1.0x | Unlimited |
| Silver | 50,000 | 1.2x | 5,000 |
| Gold | 100,000 | 1.5x | 1,000 |
| Diamond | 500,000 | 2.0x | 100 |

### Hardware Requirements
- Synchronized PTP clock (<1μs accuracy)
- Minimum 99% uptime
- Hardware attestation enabled
- See [Hardware Guide](./hardware.md)

## Staking Process

### Step 1: Prepare Your Tokens

```javascript
// Check ROKO balance
const balance = await rokoToken.balanceOf(validatorAddress);
console.log(`ROKO Balance: ${ethers.utils.formatEther(balance)}`);

// Approve staking contract
const stakingContract = "0xStakingContractAddress";
const amount = ethers.utils.parseEther("10000");
await rokoToken.approve(stakingContract, amount);
```

### Step 2: Register Validator

```javascript
// Register as validator
const validatorRegistration = {
  nodeAddress: "0xYourNodeAddress",
  rewardAddress: "0xYourRewardAddress",
  commissionRate: 1000, // 10% in basis points
  timeAccuracy: 100, // nanoseconds
  hardwareProof: attestationData,
  metadata: {
    name: "My Validator",
    website: "https://myvalidator.com",
    description: "High-precision temporal validator"
  }
};

const tx = await stakingContract.registerValidator(
  validatorRegistration,
  { value: ethers.utils.parseEther("0.1") } // Registration fee
);
```

### Step 3: Stake Tokens

```javascript
// Stake ROKO tokens
const stakeTx = await stakingContract.stake(
  ethers.utils.parseEther("10000"),
  {
    lockDuration: 180, // days
    autoCompound: true,
    delegationEnabled: true
  }
);

// Wait for confirmation
const receipt = await stakeTx.wait();
console.log(`Staked at block: ${receipt.blockNumber}`);
```

### Step 4: Activate Validator

```bash
# Configure node with staking details
roko-node validator activate \
  --stake-tx ${STAKE_TX_HASH} \
  --signing-key /path/to/key.json

# Verify activation
roko-node validator status
# Output:
# Status: ACTIVE
# Stake: 10,000 ROKO
# Commission: 10%
# Uptime: 100%
# Time Accuracy: 87ns
```

## Reward Calculation

### Base Rewards Formula

```python
# Daily rewards calculation
def calculate_daily_rewards(stake, performance):
    base_rate = 0.0005  # 0.05% daily (18.25% APY)
    
    # Performance multipliers
    uptime_multiplier = min(performance['uptime'] / 0.99, 1.0)
    accuracy_multiplier = 1.0 + (100 - performance['time_accuracy_ns']) / 1000
    mev_multiplier = 1.0 + performance['mev_prevented'] * 0.001
    
    # Calculate rewards
    daily_rewards = stake * base_rate * uptime_multiplier * accuracy_multiplier * mev_multiplier
    
    return daily_rewards

# Example calculation
performance = {
    'uptime': 0.999,  # 99.9%
    'time_accuracy_ns': 50,  # 50ns
    'mev_prevented': 100  # 100 MEV attempts blocked
}

daily = calculate_daily_rewards(10000, performance)
print(f"Daily rewards: {daily:.2f} ROKO")
print(f"Annual rewards: {daily * 365:.2f} ROKO")
print(f"APY: {(daily * 365 / 10000) * 100:.2f}%")
```

### Additional Revenue Streams

```yaml
Transaction Fees:
  Rate: 0.01% of transaction value
  Distribution: 70% to validator, 30% to treasury
  
Attestation Fees:
  Rate: 0.001 ROKO per attestation
  Frequency: ~1000 attestations/day
  
MEV Prevention Rewards:
  Rate: 50% of prevented MEV value
  Average: 5-10 ROKO/day
  
Delegation Commission:
  Rate: Set by validator (5-20%)
  Applied to: Delegated stake rewards
```

## Delegation System

### For Delegators

```javascript
// Delegate to a validator
const delegation = await stakingContract.delegate(
  validatorAddress,
  ethers.utils.parseEther("1000"),
  {
    lockDuration: 30, // days
    autoCompound: true
  }
);

// Check delegation status
const delegationInfo = await stakingContract.getDelegation(
  delegatorAddress,
  validatorAddress
);

console.log(`
Delegation Info:
  Amount: ${delegationInfo.amount}
  Rewards Earned: ${delegationInfo.rewards}
  Lock Expires: ${new Date(delegationInfo.unlockTime * 1000)}
`);
```

### For Validators

```javascript
// Update commission rate
await stakingContract.updateCommission(1500); // 15%

// View total delegated stake
const totalDelegated = await stakingContract.getTotalDelegated(validatorAddress);
console.log(`Total Delegated: ${ethers.utils.formatEther(totalDelegated)} ROKO`);

// Claim delegation commissions
const commissions = await stakingContract.claimCommissions();
```

## Slashing Conditions

### Slashing Events

| Violation | Penalty | Grace Period |
|-----------|---------|-------------|
| Downtime > 4 hours | 0.1% of stake | 1 hour warning |
| Time drift > 10μs | 0.5% of stake | 10 minute warning |
| Double signing | 5% of stake | Immediate |
| Invalid attestation | 1% of stake | Immediate |
| Malicious behavior | 100% of stake | Immediate |

### Slashing Protection

```bash
# Enable slashing protection
roko-node validator protect \
  --enable-double-sign-protection \
  --max-time-drift 1000 \
  --backup-signer /path/to/backup.key

# Monitor slashing risks
roko-node validator risks
# Output:
# Time Drift: 87ns (SAFE)
# Missed Blocks: 0 (SAFE)
# Double Sign Protection: ENABLED
# Backup Signer: CONFIGURED
```

## Compound Staking

### Auto-Compounding

```javascript
// Enable auto-compounding
await stakingContract.setAutoCompound(true, {
  minAmount: ethers.utils.parseEther("10"),
  frequency: 86400, // daily
  gasLimit: 200000
});

// Manual compound
await stakingContract.compound();

// Calculate compound APY
function calculateCompoundAPY(apr, compoundFrequency) {
  const rate = apr / compoundFrequency;
  const apy = Math.pow(1 + rate, compoundFrequency) - 1;
  return apy * 100;
}

const apy = calculateCompoundAPY(0.1825, 365); // 18.25% APR, daily compound
console.log(`Compound APY: ${apy.toFixed(2)}%`); // ~20.02%
```

## Unstaking Process

### Initiate Unstaking

```javascript
// Request unstaking
const unstakeTx = await stakingContract.requestUnstake(
  ethers.utils.parseEther("5000") // Partial unstake
);

// Check unbonding period
const unbondingInfo = await stakingContract.getUnbonding(validatorAddress);
console.log(`
Unbonding:
  Amount: ${unbondingInfo.amount}
  Available: ${new Date(unbondingInfo.availableAt * 1000)}
  Status: ${unbondingInfo.status}
`);
```

### Unbonding Period

- Standard: 21 days
- Emergency (with penalty): Immediate with 10% slash
- Partial unstake: Minimum 1,000 ROKO must remain

## Tax Reporting

### Export Staking Data

```bash
# Generate tax report
roko-node validator tax-report \
  --year 2024 \
  --format csv \
  --output staking_rewards_2024.csv

# Report includes:
# - Daily staking rewards
# - Transaction fees earned
# - Commission income
# - Slashing events
# - Cost basis tracking
```

## Best Practices

### 1. Maximize Rewards
- Maintain >99.9% uptime
- Achieve <100ns time accuracy
- Enable auto-compounding
- Optimize commission rate (10-15%)

### 2. Risk Management
- Use hardware key management
- Set up redundant nodes
- Monitor slashing conditions
- Maintain emergency funds

### 3. Operational Excellence
- Regular security audits
- Automated monitoring
- Disaster recovery plan
- Community engagement

## Staking Analytics

### Performance Dashboard

```python
# monitor_staking.py
import requests
import json
from datetime import datetime, timedelta

class StakingMonitor:
    def __init__(self, validator_address):
        self.validator = validator_address
        self.api_url = "https://api.roko.network/v1"
    
    def get_staking_metrics(self):
        response = requests.get(f"{self.api_url}/validator/{self.validator}/metrics")
        return response.json()
    
    def calculate_roi(self):
        metrics = self.get_staking_metrics()
        
        initial_stake = metrics['stake']
        total_rewards = metrics['total_rewards']
        days_staking = metrics['days_active']
        
        daily_return = total_rewards / days_staking
        annual_return = daily_return * 365
        roi = (annual_return / initial_stake) * 100
        
        return {
            'daily_rewards': daily_return,
            'monthly_rewards': daily_return * 30,
            'annual_rewards': annual_return,
            'apy': roi,
            'breakeven_days': initial_stake / daily_return
        }
    
    def generate_report(self):
        roi = self.calculate_roi()
        metrics = self.get_staking_metrics()
        
        report = f"""
        ROKO Validator Staking Report
        ============================
        Validator: {self.validator[:8]}...{self.validator[-6:]}
        Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}
        
        Staking Metrics:
        ---------------
        Current Stake: {metrics['stake']:,.2f} ROKO
        Total Rewards: {metrics['total_rewards']:,.2f} ROKO
        Uptime: {metrics['uptime']:.2%}
        Time Accuracy: {metrics['time_accuracy_ns']}ns
        
        Returns:
        --------
        Daily: {roi['daily_rewards']:.2f} ROKO
        Monthly: {roi['monthly_rewards']:.2f} ROKO
        Annual: {roi['annual_rewards']:.2f} ROKO
        APY: {roi['apy']:.2f}%
        
        Break-even: {roi['breakeven_days']:.0f} days
        """
        
        return report

# Usage
monitor = StakingMonitor("0xYourValidatorAddress")
print(monitor.generate_report())
```

## FAQ

### Q: Can I stake without running a validator?
Yes, you can delegate your ROKO to existing validators and earn rewards minus their commission.

### Q: What happens during maintenance?
Use a backup validator or notify delegators. Short downtimes (<1 hour) don't trigger slashing.

### Q: Can I change my commission rate?
Yes, but changes take effect after a 7-day notice period to protect delegators.

### Q: Is staking taxable?
Staking rewards are typically taxable income. Consult a tax professional for your jurisdiction.

## Next Steps

1. **Setup pwROKO** → [pwROKO Guide](./pwroko.md)
2. **Advanced Staking** → [ROKO Staking](./roko-staking.md)
3. **Monitor Performance** → [Monitoring Guide](./monitoring.md)
4. **Join Validator Chat** → [Discord](https://discord.gg/roko-validators)

---

*For staking support: staking@roko.network*