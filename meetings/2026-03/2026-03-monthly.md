# Roko Network Monthly Update

**Month:** March 2026

---

## Executive Summary

March 2026 saw the network consolidate around a unified temporal transaction model and resolve, after months of iteration, both the fee design and the transaction-inclusion mechanism. The dedicated time RPC was removed in favor of treating every transaction as a timestamped temporal transaction, the heavy "court" reconciliation system was replaced by a far simpler deadline mechanism that shed roughly six thousand lines of code, and a fee priority queue emerged as the agreed approach to fair timestamping under load. On the tooling side, a new BlockScout-based block explorer was deployed at roughly seventy percent feature completeness, foregrounding the network's time identity. In parallel, the business track sharpened its focus on funding, pitch materials, a contributor grants program, and recurring revenue, while exploratory conversations opened up geospatial, defense, and agent-first product directions. Production deployment and a coherent fee-and-reward structure stand as the principal remaining hurdles before mainnet.

---

## Consensus, Inclusion, and the Deadline Mechanism

### Unified Temporal Transactions

A significant shift this month removed the dedicated time RPC: all transactions are now timestamped and treated uniformly as temporal transactions, eliminating the earlier model where users purchased and spent separate time tokens. With the RPC gone, the chain returns to the standard substrate fee system, and signing moved to standard signatures carried via the temporal mesh — a change substantial enough that the testnets were reset to support rebuilding tooling against it.

### From Court System to Deadline

Early in the month, the "court" system was the only mechanism preventing validators from censoring transactions. It was considered safe but added roughly two to three seconds of reconciliation latency to transaction inclusion. Extensive stress testing then revealed a sharper limit: beyond about fifty transactions per court, a block producer committing a court had to locate every referenced transaction by hash and recompute hashes, and slow mempool propagation could cause the producer to miss the block. The sweet spot of roughly five seconds and fifty transactions per court capped throughput near ten transactions per second, judged insufficient. The root cause traced to gossip-protocol limitations and uncontrollable propagation timing.

Recognizing that the failure scenario was rare and required artificially unstable test nodes to reproduce, the team replaced the heavy reconciliation machinery with a simpler deadline for transaction inclusion. This removed roughly six thousand lines of code, passed the same stress tests, and retained only a small, hard-to-trigger theoretical chance of a transaction failing. Anti-censorship safeguards stayed in place, with validators heavily penalized for failing to include transactions. The change was pushed into the main protocol with a marker allowing reversion to the old approach.

### Deadline Validation

Rather than reconstructing rare failures by hand, the team ran the full regression suite for five days, firing many transaction types with varied delays across nodes — including a deliberately disruptive node ("Charlie") designed to delay, fail to respond, and sync improperly. Results matched expectations: no regressions, the transactions that previously suffered significant court-syncing delays no longer did, and zero transactions were rejected despite the retained theoretical possibility. The team considers the issue effectively resolved while acknowledging it is very hard to simulate. One participant emphasized careful tuning of the slashing mechanism and building worst-case scenarios so honest validators are not unfairly penalized.

### Eventual Consistency and Future Block-Producer Election

The team discussed the tension between the mesh's eventual-consistency model — nodes can drop off and rejoin, and are not all updated simultaneously — and the need for reliable ordering. A proposed future direction: once the network is large enough, elect a provable subset of validators known to hold the required transactions to produce a block, with nodes gossiping hashes of their ready mempool contents to signal readiness. This was agreed as a sound long-term path rather than an immediate need, since the problem it solves is rare on a healthy network.

### Time Mesh Implementation

The team re-implemented the PTP-squared mesh protocol rather than relying on the time-hardware vendor's software, because deeper integration with the substrate code was needed for features like automatic flashing and mesh-state-driven blockchain actions. The protocol is well documented and carries no licensing restrictions, though quantifying any performance loss relative to the original vendor implementation is difficult without access to that source. The vendor hardware remains fully usable. By early March, block time had been stable for roughly three weeks and the temporal commitment mechanism was considered validated, with a testnet running three validators in a converged mesh showing a consensus offset around 21 microseconds.

