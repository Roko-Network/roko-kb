# Economics facts for simulations

This page summarizes the machine-readable v1.3 economics subset in [`_facts/roko-v1.3-economics-subset.json`](../_facts/roko-v1.3-economics-subset.json). It is intended for simulation consumers that need stable inputs for block time, fee routing, pwROKO, staking inflation, and EVM fee caveats.

## Canonical current facts

| Area | Current fact | Simulation treatment |
| --- | --- | --- |
| Mainnet block time | The mainnet runtime is compiled for 3-second blocks. <!-- fact:CC-04,TOK-31,PAL-17 --> | Use 3 seconds for canonical mainnet v1.3 scenarios. |
| Testnet block time | The current testnet runtime runs 2-second blocks; 6 seconds is a production-testnet target, not current runtime state. <!-- fact:CC-05,EVM-26,PAL-17 --> | Use 2 seconds for current testnet calibration and 6 seconds only as a planned/sensitivity case. |
| Runtime fee split | Transaction fees and tips split 20% Treasury, 50% block author, and 30% TemporalFeePool in both runtimes. <!-- fact:TOK-11,EVM-32 --> | Use 20/50/30 as the canonical non-EVM runtime fee split. |
| TemporalFeePool | The 30% TemporalFeePool share is distributed by recorded timestamper weights, with block-author fallback when no weights exist. <!-- fact:TOK-12 --> | Track TemporalFeePool separately from generic treasury revenue. |
| EVM pricing | EVM gas uses an EIP-1559-style base fee with 1 gwei default base fee and a 75,000,000 block gas limit. <!-- fact:EVM-20,TOK-13,TOK-14 --> | Model EVM gas demand separately from Substrate extrinsic fees. |
| EVM fee routing caveat | Testnet EVM fees route through `DealWithFees`, but mainnet currently sets `OnChargeTransaction = ()`. <!-- fact:TOK-15 --> | Do not assume mainnet EVM fees follow 20/50/30 until implementation is changed or confirmed. |
| pwROKO locking | pwROKO is minted by reserving native ROKO 1:1, is non-transferable, and unlocks through a cooldown flow. <!-- fact:CC-24,PAL-06,PAL-07,PAL-12,TOK-17,TOK-18,TOK-19 --> | Enforce 1:1 backing and non-transferability as hard invariants. |
| Staking asset | Staking uses pwROKO in both testnet and mainnet runtimes. <!-- fact:CC-25,PAL-09,TOK-21,PAL-35 --> | Model staking and governance power through backed pwROKO. |
| Reward backing | Staking rewards are minted with direct native backing before equal pwROKO is minted. <!-- fact:TOK-22,TOK-32,TOK-33 --> | Do not model unbacked pwROKO issuance. |
| Staking inflation | Staking rewards follow a 2.5%–10% inflation curve, targeting 50% ideal stake with 5% falloff. <!-- fact:PAL-14,TOK-23,TOK-06 --> | Use inflation as canonical L1 security issuance; fixed pools are separate incentive scenarios. |
| Legacy ERC-20 migration | No bridge or wrap mechanism for the Ethereum ERC-20 ROKO exists in the runtime repo today. <!-- fact:TOK-28 --> | Treat migration as planned/unimplemented until bridge or governance implementation evidence exists. |

## Contradictions that affect simulations

- Block time: current testnet is 2 seconds, planned production-testnet is 6 seconds, and mainnet is 3 seconds. Unqualified 6-second simulation defaults are stale unless clearly labeled as a planned testnet sensitivity. <!-- fact:CC-04,CC-05,EVM-26,PAL-17,TOK-31 -->
- Staking currency: runtime staking uses pwROKO in both runtimes. Older claims that mainnet staking uses native ROKO are stale. <!-- fact:PAL-35,TOK-21 -->
- EVM fees: Substrate runtime fees use the 20/50/30 split, but mainnet EVM fees are not currently wired through `DealWithFees`. EVM fee revenue should be a caveated sensitivity until the mainnet path is resolved. <!-- fact:TOK-15,TOK-11 -->
- Reward model: the runtime uses the 2.5%–10% staking inflation curve. A fixed pre-allocated reward pool can be modeled only as a temporary incentive program, not canonical L1 security issuance. <!-- fact:PAL-14,TOK-23,TOK-06 -->
- Legacy migration: runtime evidence does not show an ERC-20 bridge today. Holder migration should be modeled as a planned adoption/cutover process until implementation lands. <!-- fact:TOK-28 -->

## Whitepaper alignment

The normalized subset maps these code-backed facts to the v1.3 whitepaper economics sections:

- Section 5: native L1 operating model, EVM compatibility, and existing-holder migration context.
- Section 7.2: staking rewards, pwROKO governance/staking mechanics, and fee allocation.
- Table 1: economic flows and staking/reward assets.

## See also

- [FAQ](faq.md)
- [Glossary](glossary.md)
