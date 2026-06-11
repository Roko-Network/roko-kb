# Join the Testnet

This page gets you from zero to a deployed contract on the ROKO testnet, and points node operators at the right entry points. One caveat up front: the endpoints below are the current **testnet-v2 infrastructure** — pre-public-launch, subject to change or reset. <!-- fact:OPS-12 -->

## 1. Connect MetaMask

Add the ROKO testnet as a custom network:

| Field | Value |
|---|---|
| Network name | ROKO Testnet |
| RPC URL | `https://roko-testnetv2.ntfork.com` (WebSocket: `wss://roko-testnetv2.ntfork.com`) |
| Chain ID | `442` |
| Currency symbol | `ROKO` (18 decimals) |

Chain ID 442 is set at genesis for all testnet chain specs; the native token is ROKO with 18 decimals and Ethereum-style (`0x...`, 20-byte) accounts — there is no address translation between the Substrate and EVM layers. <!-- fact:CC-06,CC-08,EVM-21 -->

The documented live endpoints are `wss://roko-testnetv2.ntfork.com` (HTTPS on the same host); a self-hosted node serves the same APIs at `http://<host>:9944`. <!-- fact:OPS-12,EVM-28 -->

A mainnet chain ID is not yet assigned — if something claims to be "ROKO mainnet," it isn't ours. <!-- fact:EVM-04 -->

## 2. Get testnet ROKO

Testnet ROKO is distributed through a faucet in the network's admin service: default 100 ROKO per request, hard-capped, with a per-address cooldown and IP rate limiting. The admin/faucet service runs on the testnet-v2 infrastructure; if you can't reach it, ask in the community channels and someone will fund you. <!-- fact:TOK-29,OPS-13 -->

## 3. Watch your transactions

A Blockscout-based block explorer (with a Substrate sidecar API) runs against the testnet; its public endpoint will be announced at launch. <!-- fact:OPS-14 -->

For temporal data the explorer doesn't show, query the node directly — `temporal_getTransactionTimestamp` accepts either a Substrate extrinsic hash or a native Ethereum transaction hash. <!-- fact:EVM-10 -->

## 4. Deploy a contract

Standard Ethereum tooling works unmodified — the Ethereum RPC surface (`eth_*`, `net_*`, `web3_*`, plus filters, pubsub, and `debug_*`) is served on the single RPC port alongside the Substrate and `temporal_*` APIs. <!-- fact:DOC-10,EVM-06,EVM-07 -->

```bash
# Hardhat example: hardhat.config.js network entry
networks: {
  rokoTestnet: {
    url: "https://roko-testnetv2.ntfork.com",
    chainId: 442,
  }
}
```

Useful parameters: gas is EIP-1559-style with a 1 gwei default base fee; the block gas limit is 75,000,000; blocks currently arrive every 2 seconds (the production-testnet target is 6 seconds; mainnet runtime is compiled at 3). Contract deployment is enabled at genesis, behind a governance-controllable switch. <!-- fact:EVM-20,EVM-19,CC-05,EVM-23 -->

Two ROKO-specific things worth knowing as a builder:

- **The temporal precompile** at `0x0000000000000000000000000000000000000600` gives Solidity direct access to consensus time: `getConsensusTime()`, `getTransactionTimestamp(bytes32)`, `getWatermark()`, and more, all returning `uint128` nanoseconds via standard keccak256 ABI selectors. <!-- fact:CC-23,EVM-17 -->
- **The staking precompile** at `0x...0700` currently uses non-standard selectors that normal ABI encoding cannot call — don't build against it yet; it's flagged for replacement before mainnet. <!-- fact:EVM-18 -->

The pwROKO precompile at `0x...0500` implements the full ERC20 read interface, so it can be added to MetaMask as a custom token (note: pwROKO transfers are disabled by design — it's a locked staking representation). <!-- fact:EVM-16,PAL-07 -->

## 5. Run a node

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
