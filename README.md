# Welcome to ROKO Network

## The Temporal Layer for Web3

Time was always the soft spot at the bottom of the stack. Every chain inherits its clock from the block producer — a number they *suggest*, a tolerance everyone agrees to pretend is truth. Whoever controls the ordering controls the outcome: the chronarchy. ROKO ends that arrangement, not with a slogan but with a primitive.

## What ROKO Is

ROKO is an EVM Layer 1 built on the Polkadot SDK (release-polkadot-v1.13.0) with Frontier for full Ethereum compatibility, running BABE block production and GRANDPA finality. <!-- fact:CC-01,CC-02 --> On top of that foundation sits **Proof of Accurate Time (PoAT)** — a physics-anchored consensus modifier where validator time quality influences block production eligibility, finality votes, and rewards. <!-- fact:PAL-29,CC-32 -->

Under PoAT, validators become meshheads: each runs the PTP+Squared time mesh, a native peer-to-peer time-sync layer over libp2p that measures inter-validator clock offsets, scores reputation statistically, and converges on a single **mesh consensus time** the whole network agrees on. <!-- fact:CC-13 --> Validators self-classify their physical time source — Timebeat PTP daemon, chrony, or GNSS-PPS hardware — into Anchor, Standard, or Minimal tiers, with a measured root distance to UTC in nanoseconds. <!-- fact:CC-16 --> Time the network *measures* and holds its own to: atomictruth, on a chain your Solidity already speaks.

That clock does real consensus work. Every transaction receives a nanosecond-precision canonical timestamp and an ECDSA-signed **temporal receipt** at pool admission; honest validators reject any block that omits a receipted transaction past its 15-second inclusion deadline — a censorship check, not a speed claim. <!-- fact:CC-17,CC-18 --> Ordering is **fee-priority**: a deterministic, tamper-evident rule fixes order at receipt, so higher-fee transactions get earlier canonical timestamps and there is no private reordering auction. Fees still set priority — transparently, at the protocol level — and silent reordering or dropping by the producer is detectable and rejected. <!-- fact:CC-19,CC-17 -->

## Why Builders Care

Your Ethereum tooling works unmodified. MetaMask, Hardhat, and ethers.js connect over the standard `eth_*` JSON-RPC namespaces; accounts are native 20-byte Ethereum addresses with no Substrate↔EVM translation; fees follow an EIP-1559-style model with a 1 gwei default base fee. <!-- fact:EVM-06,EVM-21,EVM-20 --> Testnet EVM Chain ID is 442, native token ROKO with 18 decimals. <!-- fact:CC-06,CC-08 -->

The temporal layer is purely additive. `block.timestamp` stays standard seconds, so existing contracts behave exactly as on Ethereum. <!-- fact:EVM-25 --> When you want the nanoseconds, they're one call away: a `temporal_*` JSON-RPC namespace (14 methods, same port as everything else) for consensus time, transaction timestamps, and mesh state — and a Temporal precompile at `0x...0600` your contracts can call directly, starting with `getConsensusTime() → uint128`. <!-- fact:EVM-08,EVM-07,CC-23 --> Native ROKO wraps into pwROKO, an ERC20-style token behind the `0x...0500` precompile, used for validator bonding. <!-- fact:CC-24,CC-25 -->

## Honest Status

The public testnet launch is approaching; the network is pre-public today. The testnet chain currently runs 2-second blocks, with 6 seconds as the production-testnet target; the mainnet runtime is compiled at 3-second blocks, but no mainnet network exists yet and its EVM chain ID is TBD. <!-- fact:CC-05,CC-04,EVM-04 --> Right now you can build the node from source, run a dev chain, and spin up a full 3-validator local network with the live time mesh — and the repo ships a validator compose file already wired to the testnet-v2 bootnode and chain spec, with validator registration currently gated while the network is pre-public. <!-- fact:OPS-30,OPS-11,OPS-27 --> Time-quality violations are detected and recorded on-chain, but slashing enforcement is currently disabled while the mesh matures. <!-- fact:CC-14,CC-15 -->

We'd rather show you than tell you.

## Where to Go Next

- **[Getting Started](getting-started/introduction.md)** — what a temporal blockchain is and how to make your first connection
- **[Core Technology](core-technology/index.md)** — the time mesh, temporal transactions, consensus, and validator requirements

**Built with Temporal Precision** ⏱️

ROKO Network © 2026 |
