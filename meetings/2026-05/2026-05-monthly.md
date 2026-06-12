# Roko Network Monthly Update

**Month:** May 2026

---

## Executive Summary

May 2026 centered on maturing the protocol's economic design and shipping a unified block explorer. The team articulated the full reward and fee model — distinguishing native Roko transaction/gas fees from Power Roko staking inflation — and converged on a quality-weighted timestamping incentive that makes fast, accurate time attestation the network's primary value-generating activity. In parallel, explorer V2 progressed to near-production, merging substrate and EVM data into a single Blockscout-based view, and the network reported full stability across four validators with strong time quality. Work to bring an improved timing-hardware test bed and validator online continued throughout the month and remains in progress.

---

## Rewards and Fee System Design

The reward model was the dominant theme of the month, progressing from enumerating the distinct streams to a structured walkthrough of the full system.

### Reward Streams and Value Paths

The protocol is designed to support several distinct reward streams: staking rewards, block rewards, gas rewards collected when a validator builds a block, and transaction timestamping rewards. Timestamping was highlighted as a differentiator with no equivalent on other chains — it is intended to incentivize validators to process and timestamp transactions as quickly as possible and to compete on that service, distributing network load while giving validators a direct stake in driving traction.

By month's end the team had presented two distinct value paths:

- **Transaction and gas fees (native Roko):** paid in native Roko and distributed every block.
- **Staking inflation (Power Roko):** minted per era rather than per block, at a configurable annual rate that fluctuates between a floor of roughly 2.5 percent and a ceiling of 10 percent depending on the proportion of staked tokens. Both bounds are themselves adjustable. Power Roko is bonded with an unbonding period of around two weeks, and is backed one-to-one by native Roko at all times. Because substrate mints the native coin across many pallets, the implementation tracks every minting path to keep the backing balanced — a property reported as stable for five months.

### Fee Distribution Splits

Transaction and gas fees are split three ways, with a default discussed allocation of 20 percent to the treasury, 50 percent to the block author, and 30 percent to timestampers. These values are configurable through governance. The block-author share was viewed as difficult to push below roughly 50 percent, while treasury and timestamper shares carry more room to move; more aggressive splits weighting timestampers heavily (e.g., 80 percent) were noted as possible to emphasize that timestamping is the primary value-generating activity. The timestamper share is quality-weighted rather than split per timestamp: validators with better time quality earn a larger portion of the pooled fees, including a share redistributed from underperformers, creating competitive dynamics within that allocation. If no validator is vested to timestamp a block, the timestamper share reverts to the block author, who is selected by simple round-robin among eligible staked validators.

### Tuning Philosophy and Open Decisions

The team treated the splits as a directional signal of what the chain values rather than a precise financial calculation, since the eventual validator count, timestamper count, and token value cannot yet be modeled. Adjustments are expected to be rare, heavily debated, and concentrated in the network's first year or two. Several decisions remained unresolved and were prioritized for a dedicated session, notably which path to keep for rewards denominated in Power Roko versus Roko, and how to handle conversion from the current Roko token to the testnet (and later mainnet) native currency. An agent-driven mechanism for dynamically adjusting reward values was raised but set aside as premature.

---

## Explorer and Indexer

The block explorer advanced from a known gap to a near-production unified view across the month.

### Unifying Substrate and EVM Data

The principal objective was unifying substrate-side and EVM-side data into a single explorer, addressing the gap that the existing Blockscout-based explorer indexed only the EVM side. Improved indexers were added on the node side so the explorer can expose substrate-level information — blocks, extrinsic calls, constants, parameters, and pallets — alongside EVM data. Having archive-mode nodes expose indexed data directly simplifies running a full explorer. On the front end, new components provide developer-level chain access such as creating extrinsics and carrying parameter information, functionality previously available through Polkadot.js and now merged into the explorer. The database schema was updated to handle both block types, with time information living at both levels.

### Presentation Design

An open design question was how to present unified data without overwhelming users: those interacting with Roko purely as an EVM chain should not be forced to engage with substrate internals, even though many developer-oriented features live on the substrate side. By month's end, explorer V2 was about to be pushed to production — tracking both substrate and EVM transactions, carrying most of the Polkadot.js feature set. It was characterized as a non-critical component, and the front end can be re-skinned from the default Polkadot look toward Roko branding relatively quickly, starting with colors and logo.

---

