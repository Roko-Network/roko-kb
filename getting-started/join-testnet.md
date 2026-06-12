# Join the Testnet

This page gets you from zero to a deployed contract on the ROKO testnet, and points node operators at the right entry points. One caveat up front: the endpoints below are the current **testnet-v2 infrastructure** — subject to change or reset as the network evolves. <!-- fact:OPS-12 -->

> **Testnet on-ramp.** Faucet grants and explorer access are currently handled by the team. The deterministic path is Discord: join [discord.gg/roko](https://discord.gg/roko) and post your address, and someone will fund you and point you at the explorer. <!-- fact:OPS-27,TOK-29 -->

## 1. Connect MetaMask

Add the ROKO testnet as a custom network:

| Field | Value |
|---|---|
| Network name | ROKO Testnet |
| RPC URL | `https://roko-testnetv2.ntfork.com` |
| Chain ID | `442` |
| Currency symbol | `ROKO` (18 decimals) |

For WebSocket tooling (polkadot.js, an ethers `WebSocketProvider`), use `wss://roko-testnetv2.ntfork.com` — the same host serves both transports. <!-- fact:OPS-12 -->

Chain ID 442 is set at genesis for all testnet chain specs; the native token is ROKO with 18 decimals and Ethereum-style (`0x...`, 20-byte) accounts — there is no address translation between the Substrate and EVM layers. <!-- fact:CC-06,CC-08,EVM-21 -->

The documented live endpoints are `wss://roko-testnetv2.ntfork.com` (HTTPS on the same host); a self-hosted node serves the same APIs at `http://<host>:9944`. <!-- fact:OPS-12,EVM-28 -->

A mainnet chain ID is not yet assigned — if something claims to be "ROKO mainnet," it isn't ours. <!-- fact:EVM-04 -->

## 2. Get testnet ROKO

Testnet ROKO is distributed through a faucet in the network's admin service: default 100 ROKO per request, hard-capped, with a per-address cooldown and IP rate limiting. Faucet grants currently go through the team rather than an open endpoint: join [discord.gg/roko](https://discord.gg/roko) and post your address to get funded. <!-- fact:TOK-29,OPS-27 -->

## 3. Watch your transactions

A Blockscout-based block explorer (with a Substrate sidecar API) runs against the testnet; its public endpoint has not been published yet. <!-- fact:OPS-14 -->

For temporal data the explorer doesn't show, query the node directly — `temporal_getTransactionTimestamp` accepts either a Substrate extrinsic hash or a native Ethereum transaction hash. <!-- fact:EVM-10 -->

## 4. Deploy a contract

Standard Ethereum tooling works unmodified — the Ethereum RPC surface (`eth_*`, `net_*`, `web3_*`, plus filters, pubsub, and `debug_*`) is served on the single RPC port alongside the Substrate and `temporal_*` APIs. <!-- fact:DOC-10,EVM-06,EVM-07 -->

```bash
# Hardhat example: hardhat.config.js network entry
networks: {
  rokoTestnet: {
    url: "https://roko-testnetv2.ntfork.com",
    chainId: 442,
    accounts: [process.env.PRIVATE_KEY],
  }
}
```

`PRIVATE_KEY` must be a faucet-funded testnet account — without ROKO it can't pay gas to deploy.

Useful parameters: gas is EIP-1559-style with a 1 gwei default base fee; the block gas limit is 75,000,000; blocks currently arrive every 2 seconds (the production-testnet target is 6 seconds; mainnet runtime is compiled at 3). Contract deployment is enabled at genesis, behind a governance-controllable switch. <!-- fact:EVM-20,EVM-19,CC-05,EVM-23 -->

Two ROKO-specific things worth knowing as a builder:

- **The temporal precompile** at `0x0000000000000000000000000000000000000600` gives Solidity direct access to consensus time: `getConsensusTime()`, `getTransactionTimestamp(bytes32)`, `getWatermark()`, and more, all returning `uint128` nanoseconds via standard keccak256 ABI selectors. <!-- fact:CC-23,EVM-17 -->
- **The staking precompile** at `0x...0700` currently uses non-standard selectors that normal ABI encoding cannot call — don't build against it yet; it's flagged for replacement before mainnet. <!-- fact:EVM-18 -->

The pwROKO precompile at `0x...0500` implements the full ERC20 read interface, so it can be added to MetaMask as a custom token (note: pwROKO transfers are disabled by design — it's a locked staking representation). <!-- fact:EVM-16,PAL-07 -->

## 5. Your first temporal read

The whole point of ROKO is consensus time. Here's the shortest path to reading it two ways — from Solidity via the temporal precompile, and over RPC — and confirming you get the same value.

The temporal precompile exposes this interface, callable with standard keccak256 ABI selectors. Copy it into your contract: <!-- fact:EVM-17,CC-23 -->

```solidity
interface ITemporal {
    function getConsensusTime() external view returns (uint128);
    function getMyTimestamp() external view returns (uint128);
    function getTransactionTimestamp(bytes32 txHash) external view returns (uint128);
    function getWatermark() external view returns (uint128);
    function getBlockTimestamp(uint64 blockNumber) external view returns (uint128);
}

ITemporal constant TEMPORAL =
    ITemporal(0x0000000000000000000000000000000000000600);
```

A minimal contract that stamps the current consensus time on demand:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Stamper {
    uint128 public lastStamp;

    function stampNow() external returns (uint128) {
        lastStamp = TEMPORAL.getConsensusTime(); // u128 nanoseconds since the UNIX epoch
        return lastStamp;
    }
}
```

Calling `stampNow()` stores the nanosecond consensus time read straight from the precompile. To confirm the node agrees, query the same value over RPC: <!-- fact:EVM-07 -->

```bash
curl -s -X POST https://roko-testnetv2.ntfork.com \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"temporal_getConsensusTime","params":[]}'
# → {"jsonrpc":"2.0","id":1,"result":{"consensusTimeNs":"...","timeQuality":...,...}}
```

The `temporal_*` RPC namespace is served on the same JSON-RPC port as the `eth_*` methods, so the precompile read and the RPC read hit the same node and resolve to the same consensus clock. <!-- fact:EVM-07 -->

**What you'll see today.** Querying the live testnet right now returns a small mesh (~3 peers), possibly running `mock-anchor`, with `consensusOffsetNs` at 0. That's plumbing under test, not an accuracy claim — `mock-anchor` claims a perfect time source for development. Anchor-tier physics arrives as GNSS-disciplined validators join the mesh. <!-- fact:OPS-25 -->

## 6. Run a node

**From source** — pinned Rust 1.80.0 toolchain; build with exactly one runtime feature:

```bash
cargo build --release --features testnet -j2   # -j2 avoids OOM under 32 GB RAM
./target/release/roko-node --dev --alice --database auto   # single dev node
```
<!-- fact:OPS-02,OPS-03,OPS-04,OPS-01 -->

A single/local node must run with `--timesync-no-enforce` (there are no mesh peers to converge with). For a realistic local time mesh, `./run-e2e-local.sh --keep` starts a 3-validator local testnet. <!-- fact:OPS-08,OPS-09 -->

**From Docker** — images are published at `ghcr.io/roko-network/roko-node` (e.g. `testnet-main-amd64`, `testnet-main-arm64`); `docker-compose.prod.yml` runs a single node from them (review its flags before exposing it — it ships with development-grade RPC settings). <!-- fact:OPS-18,OPS-19 -->

**As a validator** — the repo ships `docker/docker-compose.validator.yml` for joining the testnet-v2 network as a validator node. Be aware that *validator registration is currently operator-gated*: activating a new validator requires the testnet sudo key, so coordinate with the team — you cannot self-register today. <!-- fact:OPS-27 -->

Validator time-source hardware (GNSS/PPS for Anchor tier, chrony for Standard) is covered in the validator docs; testnet validators without timing hardware can run `--timesync-time-source mock-anchor`. <!-- fact:CC-16,OPS-25 -->

## Dev-stage disclosures

- Time-quality slashing enforcement is currently disabled in the runtime (violations are detected and recorded, not slashed). <!-- fact:CC-15 -->
- A sudo (root) key exists on the testnet runtime — expect resets and forced upgrades. <!-- fact:PAL-05 -->
- Testnet staking and unlock parameters are dev placeholders (e.g. a 10-block pwROKO unlock cooldown vs. the 14-day mainnet figure). <!-- fact:CC-26 -->
