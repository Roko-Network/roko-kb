# Roko Network Monthly Update

**Month:** February 2026

---

## Executive Summary

February 2026 was defined by a decisive architectural shift: embedding the time-mesh logic directly inside validator nodes so the network converges on accurate time as a first-class function rather than relying on an external time source. Over the course of the month the team moved from presenting the new design, to building it out across a v3 testnet, to articulating a strategic framing of the project as a genuinely time-first chain. Work focused on integrating the PTP-squared time mesh into the substrate nodes, validating it on an experimental testnet, planning the physical time-hardware configuration, and aligning on structure, go-to-market, and the path to a public code base.

---

## Consensus and Time-Mesh Architecture

The central technical theme was relocating timekeeping from an external service into the chain itself. The new design runs a PTP-squared time-mesh engine inside each substrate node, so every validator participates in the mesh as a time provider while light nodes act as relayers — making the network a time mesh in its own right that also produces blocks and processes transactions.

### Pallet and Finalization Changes

Two new pallets were introduced: a TimeSync pallet implementing the PTP-squared algorithm and the time-mesh engine, plus a bridge pallet carrying time-mesh information onto the chain. A modified block-finalization layer uses time-sync inherents to validate accurate time, setting block time to the mesh-derived median and rejecting blocks with incorrect time. The temporal-transaction and court layers continue to function as before, but the previous time RPC and its centralized entity are no longer required, since any validator can now provide valid time attestation. Legacy transaction support remains in place.

### Anti-Manipulation and Reputation

The design includes mechanisms to detect validators that copy time rather than genuinely provide it: roughly every hundred blocks a validator is sampled and its reported time, drift, and related values are compared against mesh consensus, flagging nodes that merely mirror another node. A reputation system scored from zero to one weights each validator's contribution to the median time and influences block-production selection and rewards — so poor time providers lose reputation and rewards while reliable providers earn more, with the intent that even a substantial fraction of bad actors cannot corrupt network time. Proof-of-stake is retained primarily for Sybil resistance and could be scaled down later, given that the hardware investment to become a validator itself functions as a form of stake. By late in the month the team framed this resilience in stronger terms: established time-mesh networks have reportedly survived manipulation attacks, with reputation for bad providers dropping so quickly that a network can shrink dramatically and still hold correct time, making time manipulation comparably resource-intensive to attacking proof-of-stake or proof-of-work.

---

## Testnet Progress

The architecture and code were reported to exist with extensive tests, but the integrated network had not yet been validated end to end — it remained explicitly experimental. The plan discussed was to stand up a new experimental testnet (v3) alongside the existing one so the new version could be evaluated without committing to it.

By mid-month, the centralized timer source had been removed, work was underway to remove the beacons and relocate the inclusion-enforcing courts to a deeper layer of the chain, and the blockchain layer was operating with three validators. The team was resolving peer-to-peer communication issues at the mesh level that were causing failures to converge on valid time attestation — characterized as a minor structuring bug in the mesh rather than a protocol-level problem — and the mesh was being rebuilt.

### Validation Plan

The next validation milestone discussed was to monitor the local v3 testnet through updated dashboards, observe time convergence, and run manual tests across several transaction types under light load. A planned resilience test involves deliberately killing the time process on one validator to confirm the system reacts effectively, with the affected validator's reputation expected to drop; the team wants to observe whether the network ignores that validator instantly or sees a small temporary accuracy drop. Once manual tests pass, the intent is to treat v3 as the candidate final version, deploy it as v2 was deployed (likely sunsetting v2 to avoid carrying duplicate cloud-hosting costs), distribute validator tooling, and onboard additional validators.

### External Partner Review

The team plans to engage its external timekeeping technology partner for a review of the mesh — ideally a service-level audit confirming the partner's hardware and software are being used correctly. The current implementation reflects the team's reading of the partner's documentation and prior discussions, and some adjustments are expected once the partner reviews it.

A consensus-related package shared by another contributor was run once through an AI agent for a preliminary read; the assessment was that the standard blockchain consensus already in use is more proven and simpler, that the package offered no clear advantage, and that its claimed improvement over BFT was not demonstrated. This was treated as a preliminary view from a single run rather than a final conclusion.

