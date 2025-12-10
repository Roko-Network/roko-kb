# Roko Network Monthly Update

**Month:** March 2025

---

## Executive Summary

March 2025 was a breakthrough month with significant progress on the NPoS pallet, a hardware security vendor hardware security integration, and the time validation mechanism for the Bittensor subnet. The team also received critical intelligence from Bittensor core developers about upcoming features that will impact subnet launch timing.

---

## Major Technical Achievements

### NPoS Pallet Integration
Stalker (Unforkable) achieved significant progress on the Nominated Proof of Stake pallet:
- Rewrote staking process to use EVM memory instead of Substrate memory
- Staking information now accessible to dApps and tooling
- Most unit tests passing with high confidence in implementation
- **Critical Issue:** A dependency library name change in Rust ecosystem broke builds
- Forced unplanned upgrade to newer Substrate dependencies
- Key insight: AI tools ineffective at complex Rust build issues but excel at JavaScript

### Time Validation Mechanism
Brendon completed the proof of concept for time validation:
- Addresses weight copying, delay mining, and miner overfitting issues
- Two-method approach:
  - External API on centralized infrastructure (30% weight)
  - Mean average of miner timing values (70% weight)
- Decision: Focus on timing services only initially, defer AI/ML integration
- Separates concerns between timing subnet and potential GPU orchestration wrapper

### a hardware security vendor Security Integration
Two support sessions with Bob from a hardware security vendor:
- Bootware installation on SCM (Secure Compute Module) devices
- LUKS key management using a hardware security vendor hardware
- A/B partition strategy for safe updates
- Image creation with private/public key pairs
- Confirmed: Encrypted bootware runs without leaving dev mode

---

## Infrastructure Progress

### Distributed Computing Architecture
BigM presented secure CDN network vision:
- Minis Forum mini PCs ($500-1,000 each)
- a hardware security vendor security modules + timing cards
- Bank-level security for distributed network
- Capable of running 70B parameter models per node
- Total developer network cost under $10,000

### AI-Assisted Development Adoption
Team exploring AI coding assistants:
- Mantis (Claude wrapper) for development acceleration
- OpenManus on A100 GPU infrastructure
- Prediction: 6-12 months until most code is AI-written

---

## Bittensor Ecosystem Intelligence

Critical updates from Slice's conversations with core developers:
- **Start Button Feature:** Subnet owners can fully prepare code before launch
- **Exploit Alert:** Subnets above #64 experiencing excess emissions extraction
- **Funding Option:** Const Capital offering loans for subnet registration in exchange for alpha tokens
- **Strategic Decision:** Validator operation deprioritized; subnet ownership is better focus

---

## Partnership Developments

### Greenhouse Automation Integration
- Conversations with former colleague on greenhouse hardware
- Laura-based monitoring with edge nodes
- Potential integration with Roko timing and C2 infrastructure
- NDA being signed for deeper exploration

### Task Bounty Platform
- Integration exploration with contract board project
- Audited smart contracts, seeking $5M funding
- Roko positioned to provide grants for network application developers

### Post-Quantum Cryptography Research
- Discussion of Cosq chip vs a hardware security vendor root of trust
- Key generation combining multiple entropy sources:
  - Hardware RNG chips
  - Oscillators
  - Network statistics
  - Cosmic rays
- Larger keys/datasets approach rather than new algorithms

---

## Key Metrics

| Metric | Status |
|--------|--------|
| NPoS Pallet | 95%+ unit tests passing |
| Time Validation | POC complete |
| a hardware security vendor Integration | Two training sessions completed |
| Mini PC Network | Architecture defined |
| Bittensor Intel | Start button feature incoming |

---

## Challenges & Resolutions

1. **Rust Dependency Breaking Change**
   - Library renamed in ecosystem
   - Resolution: Upgrade to newer Substrate dependencies
   - Lesson: AI tools struggle with complex Rust issues

2. **Subnet Launch Timing**
   - Current day-one rush problematic
   - Resolution: Wait for start button feature

3. **Resource Allocation**
   - A100 GPU utilization question
   - Options: Mining (challenging vs H100s), inference via Spheron/IONet, internal tools

---

## Looking Ahead to April

- Resolve Rust dependency issues in NPoS integration
- Complete time validation code implementation
- Monitor Bittensor start button feature release
- Set up additional a hardware security vendor node via Cloudy Storm
- Continue greenhouse partnership discussions

---

## Team Focus Areas

| Team Member | Primary Focus |
|-------------|---------------|
| Stalker (Unforkable) | NPoS pallet, dependency resolution |
| Brendon | Time validation implementation |
| Manitcor | a hardware security vendor configuration, greenhouse NDA |
| BigM | Secure CDN architecture |
| Slice | Bittensor ecosystem monitoring |
| Team | AI tool adoption for development |
