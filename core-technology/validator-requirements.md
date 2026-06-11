# Validator Requirements

What you actually need to run a Roko validator: ordinary server hardware, a Rust build (or a pre-built binary/image), a time source the node can classify, and a pwROKO bond. No time card is required, and the network is in pre-public-launch testnet — joining the live testnet validator set is currently coordinated with the team. <!-- fact:OPS-30 -->

## Build requirements

The node builds with Rust 1.80.0 (pinned by `rust-toolchain.toml`, with the `wasm32-unknown-unknown` target) plus `build-essential`, `protobuf-compiler`, `clang`, and `llvm-dev` on Ubuntu/Debian. <!-- fact:OPS-02 -->

```bash
# One runtime feature is mandatory: testnet OR mainnet
cargo build --release --features testnet -j2
```

The build needs a minimum of 8 GB RAM and 50 GB free disk; the `-j2` flag limits parallel compilation because Substrate builds exhaust memory on machines with less than 32 GB RAM — drop it on larger machines for faster builds. <!-- fact:OPS-04,OPS-03 -->

## Runtime hardware

Production validator guidance from the deployment guide:

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 16 GB | 32 GB (high-traffic) |
| Storage | 500 GB SSD | 1 TB |
| Network | 100 Mbps | — |

<!-- fact:OPS-22 -->

The network even runs a real Raspberry Pi CM5 validator on the testnet (with a GNSS module and Timebeat for timing), so the floor is genuinely modest. <!-- fact:OPS-26 -->

## Time source

Validators self-classify their time source — Timebeat PTP daemon, chrony, GNSS/PPS, or NIC hardware timestamping — and announce a measured root distance to UTC. GNSS/PPS hardware earns **Anchor** tier; the modes are `Auto` (default), `MockAnchor` (testnet), and `SystemOnly`. <!-- fact:CC-16 -->

| Tier | Root distance | Source | Hardware cost |
|------|--------------|--------|---------------|
| Anchor | < 1 µs | GNSS/PPS-disciplined clock | ~$30–300 GNSS receiver |
| Standard | < 10 µs | NTP via chrony | none |
| Minimal | > 10 µs | System clock | none |

<!-- fact:OPS-23,OPS-24 -->

No timing hardware is required to participate on testnet: `--timesync-time-source mock-anchor` bypasses detection (development/testnet only). <!-- fact:OPS-25 -->

Time quality is recorded on-chain per validator, with time-sync offences defined (slash fractions: excessive offset 0%, persistent drift 1%, low reputation 1%, contradictory offsets 5%) — but offence **enforcement is currently disabled in both compiled runtimes**, so violations are detected and scored without slashing. <!-- fact:CC-14,CC-15 -->

## Bonding and economics

Staking is denominated in **pwROKO**, not native ROKO, in both runtimes; the genesis pattern bonds 50 ROKO worth of pwROKO per validator. <!-- fact:CC-25 -->

pwROKO mechanics in brief: `lock(amount)` reserves your native ROKO 1:1 and mints pwROKO; unlocking is a two-step flow — `unlock_request` starts a cooldown, then `complete_unlock` releases the backing ROKO. pwROKO itself is non-transferable: it can only be minted by locking and burned by unlocking. <!-- fact:PAL-06,PAL-07 -->

The unlock cooldown is governance-adjustable: 14 days at mainnet parameters, a 10-block placeholder on testnet. <!-- fact:TOK-20 -->

Staking rewards follow the standard Substrate reward curve as configured: min inflation 2.5%, max inflation 10%, ideal stake 50%. These are runtime parameters, not an APY promise — the network is pre-launch and the rewards model remains under active design. <!-- fact:TOK-23 -->

## Joining the network

The honest current path, in order:

1. **Run a dev node** — `roko-node --dev --alice --database auto` gives you a single-validator chain with pre-funded accounts. <!-- fact:OPS-30 -->
2. **Run a local 3-validator time mesh** — `./run-e2e-local.sh --keep` starts Alice/Bob/Charlie on ports 9944–9946 with a fresh chain spec, using mock-anchor time. <!-- fact:OPS-09 -->
3. **Join the live testnet validator set** — currently **admin-coordinated**: the documented registration flow requires the testnet sudo key to fund the account with 200 ROKO, lock 50 ROKO into pwROKO, bond, set session keys, and signal validate intent. Active status takes effect the next staking era (~5 minutes on testnet). You cannot self-register today; contact the team. <!-- fact:OPS-27 -->

For single-validator and local setups, two flags matter: `--timesync-no-enforce` (a lone node has no peers to converge with) and `--db-storage-threshold 0` (avoids storage-monitor crashes on low-disk systems). <!-- fact:OPS-08 -->

## Operations

- **Monitoring:** Prometheus metrics on port 9615 include time-source type, root distance, and mesh convergence state; an in-repo Prometheus + Grafana + AlertManager stack ships under `docker/monitoring/`. <!-- fact:OPS-28 -->
- **Mesh health:** check `temporal_getMeshState` and `system_health` over RPC. <!-- fact:OPS-29 -->
- **Security basics:** `--rpc-methods safe` in production, reverse-proxy TLS in front of 9944, firewall everything except P2P (30333) and proxied RPC.

For context on chain timing: the current testnet runtime runs 2-second blocks (6 seconds is the stated production-testnet target, per the in-code M-19 note), and the mainnet runtime is compiled at 3 seconds. <!-- fact:CC-05,CC-04 -->

## See also

- [Hardware Timestamping](./hardware-timestamping.md) — time-source detection in depth
- [OCP-TAP](./ocp-tap-compliance.md) — open time-hardware options for Anchor tier
- [Consensus Mechanism](./consensus.md) — how time quality feeds consensus