---

## Fees and Incentives

### The Race for Timestamping

Removing the time RPC introduced a new dynamic: transactions enter a pool of untimestamped items, and the first validator to see a transaction timestamps it. Under simulated load (around 500 transactions per minute on the weak testnet), this pool began to grow, requiring a selection mechanism. The proposed and later adopted solution favors higher-fee transactions for faster timestamping, preserving fee competition and an open market. Higher fees yield earlier, more precise timestamps; under heavy load the difference could reach tens to a few hundred milliseconds.

### Fee Priority Queue

By month-end, the fee priority queue was presented as the conclusion of months of iteration on the fee problem. As mempool transactions accumulate, displayed queue depth and average weight rise, incentivizing higher fee tiers for sooner timestamping. This does not change how long a transaction takes to mine — only how quickly it is timestamped, which matters for ordering-sensitive obligations. The team noted that staying below roughly one hundred milliseconds of timestamping delay is advisable to avoid potential front-running. A notable property: when the chain is quiet, users pay minimal fees, but as adoption and congestion grow (for example during volatile market periods), collective fees rise sharply. The fee-priority system can be disabled via governance without endangering the chain, though it remains enabled by default. The fifteen-second inclusion deadline is likewise exposed as an enforced-by-default safety feature, judged sufficient for at least the first two or three years.

### Open Questions on Rewards

A recurring open question was the absence of any direct reward for timestamping, mining blocks, or processing transactions — the network functions as long as any validator performs the work, but designing the incentive remains unresolved. The team discussed enabling block rewards plus transaction fees as the simplest starting point, with timestamping handled separately since it is not a native substrate feature. The emerging consensus was to ship a simple fee structure on the testnet, gather feedback from real users and partners, and refine — while recognizing that investors will expect a fully fleshed-out structure before mainnet, given that validators face meaningful hardware investment and will ask where their revenue comes from. Because timestamping provides MEV protection users are willing to pay for, an initial higher price (a fraction of the MEV savings), gradually lowered with community feedback, was floated to avoid a premature race to zero. Validators were also discussed as having an incentive to advertise and protect their RPC endpoints so that timestamping distributes across many nodes.

---

## Explorer and Developer Tooling

### A Proper Block Explorer

Existing monitoring relied on a wallet, an admin dashboard, and a lightly modified Polkadot.js explorer that lacked a database and could not search transactions. The plan adopted mid-month was to fork BlockScout — the most feature-complete open-source explorer — and rewire it to the network with AI assistance, with a fully operational explorer estimated as achievable within about a week and lower ongoing maintenance than running two explorers. A noted nuance: BlockScout targets EVM chains and is blind to substrate-specific interactions, so substrate-level access remains important even though precompiles expose staking, power, and balance operations.

By month-end the explorer was deployed at roughly seventy percent feature completeness, styled with the network's fonts and colors and foregrounding its time features. The main page surfaces mesh quality, active validator count, mesh convergence state, total blocks, block time, unique wallets, and consensus time. Transaction detail views show two time sources — block time (truncated to milliseconds on the EVM side) and the full-precision nanosecond timestamping time — with an internal node mapping linking EVM transaction hashes to their substrate versions to recover the true timestamp. The developer section lets anyone claim test tokens and stake or unstake the power token via MetaMask, with testnet unlock periods compressed to about a minute versus a production two weeks. Substrate-wallet connection and in-explorer governance were judged nice-to-haves rather than must-haves.

### Solidity Temporal Precompile

A precompile was added exposing the current block's mesh timestamp to nanosecond precision from within Solidity, demonstrated through an auction smart contract that stores each bid's mesh-precision timestamp to make front-running difficult. Contract developers gain access to the timestamp of the transaction currently executing — not just the block timestamp — enabling contracts to reject transactions not included quickly enough. The team planned to let an AI agent attempt to front-run the auction with full chain access as a focused adversarial audit of the ordering system.

### Agentic-First Data Access

