# Rewards

## Validator Reward System

### Reward Components

#### Base Rewards
- **Block Rewards**: 2 ROKO per block
- **Transaction Fees**: 100% to block producer
- **Staking APY**: 8-12% annually

#### Performance Bonuses
| Metric | Requirement | Bonus |
|--------|------------|-------|
| Uptime | >99.9% | +2% APY |
| Time Sync | <10ns drift | +1% APY |
| Block Speed | <100ms | +0.5% APY |
| Attestations | 100% | +0.5% APY |

### Reward Distribution
```
Block Reward (2 ROKO)
├── Validator (40%): 0.8 ROKO
├── Delegators (50%): 1.0 ROKO
└── Treasury (10%): 0.2 ROKO
```

### Claiming Rewards
```bash
# Check accumulated rewards
roko-node query distribution rewards $(roko-node keys show validator -a)

# Claim all rewards
roko-node tx distribution withdraw-all-rewards --from validator

# Auto-compound rewards
roko-node tx distribution set-withdraw-addr $(roko-node keys show validator -a)
```

### Reward Schedule
- **Distribution**: Every block
- **Vesting**: Immediate
- **Compounding**: Optional auto-stake

---

> **Earn from precision**: Higher accuracy means higher rewards.