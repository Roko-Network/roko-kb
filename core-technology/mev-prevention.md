# Transaction Ordering & Censorship Resistance

Roko's answer to ordering manipulation is not a vague resistance slogan — it is two concrete, verifiable mechanisms: a **deterministic fee-priority ordering rule** that takes transaction ordering out of the block producer's hands, and **per-receipt inclusion enforcement** that makes silent censorship provable. Both are live in the node today, and you can audit both over RPC. <!-- fact:CC-19,CC-17 -->

## How ordering works

Every transaction — Substrate or Ethereum-format — receives a **canonical nanosecond timestamp** at pool admission. Ethereum wallets need no extra fields; the timestamping happens server-side in the pool. <!-- fact:EVM-31 -->

Timestamps are assigned by a fee-priority queue, enabled by default: a background task runs on a 100 ms tick and stamps pending transactions in descending fee order, so **a higher fee earns an earlier canonical timestamp**. The rule is fixed at the protocol level. Operators can disable it with `--no-fee-priority-queue` (transactions are then stamped immediately on arrival). <!-- fact:EVM-12,CC-19,DOC-34 -->

The canonical timestamp is then enforced, not advisory: the temporal-transactions pallet checks per-block temporal ordering at `on_finalize` and maintains a monotonic transaction watermark across blocks. <!-- fact:CC-18 -->

What this changes versus a conventional chain: ordering is decided by a **deterministic, transparent rule applied at receipt** — not by validator preference, and not by a private builder auction. A block producer cannot quietly reorder, front-run, or sandwich transactions it has already received, because the order was fixed and sealed before block assembly.

## How inclusion is enforced

Ordering rules mean little if a validator can simply drop your transaction. Roko closes that hole with temporal receipts:

- Every transaction gets an **ECDSA-signed temporal receipt** at pool admission (domain prefix `ROKO_TX_RECEIPT_V1`).
- Each receipt carries an **inclusion deadline** — 15 seconds by default.
- Block import **rejects any block that omits a receipted transaction past its deadline**, with enforcement on by default. <!-- fact:CC-17,DOC-12 -->

The 15-second window is an *inclusion deadline*, not a latency or speed claim: it is the point past which omission of a receipted transaction invalidates the block. The practical effect is that censorship stops being deniable — either your transaction is included, or honest validators reject the block that excluded it. <!-- fact:CC-17 -->

A share of transaction fees backs this machinery: fees are split 20% to treasury, 50% to the block author, and 30% to a temporal fee pool that rewards timestamping validators. <!-- fact:TOK-11,TOK-12 -->

## What this does NOT prevent

Being precise about scope is the point:

- **Fee priority still exists — by design.** Higher fees get earlier timestamps, transparently. Roko removes *validator discretion* over ordering, not fee-based priority. <!-- fact:CC-19 -->
- **The mempool is not encrypted.** Pending transactions are visible; a searcher can still react to what it sees by bidding a higher fee. The difference is that the resulting order follows the published rule, not a private deal with the builder.
- **`block.timestamp` in the EVM is unchanged.** Solidity sees the standard seconds-level value; nanosecond ordering is pool-level and exposed via `temporal_*` RPCs and the Temporal precompile, not via changes to the Ethereum JSON-RPC schema. Don't build ordering assumptions on `block.timestamp`. <!-- fact:EVM-25,DOC-10 -->
- **Cross-chain ordering is out of scope.** These guarantees apply within Roko, not across bridges.

## Trust assumptions

These mechanisms are strong, but they are not unconditional. An MEV researcher evaluating Roko should probe exactly where the trust sits:

- **The canonical timestamp is a node-assigned clock reading, not a trustless oracle.** A transaction is stamped from the receiving node's clock at pool admission. <!-- fact:CC-19 --> So the ordering guarantee is only as strong as (1) the mesh's clock agreement — the PTP Squared time mesh that probes peers, scores reputation, and converges on a consensus time <!-- fact:CC-13 --> — and (2) the assumption that the first node to see a transaction stamps it honestly rather than backdating or delaying it. A dishonest receiving node has latitude over the stamp it issues; the mesh constrains how far that stamp can drift from consensus time, it does not eliminate the node's discretion at the moment of admission.
- **Inclusion enforcement is defense-in-depth, not a unilateral guarantee.** Block import rejects any block that omits a receipted transaction past its deadline. <!-- fact:CC-17 --> But "rejects" means honest validators reject it at import — the property holds under an honest majority at block import. It raises the cost of censorship and makes omission provable; it does not make censorship physically impossible against a colluding majority.
- **What remains unprevented, plainly stated.** The mempool is unencrypted, so a searcher can still see pending transactions and respond by bidding a higher fee — fee priority is a designed feature, not a leak. Timesync offence slashing is currently disabled in both runtimes, so a node that stamps dishonestly is detected and recorded but not yet economically penalized. <!-- fact:CC-15 --> These are the honest edges of the design as it ships today.

## Verify it yourself

The ordering pipeline is observable over the standard RPC port:

```bash
# Canonical timestamp for a transaction — accepts a Substrate
# extrinsic hash OR an Ethereum tx hash
curl -s -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"temporal_getTransactionTimestamp","params":["0x..."]}' \
  http://localhost:9944

# Queue behavior and wait times
# temporal_getQueueStats / temporal_getTransactionWaitTime / temporal_getWatermarkInfo
```

The node exposes 14 `temporal_*` methods covering consensus time, per-block metadata, queue statistics, and watermark state. <!-- fact:EVM-08,EVM-10 -->

On testnet, contracts can read temporal state directly through the Temporal precompile at `0x...0600` (`getConsensusTime()`, `getTransactionTimestamp(bytes32)`, `getWatermark()`, and friends — standard keccak256 ABI selectors). The mainnet runtime does not yet include this precompile. <!-- fact:EVM-17,EVM-15 -->

## Current status

This is a gated development testnet. The development testnet runs 2-second blocks, with 6 seconds as the production-testnet target (tracked in-code as M-19); the mainnet runtime is compiled at 3 seconds. Treat any numbers you measure today as development-configuration numbers. <!-- fact:CC-05,CC-04 -->