---

## Time Hardware

A substantial portion of the month covered physical time infrastructure. The team inventoried its available time cards and grandmaster appliances and discussed configuration. For the targeted precision, dedicated hardware is required: grandmaster appliances are kept air-gapped as shipped, distributing their signal over a PPS line to a receiver card, with the validator running the PTP-squared application on a separate machine. For home, edge, and development scenarios, running PTP-squared directly on small boards (such as a Raspberry Pi) was deemed acceptable at reduced precision, with analog PPS recommended for production to avoid wasting validator cycles.

Connecting to the partner's existing public time network was raised as a testing option, though the team prefers initially to run a small network of its own to build operational knowledge. Sourcing reliable PPS cables and receiver cards was flagged as a practical follow-up — cable termination is finicky and a good supplier is still needed — and GPS antennas for the clock network are still awaited; the latter does not block testnet work but is wanted ahead of mainnet.

---

## Strategy and Structure

### Positioning and Network Tier

The group converged on positioning the project around its time-mesh capability — a narrative accessible even to non-blockchain audiences, framing it as a decentralized timekeeping network with blockchain capabilities layered on top. By month-end this had sharpened into the view that the mesh already exhibits most defining properties of a blockchain (decentralized, distributed, attack-resilient, authority-free, assuring correct time without certificates), positioning the project as a genuinely time-first chain.

Several structural options were weighed. A parachain path was seen as technically possible but more enterprise-oriented and limiting for DeFi access; a layer-2 framing was explored on the basis that providing accurate time to another ecosystem is a genuinely novel capability rather than a mere bridge; and a white-label / "legitimacy layer" model was discussed where other projects could build on the chain's tooling and time guarantees. The team's stated preference is to pursue layer-1, while remaining open to a parachain or layer-2 if investor interest warrants. DeFi was framed as an eventual goal contingent on multiple conditions aligning, alongside other product tracks raised for evaluation including a data marketplace and a lower-cost hosting/compute offering.

### Public Repository and Announcement Sequencing

With the architecture stabilizing, the team assessed readiness to open a public-facing repository. The main blocker over recent months had been a shifting code base and uncertainty about what contributors would commit to; the expectation is that an upcoming meeting can confirm the chosen design, with subsequent changes treated as point releases. The proposed sequencing is to validate on a testnet running real time hardware, share the testnet publicly once a few nodes are running, open the code base roughly a week before announcements, and follow with the main announcements a few days later. Documentation, payment mechanics, and the economic numbers were identified as the items still to be finalized for clear communication.

### Internal Tooling and Community

The team discussed building an ecosystem of automation bots to manage contributions — reviewing pull requests, processing issues, and self-cycling on improvements — plus tooling to identify and tier the most valuable external contributions. A centralized shared-memory system was proposed as the coordination point for multiple agents, hosted on the team's high-performance server, with a possible internal "back office" endpoint for querying project knowledge, pitch material, and vision; authentication is largely in place, with plans to issue team logins including MFA. A separate early-stage initiative was raised to bridge the project's audience with a streaming-platform community, including token-gated private streams, with a stated preference to mature the application before making any associated asset tradable.

---

## Looking Ahead

- Lock in the architecture at the next meeting, then treat further changes as point releases.
- Complete local v3 testnet validation (time convergence, transaction tests, validator time-failure recovery), then deploy v3 and onboard additional validators.
- Finalize documentation, payment mechanics, and economic numbers for public communication.
- Validate on a testnet running real time hardware, then open the public code base ahead of announcements.
- Engage the external timekeeping partner for a mesh review or service-level audit.
- Source PPS cables and receiver cards; continue configuring time hardware ahead of mainnet.

### Targeted Milestones

| Milestone | Target |
|-----------|--------|
| Architecture lock-in | Next meeting |
| Public (experimental) testnet | Coming days to weeks |
| Public code base | ~1 week ahead of announcements |
| Public announcements | A few days after code base opens |
| Production apps on testnet | Around May |
| Mainnet launch | Summer (earlier considered possible) |
