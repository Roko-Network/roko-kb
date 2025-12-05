# FAQ

## Frequently Asked Questions

---

### General

**What is ROKO?**

A blockchain where time is a first-class primitive. Hardware-attested timestamps at nanosecond precision. Transactions ordered by when they were signed, not when validators feel like processing them. MEV eliminated at the protocol level.

**How is ROKO different from other blockchains?**

Most chains let block producers decide transaction order. That's MEV - $1 billion extracted annually from users through front-running and sandwich attacks. ROKO removes that power. Time cards stamp transactions at signing. Order is determined by physics, not economics.

**When can I use it?**

Testnet launches Q1 2025. Mainnet targeted for summer 2025. Join the testnet to run a validator, build applications, or just explore temporal transactions.

---

### Technology

**What is a NanoMoment?**

A 128-bit timestamp. Nanoseconds since Unix epoch. Precise enough to order two transactions signed a billionth of a second apart. Large enough to keep counting until the heat death of the universe.

**How does temporal consensus work?**

Validators run OCP TAP time cards synchronized via IEEE 1588 PTP and GPS. Every 150ms they broadcast signed time beacons. Blocks include beacon proofs - cryptographic evidence of when they were produced. Transactions carry their own beacon proofs from signing time.

**What hardware do validators need?**

OCP TAP 2.0 time card. GPS antenna. 16+ CPU cores. 32GB ECC RAM. 2TB NVMe. Standard server hardware plus precision timing equipment. The time card is the differentiator.

**What's a time beacon?**

A signed timestamp broadcast by validators every 150ms. Contains the validator's current time, sequence number, and epoch randomness. Wallets collect beacons when signing transactions to prove when the signature happened.

---

### MEV & Trading

**How does ROKO prevent front-running?**

You sign a transaction at time T. That timestamp is hardware-attested and embedded in the transaction. An attacker sees your transaction and wants to front-run. They sign at T+delta. Their transaction executes after yours. Always. Math doesn't care about gas prices.

**What about sandwich attacks?**

Impossible. Sandwich requires inserting transactions before and after yours. Can't insert before - that timestamp already happened. Can't forge earlier beacon proofs - would need to compromise multiple validators. The attack geometry doesn't exist.

**Does this help DeFi?**

DEXs become fair. Two swaps at the same price execute in signing order. Liquidations go to whoever detected the condition first, not whoever bribed the most gas. AMMs stop being hunting grounds.

---

### Validators & Staking

**How much do I need to stake?**

32,000 ROKO minimum. Locked for 180 days. This is collateral - misbehave and lose up to 50%.

**What are the returns?**

8-15% APY depending on performance. Base rewards for block production. Bonuses for uptime and temporal accuracy. Slashing for drift or downtime.

**Can I run a validator at home?**

Technically yes. Practically challenging. You need a clear GPS sky view for the antenna. Stable power and network. 99.5% uptime requirement. Most validators run in datacenters.

---

### Development

**Is ROKO EVM compatible?**

Yes. Forked Frontier pallet brings temporal ordering to Solidity contracts. Deploy existing contracts, get MEV protection for free. Access temporal primitives through precompiles.

**How do I build on ROKO?**

Standard Substrate/EVM development. Additional temporal APIs for time-sensitive applications. Wallets need beacon subscription for Type 3 temporal transactions. SDKs coming for major languages.

**What's the block time?**

2-3 seconds to finality via GRANDPA. Beacon interval is 150ms. Transactions ordered within blocks by their signing NanoMoment.

---

### Network & Timeline

**When is testnet?**

Q1 2025. Public testnet with faucet tokens. Run validators, deploy contracts, test temporal features.

**When is mainnet?**

Summer 2025 target. Dependent on testnet performance and security audits.

**How do I stay updated?**

Documentation at docs.roko.network. Announcements via official channels. Testnet access opens to early validators first.

---

## See Also

- [Introduction](../getting-started/introduction.md)
- [Temporal Blockchain](../getting-started/temporal-blockchain.md)
- [Validator Requirements](../core-technology/validator-requirements.md)
