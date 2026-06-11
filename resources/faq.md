# FAQ

Real answers to the questions builders actually ask. Roko's testnet is live and approaching its public launch — some answers below carry honest dev-stage caveats, marked where they matter.

---

### Is Roko EVM compatible?

Yes — your existing Ethereum tooling works unmodified. Roko ships Frontier (Substrate's Ethereum-compatibility layer), serving the standard `eth_*`, `net_*`, and `web3_*` RPC namespaces alongside Substrate RPCs on a single JSON-RPC port (default 9944, HTTP and WebSocket). <!-- fact:EVM-06,EVM-07 -->

Accounts are Ethereum-native 20-byte addresses with no translation layer — your Substrate account *is* your EVM address. `block.timestamp` in Solidity stays the standard seconds-level value; nanosecond temporal data lives in the `temporal_*` RPCs and the temporal precompile, so nothing about your existing contracts breaks. <!-- fact:EVM-21,EVM-25 -->

To connect MetaMask:

```
Network name:    Roko Testnet
RPC URL:         http://<your-node-host>:9944
Chain ID:        442
Currency symbol: ROKO (18 decimals)
```
<!-- fact:EVM-28 -->

### What's the chain ID?

**442** for the testnet, set at genesis across all testnet chain specs. The mainnet chain ID is **TBD** — it has not been assigned yet. <!-- fact:CC-06,EVM-04 -->

### What's the block time?

The current testnet runs **2-second blocks**. The production-testnet target is **6 seconds** (the 2s value is an explicitly flagged development setting, tracked in-code as M-19), and the mainnet runtime is compiled at **3 seconds**. <!-- fact:CC-05,CC-04 -->

### How do I get testnet tokens?

Through the testnet faucet, which is part of the roko-admin dashboard documented in the node repo. It dispenses 100 ROKO per request by default, with a per-address cooldown and rate limiting; broad public access opens with the public testnet launch. <!-- fact:TOK-29,OPS-11,OPS-27 -->

### Is there a mainnet?

No. The testnet is the live network today, and it's approaching its public launch. A mainnet runtime exists in code (3-second blocks), but no production mainnet genesis exists and the mainnet chain ID is still TBD — anything claiming otherwise isn't from us. <!-- fact:CC-07,CC-04,EVM-04 -->

### How is Roko's time different from a time oracle?

An oracle is a third party you trust to post the time on-chain. On Roko, time *is* a consensus product: validators run a peer-to-peer time mesh that measures clock offsets between peers, scores reputation, and converges on a mesh consensus time. <!-- fact:CC-13 -->

You query it directly — `temporal_getConsensusTime` returns nanosecond consensus time plus a time-quality score, convergence state, and peer count — and smart contracts on testnet can read it natively via the temporal precompile at `0x...0600` (`getConsensusTime()`, `getWatermark()`, `getTransactionTimestamp(bytes32)`). No external feed, no oracle subscription. <!-- fact:CC-20,CC-21,CC-23 -->

### What about MEV and front-running?

Roko doesn't make vague MEV promises — it changes two specific, provable things about ordering:

1. **Ordering is fixed at receipt by a deterministic rule.** A timestamping queue (on by default) assigns each transaction a canonical nanosecond timestamp when it arrives at the pool; higher-fee transactions get earlier canonical timestamps. Fees still set priority — transparently, at the protocol level — but the block producer doesn't get to reorder around you, and per-block temporal ordering is enforced by the runtime at finalization. <!-- fact:CC-19,CC-18 -->

2. **Silent censorship is rejected at consensus.** Every transaction gets an ECDSA-signed temporal receipt at pool admission. A block that omits a receipted transaction past its inclusion deadline (15 seconds by default, enforcement on by default) is rejected at block import. The deadline is an inclusion guarantee, not a speed claim. <!-- fact:CC-17 -->

This applies to Ethereum-submitted transactions too — wallets don't need any extra fields. <!-- fact:EVM-31 -->

### Can I run a validator?

You can run nodes today, and there's a real validator path:

- **Build and run from source.** Pin Rust 1.80.0 and build with `cargo build --release --features testnet`. A single dev node runs with `roko-node --dev --alice --database auto`, and `./run-e2e-local.sh --keep` spins up a full 3-validator local testnet with a live time mesh. <!-- fact:OPS-02,OPS-03,OPS-30,OPS-09 -->
- **Bring a time source — or don't, yet.** Validators self-classify their time source: GNSS/PPS hardware earns the Anchor tier, while chrony/NTP and system clocks land in Standard/Minimal. For testnet experimentation without timing hardware, `--timesync-time-source mock-anchor` works (development/testnet only). <!-- fact:CC-16,OPS-25 -->
- **Joining the live testnet validator set is currently registration-gated.** Pre-public-launch, new validators are added through a gated registration flow rather than open self-registration. If you want in, get in touch through the official channels. <!-- fact:OPS-27 -->

### How decentralized is the testnet right now?

Honestly: it's a pre-public-launch testnet, and it looks like one. The sudo pallet is present in both runtimes (full root governance during development), validator registration is sudo-gated, and time-quality slashing is implemented but currently disabled — violations are detected and recorded, not punished. These are deliberate dev-stage settings, disclosed here because you should know them before you build. <!-- fact:PAL-05,OPS-27,CC-15 -->

### How do I stay updated?

Documentation lives at docs.roko.network; announcements go out via the official channels. Testnet access opens up as the public launch lands.

---

## See also

- [Introduction](../getting-started/introduction.md)
- [Glossary](glossary.md)
- [Validator Requirements](../core-technology/validator-requirements.md)
