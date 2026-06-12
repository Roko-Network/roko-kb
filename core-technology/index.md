# Core Technology

Every chain has a clock. Almost none of them can prove it. Roko is a Substrate chain with full Frontier EVM compatibility that treats time as something the network *measures* — validators run a peer-to-peer time mesh, every transaction receives a signed temporal receipt with a nanosecond timestamp, and the network's agreed clock is readable from Solidity and JSON-RPC without a third-party oracle. <!-- fact:CC-01,CC-13,CC-17,CC-18,CC-20 -->

This section explains how that works, layer by layer: the time mesh under the chain, the consensus rules on top of it, and the data types and enforcement mechanics builders actually touch.

## In This Section

### [Temporal Infrastructure](./temporal-infrastructure.md)
The PTP Squared validator time mesh: how nodes probe each other over libp2p, score peers statistically, converge on a shared clock, and classify their own time sources into quality tiers. <!-- fact:CC-13,CC-16 -->

### [Consensus Mechanism](./consensus.md)
BABE block production and GRANDPA finality, with Proof of Accurate Time (PoAT) as a consensus *modifier*: on-chain time-quality tracking that is designed to influence validator eligibility and rewards. <!-- fact:CC-02,CC-32 -->

### [Temporal Transactions](./temporal-transactions.md)
Signed temporal receipts, the 15-second inclusion deadline enforced at block import, and the fee-priority timestamping queue that assigns canonical timestamps. <!-- fact:CC-17,CC-19 -->

### [NanoMoment](./nanomoment.md)
The u128 nanosecond timestamp type used across receipts, block metadata, RPCs, and the EVM temporal precompile. <!-- fact:CC-18,CC-23 -->

### Related pages
[MEV Prevention](./mev-prevention.md) covers what deterministic ordering does and does not remove. [Network Architecture](./network-architecture.md) and [Validator Requirements](./validator-requirements.md) cover topology and what it takes to run a node.

## Technical Specifications

| Feature | Specification |
|---------|--------------|
| Base stack | Polkadot SDK `release-polkadot-v1.13.0` + Frontier EVM (ChainSupport fork) |
| Consensus | BABE (block production) + GRANDPA (finality), PoAT time mesh as modifier |
| Block time | Testnet dev chain: 2 s today; 6 s is the production-testnet target (M-19). Mainnet runtime: 3 s |
| Timestamp type | NanoMoment — u128 nanoseconds since the Unix epoch |
| Inclusion deadline | 15 s default per receipted transaction, enforced at block import |
| Time mesh | libp2p notification protocol `/roko/timesync/1` |
| EVM Chain ID | 442 (testnet); mainnet TBD |
| Native token | ROKO, 18 decimals, Ethereum-style 20-byte accounts |

<!-- fact:CC-01,CC-02,CC-05,CC-04,CC-18,CC-17,CC-13,CC-06,EVM-04,CC-08,CC-09 -->

## Current Status

The network is in a gated testnet phase. A mainnet runtime exists in the codebase, but no production mainnet genesis has been cut and the mainnet EVM chain ID is not yet assigned. Time-quality offences are detected and recorded on-chain, but slashing enforcement is currently disabled in both compiled runtimes — a deliberate testnet posture you should know about before relying on enforcement guarantees. <!-- fact:CC-07,EVM-04,CC-15 -->