## Node Services and Runtime

### Time Attestation API

The team worked to tighten the API that nodes expose externally, notably for timestamping and time attestation — the capability for any validator to attest the time of arbitrary data. The underlying logic is already wired at the implementation level, but exposing it through the public API is in progress. A related item is recovering prior code for detecting which time hardware a validator runs, so hardware detection can be included in a future delivery.

### Runtime Upgrade Path

The substrate runtime upgrade path was incidentally validated during explorer work. Because substrate chains can ship runtime logic as a Wasm image executed without a full binary update, most chain updates do not require replacing the node binary — though specific features such as new indexers do. The Raspberry Pi hardware upgraded automatically and cleanly via the standard substrate mechanism. Network stability was strong: blocks continued to be produced across four validators with time quality performing well.

---

## Timing Hardware

A new single-board compute module paired with a dedicated timing board carrying its own oscillator is being set up as an improved test bed for validating the timing software. The hardware is expected to provide roughly 24-hour holdover with microsecond drift, enabling A/B comparison against a second clock and against NTP. The goal is to determine whether the software can reliably distinguish better timing hardware from the noise floor; results will inform whether the detection approach is integrated or remains theoretical pending higher-grade reference clocks.

Bringing the board online proved a sustained struggle through the month — initially waiting on a power adapter, then blocked on networking configuration after a switch change, with the node's IP address unresolvable while the router operated in bridge mode. The hardware appears to have been flashed correctly with the custom image. No firm launch date was committed; the work is described as ongoing and expected to come online soon. The team also largely set aside the idea of hardware-tiered reward multipliers, reasoning that better timing hardware should already win more quality-weighted timestamping rewards without a separate mechanism.

---

## Validators

The team discussed standing up new live validators using artifacts from an existing validator to streamline setup. Provisioning can be handled through the Roko admin interface or via a helper script with worked examples for creating staking entries and minting test tokens, with all required configuration already residing on the existing device. The improved-hardware validator (above) remained the open provisioning item at month's end.

---

## Documentation and Marketing

### Positioning Document and White Paper

The team reviewed a circulated positioning document analyzing Roko's value proposition, prepared using an external value-framework methodology and derived from current repositories and documentation rather than older aspirational material. It was characterized as a mature, high-level pitch document for interested parties, with discussion of evolving parts of it into a formal white paper. Its reward-system and tokenomics content reflects the current state rather than the desired end state and will need adjustment as the framework matures. A separate forward-design tokenomics document was referenced, drawing on allocation analysis across a wide range of established tokens and failure cases, and covering staking multipliers, governance decay, and buyback-and-burn from treasury revenue.

### Public Rollout Planning

With the tokenomics direction taking shape, the team planned to translate internal documentation into public-facing website content and to run a phased, multi-week rollout covering onboarding and current tokenomics. There was also a proposal to publish tokenomics ideas on social channels to invite outside debate. Marketing support is being prepared, with several contributors trained over prior months and already producing materials; branding and marketing assets live in dedicated repositories, including a separate shareable media repository for partners and journalists containing branding kits, colors, and logos.

### Outreach

A large industry conference in Warsaw scheduled for September was discussed as a strong outreach opportunity, with a complimentary speaker slot and booth already offered. Sending at least one team member was treated as worthwhile, with travel and accommodation funding to be resolved closer to the date.

---

## Funding Note

A high-level funding update was shared: the liquid treasury balance was reported in the low tens of thousands of dollars, with remaining holdings non-liquid. The team flagged that meeting recurring monthly commitments could become difficult by the end of June, with the expectation that recurring revenue and potential funding would help close the gap. This is noted at a high level only.

---

## Looking Ahead

- Hold a dedicated session to resolve open reward decisions (Power Roko vs. Roko paths, token conversion ratio) and compile a decision document.
- Push explorer V2 to production and re-skin the front end toward Roko branding.
- Expose the timestamping and time-attestation API to external callers, and recover hardware-detection code for a future delivery.
- Bring the improved timing-hardware validator online, then run A/B and NTP comparisons.
- Translate internal tokenomics and protocol documentation into public website content and plan the phased public rollout.
- Refine the positioning document toward a formal white paper, and aggregate partner-shareable marketing assets.
- Determine a target testnet operating window before progressing toward mainnet, informed by data from external operators.
- Confirm conference attendance and work out a travel funding plan ahead of September.
