# Network Architecture

Roko is a Substrate chain with a native time-synchronization layer. The node is a single binary, the RPC surface is a single port, and the architecture stacks four layers: a libp2p network, the PTP+Squared validator time mesh, BABE + GRANDPA consensus modified by Proof of Accurate Time (PoAT), and the application layer (EVM + Substrate pallets). <!-- fact:DOC-01 -->

## The stack

The chain is built on Polkadot SDK `release-polkadot-v1.13.0` with Frontier EVM from the ChainSupport fork on the matching branch. <!-- fact:CC-01 -->

| Layer | What runs there |
|---|---|
| Applications | EVM contracts, Substrate pallets, precompiles |
| Consensus | BABE block production + GRANDPA finality, PoAT temporal layer |
| Time mesh | PTP+Squared over libp2p protocol `/roko/timesync/1` |
| Network | libp2p P2P transport |

Consensus is BABE for block production plus GRANDPA for finality; the session key set also carries ImOnline, AuthorityDiscovery, BEEFY, and a dedicated Temporal key. <!-- fact:CC-02 -->

The time mesh is a native Rust P2P layer: validators probe each other over `/roko/timesync/1`, estimate clock offsets via lucky-packet selection, score peer reputation with Welch's t-test, and converge on a mesh consensus time. <!-- fact:CC-13 --> Mesh state reaches the runtime through a block inherent consumed by `pallet-timesync`, which stores per-validator time quality on-chain and checkpoints health every 100 blocks. Time-quality offences are defined but enforcement is currently **disabled** in both compiled runtimes — violations are detected, not slashed. <!-- fact:CC-14,CC-15 -->

## The node

One binary: `roko-node`. It is compiled per network — `cargo build --release --features testnet` or `--features mainnet` — selecting which runtime is baked in. <!-- fact:OPS-01,OPS-03 -->

Block times as compiled: testnet 2 seconds (development setting; 6 seconds is the production-testnet target, tracked in-code as M-19), mainnet runtime 3 seconds. <!-- fact:CC-05,CC-04 -->

Default ports:

| Port | Purpose |
|---|---|
| 30333 | libp2p P2P |
| 9944 | JSON-RPC (HTTP + WebSocket) |
| 9615 | Prometheus metrics |

<!-- fact:OPS-20 -->

## One RPC port, three API surfaces

Ethereum RPCs, Substrate RPCs, and the temporal namespace are merged into a single JSON-RPC module served on port 9944 over both HTTP and WebSocket. <!-- fact:EVM-07 -->

- **Ethereum**: `eth_*`, filters, `eth_subscribe`, `net_*`, `web3_*`, `debug_*` (txpool is present in code but not enabled). <!-- fact:EVM-06 -->
- **Temporal**: 14 `temporal_*` methods — consensus time, watermark info, per-block temporal metadata, per-transaction timestamps (queryable by either Substrate or Ethereum tx hash), queue statistics, validator time quality, mesh state, checkpoints, violations, and metrics. <!-- fact:EVM-08,EVM-10 -->
- **Substrate**: the standard chain/state/author surface.

MetaMask connects with RPC URL `https://roko-testnetv2.ntfork.com` (the live hosted endpoint, Chain ID 442), or `http://<host>:9944` against a self-hosted node, currency ROKO (18 decimals). <!-- fact:EVM-28,OPS-12 -->

## EVM environment

- Chain ID **442** on testnet; the mainnet chain ID is **TBD** — no production mainnet genesis exists yet. <!-- fact:CC-06,EVM-04 -->
- **Ethereum-native accounts**: 20-byte addresses at the Substrate level with identity address mapping — no Substrate↔EVM address translation. <!-- fact:EVM-21 -->
- Block gas limit **75,000,000**; EIP-1559-style fees with a 1 gwei default base fee. <!-- fact:EVM-19,EVM-20 -->
- **Custom precompiles** (testnet): pwROKO at `0x...0500` (ERC20-style — addable to MetaMask as a token), Temporal at `0x...0600`, Staking at `0x...0700`. The mainnet runtime currently ships only `0x500`. <!-- fact:EVM-14,EVM-16,EVM-15 -->
- Caveat for tooling authors: the Staking precompile uses non-standard sequential selectors today (flagged in-code for replacement before mainnet) — standard ABI encoding cannot call it yet. <!-- fact:EVM-18 -->

## Testnet topology, honestly

The deployment guide documents the live testnet endpoints as `wss://roko-testnetv2.ntfork.com` (AWS eu-north-1), running two genesis validators on one EC2 instance, with a Blockscout-based explorer (public endpoint to be announced at launch). <!-- fact:OPS-12,OPS-13,OPS-14 -->

Two things a builder should understand about joining:

1. **You can join the P2P network from repo contents** — but not via the bundled chain-spec JSONs, which ship with empty `bootNodes`. <!-- fact:OPS-10 --> The join path is `docker/docker-compose.validator.yml`, which hardcodes the live testnet-v2 bootnode (`/dns/roko-testnetv2.ntfork.com/tcp/30333/p2p/12D3KooWLn4vDfN5agevaRd4ct5HRQUJ4R6GajYcd7abJdwq1WAA`) and fetches the running chain spec from the admin service (`https://roko-admin.ntfork.com/public/testnet-v2-chain-spec.json`). A node started this way connects to and syncs the public testnet. <!-- fact:OPS-11 -->
2. **Validator registration is what's gated, not network access** — syncing as a node is open, but joining the live validator *set* is sudo-gated: it requires the network operators (the documented flow needs the sudo key to fund, lock pwROKO, bond, set session keys, and signal `validate`). There is no permissionless self-registration yet. <!-- fact:OPS-27 -->

What you *can* do today: build `roko-node` from source, run a single dev node (`roko-node --dev --alice --database auto`), and run a full 3-validator local testnet with a working time mesh via `./run-e2e-local.sh --keep`. <!-- fact:OPS-30,OPS-09 -->

## See Also

- [Time Beacons](./time-beacons.md) — validator time sources and the mesh
- [Consensus Mechanism](./consensus.md) — BABE/GRANDPA + PoAT
- [Validator Requirements](./validator-requirements.md)
