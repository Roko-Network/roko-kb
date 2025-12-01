# ROKO Staking

Comprehensive guide to ROKO token staking, including advanced strategies, optimization techniques, and maximizing returns through the ROKO Network ecosystem.

## ROKO Token Overview

### Token Specifications
```yaml
Token Name: ROKO
Symbol: ROKO
Decimals: 18
Total Supply: 1,000,000,000
Circulating Supply: ~400,000,000
Contract: 0xROKO...TOKEN
Chain: ROKO Network Mainnet
```

### Token Utility
1. **Validator Staking**: Secure the network
2. **Governance**: Vote on protocol changes
3. **Transaction Fees**: Pay for network usage
4. **Time Attestation**: Access temporal services
5. **DeFi Collateral**: Use in lending protocols

## Staking Mechanisms

### Direct Validator Staking

```javascript
// Direct staking to become a validator
const { ethers } = require('ethers');

const STAKING_CONTRACT = '0xStakingContract';
const stakingABI = [...]; // Staking contract ABI

async function stakeAsValidator(amount, duration) {
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.roko.network');
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const stakingContract = new ethers.Contract(
    STAKING_CONTRACT,
    stakingABI,
    signer
  );
  
  // Approve ROKO transfer
  const rokoToken = new ethers.Contract(ROKO_TOKEN, ERC20_ABI, signer);
  await rokoToken.approve(STAKING_CONTRACT, amount);
  
  // Stake tokens
  const tx = await stakingContract.stakeValidator({
    amount: amount,
    duration: duration,
    nodeOperator: signer.address,
    commissionRate: 1000, // 10% in basis points
    metadata: {
      moniker: "MyValidator",
      website: "https://myvalidator.com",
      details: "High-performance temporal validator"
    }
  });
  
  const receipt = await tx.wait();
  console.log(`Staked ${ethers.utils.formatEther(amount)} ROKO`);
  console.log(`Validator activated at block ${receipt.blockNumber}`);
  
  return receipt;
}

// Stake 10,000 ROKO for 180 days
stakeAsValidator(
  ethers.utils.parseEther("10000"),
  180 * 24 * 60 * 60 // seconds
);
```

### Delegated Staking

```javascript
// Delegate ROKO to existing validators
async function delegateStake(validatorAddress, amount) {
  const stakingContract = new ethers.Contract(
    STAKING_CONTRACT,
    stakingABI,
    signer
  );
  
  // Get validator info
  const validatorInfo = await stakingContract.getValidator(validatorAddress);
  console.log(`
Validator Info:
    Name: ${validatorInfo.moniker}
    Commission: ${validatorInfo.commission / 100}%
    Total Stake: ${ethers.utils.formatEther(validatorInfo.totalStake)} ROKO
    Performance: ${validatorInfo.performance}%
  `);
  
  // Delegate stake
  const delegation = await stakingContract.delegate(
    validatorAddress,
    amount,
    {
      autoCompound: true,
      lockDuration: 30 * 24 * 60 * 60 // 30 days
    }
  );
  
  await delegation.wait();
  console.log(`Successfully delegated ${ethers.utils.formatEther(amount)} ROKO`);
}

// Delegate 1,000 ROKO
delegateStake("0xValidatorAddress", ethers.utils.parseEther("1000"));
```

## Staking Pools

### Liquid Staking

```solidity
// Liquid staking pool contract
contract LiquidStaking {
    mapping(address => uint256) public staked;
    mapping(address => uint256) public stROKO;
    
    uint256 public totalStaked;
    uint256 public exchangeRate = 1e18; // 1:1 initially
    
    function stake(uint256 amount) external {
        require(amount >= 100 * 1e18, "Minimum 100 ROKO");
        
        // Transfer ROKO
        rokoToken.transferFrom(msg.sender, address(this), amount);
        
        // Mint stROKO
        uint256 stRokoAmount = amount * 1e18 / exchangeRate;
        stROKO[msg.sender] += stRokoAmount;
        staked[msg.sender] += amount;
        totalStaked += amount;
        
        // Delegate to validators
        _distributeToValidators(amount);
        
        emit Staked(msg.sender, amount, stRokoAmount);
    }
    
    function unstake(uint256 stRokoAmount) external {
        require(stROKO[msg.sender] >= stRokoAmount, "Insufficient stROKO");
        
        // Calculate ROKO amount
        uint256 rokoAmount = stRokoAmount * exchangeRate / 1e18;
        
        // Burn stROKO
        stROKO[msg.sender] -= stRokoAmount;
        
        // Queue withdrawal
        withdrawalQueue.push(Withdrawal({
            user: msg.sender,
            amount: rokoAmount,
            timestamp: block.timestamp,
            executed: false
        }));
        
        emit UnstakeQueued(msg.sender, rokoAmount);
    }
}
```