The team agreed the primary consumer of explorer and chain data will be agents rather than humans, and that an agentic entry point should be prioritized — framed less as a dedicated MCP server and more as enriching APIs, shoring up Swagger specifications, and providing clear examples and documentation. With validators now timestamping transactions themselves, the rationale for a fully custom wallet is reduced, and standard substrate wallets and MetaMask are already compatible; a custom data wallet remains in the broader roadmap.

### Outstanding Hardening

A heavy documentation refactor remains, and the containerized node deployment needs rebuilding or verifying to simplify joining the network. The validator onboarding tab was expected to be broken in the unified-transaction version. The team also flagged a need to audit EVM-specific extrinsics for any transaction-pool bypass, since an earlier discovery showed certain calls (such as sudo calls) bypassed the pool and went un-timestamped — a serious attack vector that was fixed for the known case but must be checked across the EVM path.

---

## Business, Funding, and Contributor Programs

### Funding and Deliverables Focus

The business team sought a clear set of monthly deliverables beyond the central priority of funding, acknowledging that members are working in separate zones until milestones — mainnet deployment, validator onboarding documentation, and a clear path to recurring revenue — are met, at which point a formal business plan can be formalized. An early invoicing and Stripe setup was noted as newly operational, with some initial inbound interest already arriving.

### Pitch Materials as Top Priority

Pitch decks and pitch material were ranked first, noting the technology spans multiple use cases and sectors pitchable to both technical and non-technical audiences. A clear articulation from the L1 team on how the network reaches its milestones was identified as a needed input.

### Contributor Tracking and Grants

A second priority was a system to track meaningful contributions from people outside the core team. A rough grants-program outline could be refreshed now that the L1 architecture is clearer. The concept involves a dedicated grants page, authenticating contributors by connecting a GitHub identity to a web3 wallet, and issuing a non-transferable on-chain asset to backtrack contributions to the DAO — tying into governance and tokenomics through how participation maps to distributed power. Decentralized-identity approaches were discussed as eventually unavoidable, using an encrypted, user-held data model where the system can validate asset holdings without exposing unencrypted data. The team agreed to architect contributor onboarding, inference-endpoint metering, and security review toward a working prototype targeted for end of April.

### Payment Rails and DAO Research

Work continued on payment metering and an HTTP 402 / X402 validator setup using a third-party RPC provider key, giving practical experience taking in funds before generalizing to a network-specific, white-label version. A proposed near-term task was using the agent tooling's auto-research capability to distill governance best practices from the top DAOs by total value locked; one participant had already produced a markdown distillation covering roughly the top seventy DAOs, observing that insight quality degrades further down the list and that the value lies in identifying pitfalls in smaller-to-mid-cap protocols. The team discussed wrapping this in a constrained, application-specific research pattern around scheduled jobs, using the DAO example as a ground-truth test harness while guarding against reward hacking.

---

## Positioning and Product Strategy

### The Physics Moat

The team framed the network's defensibility around physics: the time mesh requires real hardware and validator coordination that cannot be faked in software, and replicating temporal ordering on an existing chain would mean rebuilding an equivalent system from scratch. Potential business directions discussed at a high level included a decentralized time oracle or timestamping service, a temporal-ordering layer, integrations with existing oracle networks, and comparative analysis of how applications on other chains would perform on this network. Extending MEV protection to other chains is difficult because it would require migrating liquidity, so early adopters are more likely those interested in the time feature itself; a strong working prototype was identified as a prerequisite for serious partnership conversations.

### Geospatial and Defense Exploration

A substantial portion of one call explored geospatial applications. A discussed low-cost RTK-style device — roughly a Raspberry Pi-class board with cellular connectivity — combined with the network's high-fidelity timing could turn ordinary phones into accurate survey instruments and support a training-data acquisition marketplace, with low-cost municipal surveying as a public-facing application. A related concept was pairwise distance estimation: time-protocol packets exchanged between peers accumulate a minimum observed one-way delay converging toward true propagation delay, so the mesh could in principle build a pairwise distance matrix and, at sufficient node density, triangulate device positions — a positioning capability that also raises surveillance considerations.

