# Proposal Process

## ROKO Governance Proposals

### Proposal Types

#### Technical Proposals
- Protocol upgrades
- Parameter changes
- Feature additions

#### Economic Proposals
- Fee adjustments
- Reward modifications
- Treasury allocations

#### Emergency Proposals
- Critical fixes
- Security patches
- Immediate parameter changes

### Submission Process

#### 1. Draft Proposal
```bash
roko-node tx gov submit-proposal \
  --title="Reduce Block Time to 500ms" \
  --description="proposal-details.md" \
  --type="ParameterChange" \
  --deposit="1000000000uroko" \
  --from=validator
```

#### 2. Deposit Period
- **Duration**: 48 hours
- **Minimum Deposit**: 10,000 ROKO
- **Refundable**: Yes (if proposal reaches voting)

#### 3. Voting Period
- **Duration**: 7 days
- **Quorum**: 40% of staked ROKO
- **Pass Threshold**: 66.7% Yes votes

### Voting Commands
```bash
# Vote on proposal
roko-node tx gov vote 1 yes --from validator

# Check proposal status
roko-node query gov proposal 1
```

---

> **Shape the future**: Participate in temporal governance.