### Staking Derivatives

```javascript
// Using stROKO in DeFi
const stRokoContract = new ethers.Contract(STROKO_ADDRESS, STROKO_ABI, signer);

// Get stROKO balance
const balance = await stRokoContract.balanceOf(userAddress);
console.log(`stROKO Balance: ${ethers.utils.formatEther(balance)}`);

// Use stROKO as collateral
const lendingPool = new ethers.Contract(LENDING_POOL, LENDING_ABI, signer);
await stRokoContract.approve(LENDING_POOL, balance);

const borrow = await lendingPool.borrow(
  STROKO_ADDRESS, // Collateral
  USDC_ADDRESS,   // Borrow asset
  ethers.utils.parseUnits("1000", 6), // Borrow 1000 USDC
  {
    interestRateMode: 2, // Variable rate
    referralCode: 0
  }
);
```

## Reward Distribution

### Reward Calculation Model

```python
# ROKO staking reward calculator
import numpy as np
from datetime import datetime, timedelta

class StakingRewards:
    def __init__(self, stake_amount, validator_performance):
        self.stake = stake_amount
        self.performance = validator_performance
        self.base_apr = 0.15  # 15% base APR
        
    def calculate_rewards(self, days):
        """Calculate staking rewards for given period"""
        
        # Base rewards
        daily_rate = self.base_apr / 365
        base_rewards = self.stake * daily_rate * days
        
        # Performance bonus (up to 50% extra)
        performance_multiplier = 1 + (self.performance / 100 * 0.5)
        
        # Time bonus (longer stake = higher rewards)
        time_multiplier = self._get_time_multiplier(days)
        
        # Network participation bonus
        network_bonus = self._get_network_bonus()
        
        total_rewards = base_rewards * performance_multiplier * time_multiplier + network_bonus
        
        return {
            'base_rewards': base_rewards,
            'performance_bonus': base_rewards * (performance_multiplier - 1),
            'time_bonus': base_rewards * (time_multiplier - 1),
            'network_bonus': network_bonus,
            'total_rewards': total_rewards,
            'effective_apr': (total_rewards / self.stake) * (365 / days)
        }
    
    def _get_time_multiplier(self, days):
        """Calculate time-based multiplier"""
        if days < 30:
            return 1.0
        elif days < 90:
            return 1.1
        elif days < 180:
            return 1.2
        elif days < 365:
            return 1.3
        else:
            return 1.5
    
    def _get_network_bonus(self):
        """Calculate network participation bonus"""
        # Bonus for early validators
        if self.stake >= 100000:  # Whale bonus
            return self.stake * 0.002  # 0.2% bonus
        elif self.stake >= 10000:  # Standard validator
            return self.stake * 0.001  # 0.1% bonus
        else:
            return 0

# Example calculation
calculator = StakingRewards(
    stake_amount=10000,  # 10,000 ROKO
    validator_performance=95  # 95% uptime
)

rewards = calculator.calculate_rewards(180)  # 6 months
print(f"""
Staking Rewards (180 days):
  Base Rewards: {rewards['base_rewards']:.2f} ROKO
  Performance Bonus: {rewards['performance_bonus']:.2f} ROKO
  Time Bonus: {rewards['time_bonus']:.2f} ROKO
  Network Bonus: {rewards['network_bonus']:.2f} ROKO
  Total Rewards: {rewards['total_rewards']:.2f} ROKO
  Effective APR: {rewards['effective_apr']*100:.2f}%
""")
```

### Claiming Rewards

