# Roko Network Monthly Update

**Month:** June 2026

*Month in progress — covers meetings through June 11.*

---

## Executive Summary

June 2026 centered on a major rework of the time mesh consensus and its consequences. The consensus was refactored to reward time quality over route distance, deployed to testnet, and put through adversarial testing that completed with less performance impact than expected. The change clarified that validators without dedicated time hardware can no longer serve as network anchors, surfacing a hardware gap: the network needs at least three properly configured anchors to operate at full capability and currently has one. With the contracted technical engagement reaching its planned conclusion, the team began organizing a full handover of network operations and turned attention to funding and go-to-market strategy in a difficult investment climate — leading with auditability and recurring enterprise revenue rather than the public chain — alongside a more assertive marketing push and a proposed equity-based continuation of the infrastructure partnership.

---

## Consensus Refactor & Testing

### Time Quality Over Route Distance
The team completed a significant rework of the time mesh consensus and deployed it to testnet. The prior design weighted route distance between validators heavily, penalizing geographically distant nodes — appropriate concern for a chain meant to be distributed worldwide. The consensus was reworked to reward time quality over route distance, decoupling the precision a validator produces from the time it takes to propagate that signal to peers. Loosening the route-distance requirement raised overall mesh time precision to roughly 200 milliseconds, which the team considers still exceptionally strong for a blockchain. The rewrite was the result of two to three weeks of investigation and was described as a heavy rewire of what the time mesh expects from participants.

### Optimistic Validation and the Cheating Window
The new model shifts toward an optimistic approach: rather than relying on a converged mesh time for blocks, the network trusts each validator's local time when it stamps its own block, then works to prove and slash dishonest behavior. Mesh time is retained primarily to discipline newcomers and help them start on solid footing. A validator can still cheat timestamping within a roughly fifteen-millisecond window, but doing so is detectable and results in slashing — a small window relative to a two-second block time. The team noted the tolerance could narrow as more validators join, though that is not guaranteed given the physical limit of propagation delay between globally distributed validators. The discussion drew an analogy to standard GNSS time protocols, which similarly accept a propagation tolerance and use regular challenges to force time providers to improve quality. The team plans to revisit whether the tolerance can be tightened once the network reaches around twenty nodes.

### Validation Outcome
Testing of the reworked consensus and rewards system finished with less performance impact than anticipated. The team expressed full confidence that the refactor was the correct technical move. The change is purely technical and does not alter hardware requirements, chain behavior, or the time-quality guarantees from a product or marketing standpoint. The team also reinforced the lengthy validation cycle for consensus changes: even a small percentage change to consensus code requires roughly two weeks of soak time to surface edge cases across epochs.

---

## Validator Anchors & Hardware

### Anchor Requirement Surfaced
A key consequence of the refactor: validators running on Amazon cannot serve as network anchors because they lack dedicated time hardware. The network requires at least three anchors to operate at full capability, and at present only the GNSS-equipped Pi node qualifies as a true anchor. As a result the network is running in a logging mode, and the flag that rewards good validator behavior cannot yet be activated. The final validation test requires three properly configured anchor devices, which the team does not currently have the hardware to run. With only four validators online, certain attack scenarios — including single-validator attacks — cannot yet be fully tested, but every test that can be run is being executed as part of the standard validation routine.

### Path to Additional Anchors
A previously shipped hardware node, already in the hands of a team member, was identified as a path to a second anchor. The hardware security module on the device need not be touched to bring the node online — the validator and time-beat software can be configured independently of the HSM, with key-management decisions deferred to a later session. A coordinated effort was proposed in which members already familiar with identical hardware would document their setup and troubleshooting data so the infrastructure team, who know the software but not the hardware, can stand up their node. A target of roughly three weeks to get the hardware online was set, with a one-week timeline considered too optimistic. The team also flagged a need to import more time-grade hardware overall.

---

## Network Operations Handover

Because the contracted technical engagement is reaching its planned conclusion, the team agreed on a full handover of network operations over roughly the next three weeks. The plan covers discontinuing the paid Amazon validators (running at a modest recurring monthly cost), migrating the block explorer to infrastructure the Roko team controls along with a DNS and domain transition, and updating documentation. The infrastructure lead flagged the need to verify and remove any lingering administrative access tied to the outgoing team before any move to mainnet, noting this is good practice regardless of how the relationship continues. The team stressed that cutting over the current setup without standing up the two additional anchors would leave testnet in a degraded state, so the priority is to deliver a fully functioning testnet at handover.

