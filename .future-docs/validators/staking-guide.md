# Staking Guide

## Validator Staking on ROKO

### Staking Requirements
- **Minimum Stake**: 10,000 ROKO
- **Lock Period**: 21 days
- **Slashing Risk**: Up to 5% for downtime

### Becoming a Validator

#### 1. Check Balance
```bash
roko-node query bank balances $(roko-node keys show validator -a)
```

#### 2. Create Validator Transaction
```bash
roko-node tx staking create-validator \
  --amount=10000000000uroko \
  --pubkey=$(roko-node tendermint show-validator) \
  --moniker="YourValidator" \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="10000" \
  --from=validator \
  --chain-id=roko-1 \
  --fees=1000uroko
```

### Delegation Commands

#### Delegate to Validator
```bash
roko-node tx staking delegate \
  roko1validator... \
  1000000000uroko \
  --from=wallet
```

#### Withdraw Rewards
```bash
roko-node tx distribution withdraw-rewards \
  roko1validator... \
  --from=validator
```

### Staking Rewards
- **Base APY**: 8-12%
- **Performance Bonus**: +2% for >99.9% uptime
- **Time Sync Bonus**: +1% for <10ns drift

---

> **Stake and earn**: Secure the network, earn temporal rewards.