```javascript
// Claim accumulated rewards
async function claimRewards() {
  const stakingContract = new ethers.Contract(
    STAKING_CONTRACT,
    stakingABI,
    signer
  );
  
  // Check pending rewards
  const pending = await stakingContract.pendingRewards(userAddress);
  console.log(`Pending Rewards: ${ethers.utils.formatEther(pending)} ROKO`);
  
  // Claim rewards
  const tx = await stakingContract.claimRewards({
    compound: false, // Don't auto-restake
    recipient: userAddress
  });
  
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === 'RewardsClaimed');
  
  console.log(`Claimed: ${ethers.utils.formatEther(event.args.amount)} ROKO`);
  
  return event.args.amount;
}

// Auto-compound rewards
async function compoundRewards() {
  const tx = await stakingContract.claimRewards({
    compound: true,
    minCompound: ethers.utils.parseEther("10") // Min 10 ROKO
  });
  
  await tx.wait();
  console.log("Rewards compounded successfully");
}
```

## Advanced Strategies

### Yield Optimization

```typescript
class YieldOptimizer {
  private strategies: Map<string, Strategy> = new Map();
  
  constructor(private rokoAmount: BigNumber) {
    this.initStrategies();
  }
  
  private initStrategies() {
    // Pure staking
    this.strategies.set('pure_staking', {
      name: 'Pure Staking',
      apy: 15,
      risk: 'low',
      liquidity: 'locked',
      execute: async () => this.pureStaking()
    });
    
    // Liquid staking + lending
    this.strategies.set('liquid_lending', {
      name: 'Liquid Staking + Lending',
      apy: 18,
      risk: 'medium',
      liquidity: 'high',
      execute: async () => this.liquidLending()
    });
    
    // Validator + LP provision
    this.strategies.set('validator_lp', {
      name: 'Validator + LP',
      apy: 22,
      risk: 'high',
      liquidity: 'medium',
      execute: async () => this.validatorLP()
    });
  }
  
  async findOptimalStrategy(riskTolerance: string) {
    let bestStrategy = null;
    let maxApy = 0;
    
    for (const [key, strategy] of this.strategies) {
      if (this.matchesRiskProfile(strategy.risk, riskTolerance)) {
        if (strategy.apy > maxApy) {
          maxApy = strategy.apy;
          bestStrategy = strategy;
        }
      }
    }
    
    return bestStrategy;
  }
  
  private async pureStaking() {
    // Implement pure staking logic
    console.log('Executing pure staking strategy');
  }
  
  private async liquidLending() {
    // Implement liquid staking + lending
    console.log('Executing liquid staking + lending strategy');
  }
  
  private async validatorLP() {
    // Implement validator + LP strategy
    console.log('Executing validator + LP provision strategy');
  }
}

// Use optimizer
const optimizer = new YieldOptimizer(ethers.utils.parseEther("10000"));
const strategy = await optimizer.findOptimalStrategy('medium');
console.log(`Recommended: ${strategy.name} (${strategy.apy}% APY)`);
await strategy.execute();
```

### Cross-Chain Staking

```javascript
// Bridge and stake on other chains
const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, signer);

// Bridge ROKO to Ethereum
const bridgeTx = await bridgeContract.bridge(
  ethers.utils.parseEther("1000"),
  1, // Ethereum chain ID
  userAddress,
  {
    value: ethers.utils.parseEther("0.01") // Bridge fee
  }
);

await bridgeTx.wait();
console.log("ROKO bridged to Ethereum");

// Stake on Ethereum for additional rewards
const ethStaking = new ethers.Contract(
  ETH_STAKING_ADDRESS,
  STAKING_ABI,
  ethSigner
);

await ethStaking.stake(
  ethers.utils.parseEther("1000"),
  { lockDuration: 90 * 24 * 60 * 60 }
);
```

## Risk Management

### Diversification Strategy

