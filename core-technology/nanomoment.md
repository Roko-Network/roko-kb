# NanoMoment

**NanoMoment** is Roko's timestamp type: an unsigned 128-bit integer counting nanoseconds since the Unix epoch. It is the unit in which temporal receipts are issued, canonical timestamps are assigned, the transaction watermark advances, and the temporal RPCs and precompile answer. <!-- fact:CC-18 -->

## Resolution, Not Accuracy

A NanoMoment gives you nanosecond *resolution* — distinct, totally ordered values down to the billionth of a second. It is **not** a claim that any clock in the network is accurate to a nanosecond. Accuracy is a separate, measured quantity: each validator reports a root-distance-to-UTC in nanoseconds for its time source, and the mesh publishes a network-wide `timeQuality` score (0–10,000) and convergence state alongside every consensus-time reading. When you query Roko for time, you get the value *and* the network's own assessment of how good that value is. <!-- fact:CC-16,CC-21 -->

## Why u128

The arithmetic is simple: at nanosecond resolution, a u64 overflows after ~584 years. A u128 doesn't run out for longer than the universe is expected to matter. Infrastructure shouldn't have an expiry date in its timestamp type.

## Where NanoMoments Appear

| Surface | Form |
|---|---|
| Temporal receipts and inclusion deadlines | u128 ns (`DEFAULT_INCLUSION_DEADLINE_NS = 15_000_000_000`) |
| TransactionWatermark (monotonic chain watermark) | u128 ns |
| Per-block temporal metadata (`temporal-transactions` pallet) | u128 ns |
| `temporal_*` JSON-RPC namespace | u128 serialized as a **string** |
| Temporal precompile at `0x...0600` (testnet runtime) | `uint128` return values |

<!-- fact:CC-17,CC-18,PAL-26,CC-21,CC-23 -->

Note what is *not* on this list: EVM `block.timestamp`. It remains the standard seconds-level value, so existing Solidity behaves identically — nanosecond data is additive, exposed through the temporal surfaces only. <!-- fact:EVM-25 -->

## Reading NanoMoments over RPC

RPC responses serialize NanoMoments as strings, because u128 exceeds what JSON numbers (and JavaScript's `Number`) can represent. Parse with `BigInt`: <!-- fact:CC-21,EVM-09 -->

```javascript
const res = await fetch('http://localhost:9944', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'temporal_getConsensusTime', params: []
  })
}).then(r => r.json());

const consensusTimeNs = BigInt(res.result.consensusTimeNs); // u128 as string
const quality = res.result.timeQuality;                     // 0..10000
```

`temporal_getTransactionTimestamp` accepts either a Substrate extrinsic hash or an Ethereum transaction hash, so EVM tooling can look up timestamps by the hash it already has. <!-- fact:EVM-10 -->

## Reading NanoMoments from Solidity

The temporal precompile on the testnet runtime exposes NanoMoments as `uint128` with standard keccak256 ABI selectors: <!-- fact:CC-23,EVM-17 -->

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

Solidity's `uint128` maps cleanly; durations and comparisons are plain integer arithmetic. The mainnet runtime does not currently include this precompile — it is a testnet-runtime surface today. <!-- fact:EVM-17,EVM-15 -->

## See Also

- [Temporal Transactions](./temporal-transactions.md) — receipts, deadlines, and the watermark
- [Temporal Infrastructure](./temporal-infrastructure.md) — where the time itself comes from