---

## Funding & Go-to-Market

A substantial portion of the month's discussion addressed funding in a difficult market. The broader crypto and blockchain investment climate is weak, with blockchain-related sessions drawing the smallest audiences at recent industry events, and ICO and token associations make direct blockchain investment a hard sell to traditional VCs and angels. The leadership position discussed was to lead with the network's auditability and traceability value — for AI agent sessions, robotics, and financial transactions — and to pursue recurring revenue through enterprise and private deployments rather than positioning the public chain as the primary pitch. The team noted it is unusually far along for its stage, citing roughly five years of R&D and several million dollars of cumulative investment across the founding group, which supports a seed-stage narrative once revenue begins.

Several revenue and structuring paths were explored at a high level:
- Building products on the team's wallet and data-custody integration and billing for them ahead of a fully functional chain.
- Standing up corporate entities (with US-based structure favored for accessing US customers and investment) that contract with the network and drive utilization costs onto Roko.
- Reseller and value-added-reseller arrangements for time nodes.
- Selling or licensing private deployments of the chain.
- Framing the network as a time bridge servicing other chains, in addition to its layer-one identity.

A candidate partnership with a token-economy ecosystem was discussed and assessed as a poor fit for the funding scale required.

---

## Partnership, IP & Marketing

### Continued Partnership
The infrastructure lead expressed a strong desire to remain involved beyond the contracted work, proposing a shift from work-for-hire to an equity-based partnership and an ambassador role to help push marketing and adoption. The team welcomed this and committed to negotiating an equitable arrangement, with candid acknowledgment that all participants have invested heavily and a shared insistence that the project will be carried forward.

### Intellectual Property
Patenting was raised as a forward-looking item. The team discussed pursuing protection on the consensus mechanism and related network-signaling methodology, noting potentially USPTO-patentable methods around the integration of timing into blockchain consensus, while flagging the need to be mindful of prior related work and to coordinate with the relevant third party.

### Marketing Push
Leadership called for a more assertive marketing posture, arguing that the project's biggest current bottleneck is under-communication rather than technology. Planned actions include refreshing the documentation site and website, publishing technical and narrative content on a regular cadence, establishing a recurring podcast schedule, and assembling a community outreach effort. A consolidated server-configuration repository was identified as the shared reference for time-appliance setups, with all members asked to contribute their node configs and notes so the material can eventually feed validator-facing documentation. The team also discussed preparing a publishable paper to support the marketing effort and showcase the work.

---

## Smart Contract Tooling

A community developer reported forking the Roko GitHub and deploying a range of experimental smart contracts to testnet, building subnet-style demos — including a prediction-market concept — with working front ends. There is no dedicated on-chain indexing for smart contracts; contracts are deployed and detected through standard EVM transaction pathways, while the block explorer maintains awareness of deployed contracts and can accept verified source code. On reverse-engineering, the team noted that unverified bytecode should generally be treated as effectively open-source given modern decompilation and AI tooling, especially for simpler contracts. The team recommended verifying deployed contracts so their behavior is visible, and suggested publishing example contracts to a repository to demonstrate what can be built on Roko. A separate consensus approach measuring the phase noise of a validator's clock as an additional probe was also discussed, with a plan to prepare a short write-up and pseudocode and test it against the developer's forked testnet environment.

---

## Looking Ahead

- Complete the full handover of network operations to the Roko team within approximately three weeks, including discontinuing the Amazon validators and migrating the explorer to team-controlled infrastructure with a DNS and domain transition.
- Bring at least two additional anchor nodes online to reach the three-anchor minimum and enable the final consensus validation test.
- Configure the previously shipped hardware node's validator and time-beat software, deferring HSM key-management decisions to a later session.
- Verify and remove any lingering administrative access before any mainnet transition.
- Refresh the documentation site and website, contribute node configurations to the shared server-config repository, and prepare publishable content and a paper to support the marketing push.
- Pursue enterprise, reseller, and private-deployment revenue paths and explore US-based entity structuring with legal counsel.
- Negotiate an equity-based continuation of the infrastructure partnership and evaluate patent protection for the consensus and signaling methodology.
- Publish example smart contracts and verify deployed testnet contracts through the explorer.