```python
# Portfolio allocation optimizer
from scipy.optimize import minimize
import numpy as np

def optimize_staking_portfolio(total_roko, risk_tolerance):
    """
    Optimize ROKO allocation across different staking options
    """
    
    # Staking options: [Validator, Liquid, LP, Lending]
    expected_returns = np.array([0.15, 0.12, 0.25, 0.18])
    risks = np.array([0.05, 0.03, 0.15, 0.08])
    
    # Constraints
    constraints = [
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Sum to 100%
        {'type': 'ineq', 'fun': lambda x: x}  # Non-negative
    ]
    
    # Bounds (min 10% in any position if allocated)
    bounds = [(0.1, 0.6) for _ in range(4)]
    
    # Objective: Maximize Sharpe ratio
    def objective(weights):
        portfolio_return = np.dot(weights, expected_returns)
        portfolio_risk = np.sqrt(np.dot(weights**2, risks**2))
        sharpe_ratio = portfolio_return / portfolio_risk
        return -sharpe_ratio  # Minimize negative Sharpe
    
    # Initial guess
    x0 = np.array([0.25, 0.25, 0.25, 0.25])
    
    # Optimize
    result = minimize(objective, x0, method='SLSQP', 
                     bounds=bounds, constraints=constraints)
    
    allocation = result.x * total_roko
    
    return {
        'validator': allocation[0],
        'liquid': allocation[1],
        'lp_provision': allocation[2],
        'lending': allocation[3],
        'expected_return': np.dot(result.x, expected_returns),
        'portfolio_risk': np.sqrt(np.dot(result.x**2, risks**2))
    }

# Example allocation
portfolio = optimize_staking_portfolio(10000, 'medium')
print(f"""
Optimal ROKO Allocation:
  Validator Staking: {portfolio['validator']:.0f} ROKO
  Liquid Staking: {portfolio['liquid']:.0f} ROKO
  LP Provision: {portfolio['lp_provision']:.0f} ROKO
  Lending: {portfolio['lending']:.0f} ROKO
  
  Expected Return: {portfolio['expected_return']*100:.1f}%
  Portfolio Risk: {portfolio['portfolio_risk']*100:.1f}%
""")
```

## Monitoring Tools

### Dashboard Integration

```javascript
// Real-time staking dashboard
class StakingDashboard {
  constructor(provider) {
    this.provider = provider;
    this.contracts = this.initContracts();
  }
  
  async getStakingMetrics(address) {
    const metrics = await Promise.all([
      this.getTotalStaked(address),
      this.getPendingRewards(address),
      this.getValidatorStatus(address),
      this.getAPY(),
      this.getSlashingRisk(address)
    ]);
    
    return {
      totalStaked: metrics[0],
      pendingRewards: metrics[1],
      validatorStatus: metrics[2],
      currentAPY: metrics[3],
      slashingRisk: metrics[4]
    };
  }
  
  async displayDashboard(address) {
    const metrics = await this.getStakingMetrics(address);
    
    console.log(`
╔════════════════════════════════════════╗
║         ROKO STAKING DASHBOARD         ║
╠════════════════════════════════════════╣
║ Total Staked: ${metrics.totalStaked.toFixed(2)} ROKO
║ Pending Rewards: ${metrics.pendingRewards.toFixed(2)} ROKO
║ Validator Status: ${metrics.validatorStatus}
║ Current APY: ${metrics.currentAPY.toFixed(2)}%
║ Slashing Risk: ${metrics.slashingRisk}
╚════════════════════════════════════════╝
    `);
  }
}

// Use dashboard
const dashboard = new StakingDashboard(provider);
await dashboard.displayDashboard(userAddress);
```

## Migration Guide

### From ETH 2.0 Staking

```javascript
// Migrate from ETH 2.0 to ROKO staking
const migration = await migrationContract.migrateFromETH({
  ethValidatorPubkey: "0x...",
  withdrawalCredentials: "0x...",
  signature: migrationSignature,
  targetValidator: rokoValidatorAddress
});

console.log(`
Migration Summary:
  ETH Staked: 32 ETH
  ROKO Received: ${migration.rokoAmount} ROKO
  Bonus: ${migration.bonusAmount} ROKO
  New Validator: ${migration.validatorAddress}
`);
```

## Next Steps

1. **Setup Validator** → [Validator Guide](./getting-started.md)
2. **Optimize with pwROKO** → [pwROKO Mechanics](./pwroko.md)
3. **Monitor Performance** → [Monitoring](./monitoring.md)
4. **Join Community** → [Discord](https://discord.gg/roko)

---

*For staking support: staking@roko.network*