For defense, the team discussed how field assets with limited infrastructure could attest presence and coordinate cascading actions simply by signing a timestamped transaction tied to a public key. A debated point was whether a public, trustless mesh is suitable for defense given that participating nodes could expose position information; one view favored a separated, military-only private network, while another argued the core value is precisely that no single nation-state controls it. The team agreed the public and defense threads are distinct, and that defense framing and customer discovery would benefit from contacts with genuine military-domain experience — drafted articles on these topics still require refinement by someone with that background.

### Data Architecture and the Secure App Pattern

Updates covered a data-architecture and graph system for AI — a "data wallet" intended to run on the network — and a companion browser-based component running roughly seventy percent of the full system in-browser. This enables a Proton-style architecture where user data is encrypted on servers and a thick client downloads and unpacks sharded encrypted files locally, keeping servers simpler and the system highly secure. Demonstrations showed multiple applications sharing one data system through app tenancy, with full-text search, flat tags, hierarchical tagging, and the concept of embedding sets — search filters producing scoped embeddings for production use. Discussion explored the trade-off between heavily structured tagging and a rawer embedding approach that avoids over-constraining retrieval.

### Agentic Operating System and Distribution

A broader thread covered the team's parallel work on an "agentic operating system" — a stack combining model runtimes, OS substrates with secure secret and key handling, a coordination layer, and UI tooling — working toward running multiple internal agents and enabling external users, with Stripe and HTTP 402 payment flows intended to generate recurring revenue that supports investor conversations. Emphasis was placed on security: controlling and safely halting agents, role-based access modeled on organizational structures, internal key management, and resource isolation. The team contrasted its approach with less secure single-loop assistants, noting that persistent agent loops, session restart, and context management are already supported, and reported running smaller local models (roughly 4B–90B parameters) for medium-to-long-horizon tasks. As a distribution mechanism, the team discussed packaging an agent-first, well-documented, project-branded NPM package that handles wallet creation and payment authorization automatically on install. An intent-based DeFi execution engine — exposing a CLI and MCP, letting agents interact through intents rather than raw contract calls, with automatic external cosigning so agents act without exposing private keys — was raised as a possible network-stake addition. The team reiterated that a DEX-style "killer app" is not yet viable due to liquidity requirements, so a value-creating application independent of deep liquidity should be identified instead, and agreed to hold a dedicated session to integrate roadmaps across the data system, agent tooling, and white-label plans.

---

## Tooling, Compute, and Meeting Infrastructure

The team discussed shared API access for AI coding tools, current token allowances, and experiments running self-hosted models on cloud GPUs, found more affordable than expected, with access to higher-end GPU hardware confirmed and authentication work ongoing. A separate experimental effort integrated a vectorized short-term memory system for agents — fact and entity extraction into the data system, dynamic context injection, and automatic compaction every few turns — aiming to demonstrate long-term-memory conversation. The team also evaluated alternatives to the current meeting platform amid recurring connectivity issues, including a self-hosted option built and tested by a team member featuring per-participant speaker-diarized transcription, rolling summaries, deliverable detection, and open-question tracking, with potential white-label and data-system integration. A peer-to-peer file-transfer tool used during calls was noted as notably useful.

---

## Looking Ahead

- **Production deployment** remains the primary remaining hurdle; the team considers the code stable enough to know what to deploy and how.
- **Fee and reward structure:** ship a simple structure on the testnet, gather real-user and partner feedback, and refine toward an investor-ready model before mainnet.
- **Block explorer:** close the remaining substrate-side feature gaps and continue enriching agent-facing APIs, Swagger specs, and documentation.
- **EVM hardening:** complete the audit of EVM-specific extrinsics for transaction-pool bypasses; finish the documentation refactor and rebuild/verify the containerized node.
- **Adversarial audit:** run the planned AI agent front-running attempt against the auction contract to stress-test ordering.
- **Business track:** produce pitch decks with L1 milestone input, refresh the grants program and architect contributor onboarding and metering (prototype targeted end of April), and continue defense/geospatial customer discovery through domain contacts.
- **Integration session:** walk through each member's work — data system, agent tooling, white-label plans — and integrate roadmaps by actively using each other's libraries.
