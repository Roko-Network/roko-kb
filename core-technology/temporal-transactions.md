# Temporal Transactions

On Roko, every transaction — Substrate extrinsic or Ethereum transaction — gets a cryptographic paper trail for *when* the network saw it and a consensus-enforced guarantee that it cannot be silently dropped. No wallet changes, no new transaction type, no extra fields: this happens at the node and consensus layers. <!-- fact:CC-17,EVM-31 -->

Three mechanisms make this work: temporal receipts, the inclusion deadline, and the timestamping queue.

## Temporal Receipts

When a transaction is admitted to the pool, the node issues an **ECDSA-signed temporal receipt** under the domain prefix `ROKO_TX_RECEIPT_V1` (validator key type `temp`). The receipt binds the transaction to a nanosecond admission time, signed by validator keys — a verifiable record that the network accepted your transaction at a specific moment. <!-- fact:CC-17 -->

Temporal validator keys derive from the same seed as the validator's BABE/GRANDPA identity, registered in the session key set. <!-- fact:CC-02 -->

## The 15-Second Inclusion Deadline

Each receipted transaction carries an inclusion deadline — **15 seconds by default** (`DEFAULT_INCLUSION_DEADLINE_NS = 15_000_000_000`), with enforcement on by default. The rule is checked at **block import**: if a block omits a receipted transaction whose deadline has passed, honest validators reject the block entirely. <!-- fact:CC-17,DOC-12 -->

Be precise about what this is: an **inclusion deadline, not a latency promise**. It does not mean transactions confirm in 15 seconds — block times do that (2 s on the current testnet dev chain, 6 s production-testnet target, 3 s on the mainnet runtime). What it means is that a block producer cannot silently censor a receipted transaction: past the deadline, leaving it out makes the block invalid. <!-- fact:CC-17,CC-05,CC-04 -->

## The Fee-Priority Timestamping Queue

Canonical timestamps are assigned by a background `timestamping-queue` task, enabled by default. Arrival time is recorded at submit; then, on a **100 ms tick**, the queue stamps pending transactions in descending fee order — higher-fee transactions receive earlier canonical timestamps. <!-- fact:CC-19,EVM-12 -->

This is **fee-priority ordering, applied deterministically**. Fees still buy priority, exactly as on Ethereum — but the rule is fixed at the protocol level, applied at receipt, and sealed in a signed receipt. There is no private builder auction, no validator rearranging the block to taste, and any omission past deadline is rejected at consensus. That combination — deterministic ordering plus inclusion enforcement — is what reduces ordering manipulation and silent censorship. It is a provable property, not a slogan. <!-- fact:CC-19,CC-17 -->

Node operators can change the behavior:

```bash
# Stamp immediately on submit instead of fee-ordered 100ms batches
roko-node --no-fee-priority-queue

# Bound the RPC wait-time history tracker (default 10000)
roko-node --timestamping-queue-max-history 5000
```
<!-- fact:EVM-12 -->

## On-Chain Ordering: Watermark and Finalization

The `temporal-transactions` pallet enforces per-block temporal ordering at `on_finalize` and maintains a monotonic **TransactionWatermark** — a chain-wide temporal high-water mark that only moves forward. Timestamps are u128 nanoseconds ([NanoMoment](./nanomoment.md)). <!-- fact:CC-18 -->

Timestamping is also incentivized: transaction fees are split 20% to treasury, 50% to the block author, and 30% into a TemporalFeePool that is periodically distributed to timestamping validators by recorded weight. <!-- fact:TOK-11,TOK-12 -->

## Reading Temporal Data

Builders query timestamps without touching transaction formats:

- **JSON-RPC** — the `temporal_*` namespace on the standard RPC port (9944): `temporal_getTransactionTimestamp` accepts either a Substrate extrinsic hash or an Ethereum transaction hash. <!-- fact:CC-20,EVM-10 -->
- **Solidity** — the temporal precompile at `0x...0600` exposes `getTransactionTimestamp(bytes32)`, `getConsensusTime()`, `getWatermark()`, and more (testnet runtime). <!-- fact:CC-23,EVM-15 -->

EVM `block.timestamp` is unchanged — it stays the standard seconds-level value, so existing contracts behave identically. Nanosecond data lives in the temporal surfaces above. <!-- fact:EVM-25 -->

## See Also

- [NanoMoment](./nanomoment.md) — the timestamp type
- [Consensus Mechanism](./consensus.md) — block import enforcement in context
- [MEV Prevention](./mev-prevention.md) — what deterministic ordering does and doesn't remove
