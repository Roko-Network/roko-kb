# Roko Network Monthly Update

**Month:** January 2026

---

## Executive Summary

January 2026 was a month of concrete execution on the path to an incentivized testnet alongside a maturing commercial and tokenomics strategy. The team brought validator onboarding to a repeatable, end-to-end state — culminating in nodes joining the network and producing blocks within minutes via a two-step Docker-and-script flow — and tackled the month's central open problem: how to charge for transactions on a time-ordered chain that, by design, removes fee-based bidding. A two-part pricing model anchored on a burnable, tradable "time credits" token emerged as the leading proposal. In parallel, the team sharpened its go-to-market thesis around AI agent accountability as a first vertical, converged on a structure using the Rose application entity as investment custodian, and held a substantive consultation with timing-hardware partner Timebeat that opened a promising line of inquiry into building blockchain security on top of a time network's security.

---

## Development & Testnet

### Validator Onboarding Reaches End-to-End

The validator deployment flow moved from concept to repeatable reality over the month. Early sessions walked through provisioning — generating a mnemonic on the front end, funding and staking the address with the governance token, tagging it as a validator, and producing a script that runs a common binary with the testnet chain spec pre-compiled in. A key defect around EVM-versus-SS58 key formats was resolved so the validator key is injected in the correct location, and the node was confirmed running under Docker, producing beacons, with the prebuilt image published to the Roko Network packages on GitHub. By mid-month a freshly created validator successfully joined the network and produced blocks within minutes; the testnet was restarted with a shortened epoch to allow faster validator inclusion. Onboarding on testnet is now considered straightforward via a two-step process.

### Build & Distribution Pipeline

The team standardized node deployment around Docker — the image carries the prebuilt node binary and accepts the binary's normal arguments — while keeping compile-from-source instructions available for performance-sensitive operators. The target user experience is a single dashboard button that generates a script; the user runs it to pull the image, start the node, and expose local diagnostic dashboards (cached beacons, block production, health). By month-end, build automation was in place: pushes to the main branch produce macOS and Linux builds automatically within about an hour. Self-hosted CI/build infrastructure was favored over external providers whose fee structures may change, with public hosting retained as a publishing target.

### Testnet v3 and Local Testing

A v3 testnet branch was started, focused on cleanly re-enabling legacy (non-temporal) transactions — rewriting detection logic so plain transfers work without a special signed extension — and implementing the envisioned temporal transaction system in code. The current v2 testnet remains usable; v3 will replace it once the fee system and legacy-transaction support land. To support the refactors, a new local environment was built from scratch that runs three nodes locally, performs both temporal and legacy transactions, deploys the admin interface, and adds further validators, enabling faster iteration. Several genesis and sync issues were worked through along the way, including an epoch-randomness problem that caused beacon rejection and a hard-coded five-node testnet limit (a substrate testnet-specific setting absent on mainnet).

### Anti-Skipping: Mempool-Hash Consensus

Work advanced on a mechanism to prevent block producers from omitting or reordering temporal transactions. Because the mempool is gossiped peer-to-peer, an honest validator could build a block missing a not-yet-propagated transaction. The approach splits the mempool into time-framed eras and has validators broadcast a hash of each era alongside their beacons; a producer compares its era hash against those carried by the beacons it must include, and on a mismatch requests the missing transactions from a peer until the hashes align. Gossip overhead is minimal (one hash per beacon), but the potential slowdown to block production from multiple reconciliation rounds still needs to be measured — work the improved local environment now supports via overnight scenario runs.

---

## Fees & Tokenomics

### The Core Problem

A significant share of the month was devoted to the open question of transaction fees under time-based ordering. Because temporal transactions are ordered by time rather than by fee competition, the usual market mechanism that lets fees converge on a price no longer applies, and the network loses the organic congestion pricing that protects storage and memory. A simple fixed fee in Roko was considered but rejected as a sole solution, since it cannot track Roko's market price the way gas markets do. The team treated resolving this as a prerequisite for articulating tokenomics in investor materials, and the existing developer reprioritized toward it rather than adding headcount.

### Two-Part Pricing and the Time Credits Token

The leading proposal splits pricing into two parts: a static (optionally semi-dynamic) execution fee paid in Roko, and a separate temporal access fee. The access fee centers on a new fungible utility token — "time credits" — that is burned one-per-transaction to create a temporal transaction. Because credits are burned on use, supply is non-inflationary and the token never touches the ordering system. Critically, credits would trade on an open market (e.g., a DEX), restoring continuous price discovery without reintroducing fee-based ordering. The token was characterized as a pure utility token, seen as advantageous from a regulatory standpoint, and would be a third token alongside Roko and Power Roko (positioned as the governance token).

### Validator Incentives and Decay

It was proposed that validators mint credits as they produce time beacons — currently unrewarded work — giving them a second reward stream and making beacon production a core incentivized activity. Issuance would scale with the validator set, yielding a direct scalability formula, and validators could sell credits directly to clients as subscriptions, effectively becoming time-service gateways. A further idea explored making credits decay over time (linearly, tunable from roughly a week to a year) to discourage hoarding and shorten the trading loop. Later in the month the team also discussed a familiar "preload and drain" stablecoin-funded experience with automatic top-up, and a more experimental ephemeral, flash-loan-style settlement credit that exists only during a transaction to shield service providers from spot-market volatility. These remain proposals targeted for further simulation and parameter decisions.

---

## Validators, Hardware & Timing

### Hardware Requirements

The team refined realistic hardware specifications for validators and servers. The principal constraint identified is RAM — validators may need roughly 256–384 GB of fast memory per box to hold recent chain state in memory — against an expected multi-year RAM supply shortage. A cost-saving approach using partially populated blade enclosures was favored, setting a lower per-site minimum while leaving capacity to add blades as the network grows. A benchmark configuration discussed is a 6U blade enclosure holding up to ten systems, partially filled with PPS cards and optional GPUs, with overhead to run roughly two nodes per machine plus additional workloads. Testnet performance was deemed a non-concern given low early bandwidth; heavy RAM needs only materialize at high transaction volume.

### Redundancy and Resilience

Drawing on outside conversations about peer-to-peer fragility, the team planned for nodes losing connectivity or time-sync infrastructure failing. A proposed safeguard is an automated fallback to a centralized timing process when the network detects a sudden drop in beacon production, time validation, or validator count — keeping the chain operating while the cause is investigated. Work is underway on a semi-distributed timer PC: a master with launchable backups the system falls back on if the primary fails, deemed necessary for production uptime.

### Validator Hardware Attestation

A recurring question was how to verify a validator is genuinely running a higher-stratum timing clock rather than spoofing time. Ideas raised included signing a message with a secure hardware element to prove a node is backed by trusted hardware, and leveraging a time card's serial number for identification. The team noted it is easier to verify hardware at a point in time than continuously, and treated a hardware-attestation prototype as optional given that servers will carry TPM2 modules, reserving secure-element work for edge processing and high-value operations.

---

## Partnerships

### Timebeat Consultation

The team held a presentation-and-consultation call with timing-hardware partner Timebeat, walking through Roko's architecture — time as a first-class, consensus-established feature that removes timestamp-setting from the block producer to eliminate front-running and similar attacks — and seeking input on the timing side. On verifying genuine hardware, Timebeat noted their open time appliances and time cards carry unique MAC addresses that could serve as a custom signature checked against a database; the team flagged that public network information could let an operator claim another's MAC, steering the discussion toward what custom signature only the hardware could produce.

Timebeat demonstrated their PTP² system, a peer-to-peer mesh that forms a consensus of time rather than a hierarchical tree: connections are fully encrypted (X.509), a node deemed incorrect is demoted to receive-only until it realigns, and the system tracks reputation and "root distance" back to a known-good source while remaining monotonic. The discussion converged on a compelling possibility — that Roko could build a layer of blockchain security on top of the security already provided by Timebeat's time network, since timing quality scales with hardware investment and cannot be faked cheaply, resembling a proof-of-work signal. Timebeat suggested root distance, reputation score, and active-synchronization status as candidate components of a "proof of time," while noting that local relationship scores cannot be checked remotely at scale. Both teams identified this as a new, hard-to-scope intersection of timing and blockchain expertise worth investigating further. A follow-up hardware-requirements meeting was anticipated, with the partner expected to bring concrete rack and server figures.

---

## Business & Funding

### First Vertical: AI Agent Accountability

The leading candidate for an initial commercial vertical is AI agent auditability and accountability, motivated by emerging regulatory pressure for AI agents to prove their decision-making. The concept is middleware that writes agent actions on-chain with cryptographic timestamps and ordering, producing an immutable, replayable audit trail. Recruiting and talent-acquisition (HR) platforms were cited as an accessible entry point given existing domain relationships, with the possibility of onboarding an end client rather than requiring a major platform vendor to integrate first. The near-term goal discussed is a demonstrable HR-vertical proof or shareable MVP for investor conversations, targeted alongside a summer build.

### Investment Structure: Rose as Custodian

Because the DAO is not yet positioned to accept investment directly or manage distributions, the team converged on a structure in which the Rose application entity acts as investment custodian: funds flow into Rose, which issues grants (using an existing grant-and-legal framework) to pay developers to complete the substrate and timing work, while the network receives its fees and the contract layer its contract fees. This buffers investors from the DAO while keeping application ownership with its originators and preserving room for a decentralized approach. The team judged a straightforward product structure easier to sell than a governance-vote model, and discussed an illustrative framing of a low-eight-figure-percentage equity stake in Rose for a mid-single-digit-million investment. Ownership alignment among the four players — contributors/investors, the network, the contract layer, and the application IP — was acknowledged as needing definition but deferred as premature to finalize.

### Funding Approach and Investor Profile

For traditional family offices and private investors, a conventional structured pitch was favored — problem, solution, market sizing, and a multi-year growth narrative. Seed interest discussed to date has come from private individuals rather than institutional offices, in the low single-digit millions. Academic and scientific funding sources were identified as a distinct, appealing path warranting a separate deck given the network's research applications. The team also explored two investment pathways — a Web3 governance-model investment aligned with the DAO and a more traditional business-as-a-service model — and weighed delegated/liquid governance as a middle path, noting the regulatory environment has shifted significantly and remains fluid.

### Platform vs. Application Framing

A recurring theme was treating the network as open, decentralized routing-and-timestamp infrastructure — analogized to an open-source operating system — while individual applications layered on top may be proprietary. This avoids pigeonholing the network into a single use case while allowing specific verticals to be monetized, with the AI accountability product characterized as one application among many that drive transaction value back to the network. Public mainnet was estimated to require infrastructure investment in the low millions, whereas private, dedicated servers for a single partner application could be stood up sooner and more manageably — informing a dual-tier model of a public network service and an enterprise/corporate service tier.

### Financial Modeling

A financial-analysis effort began pulling multi-year datasets (three-to-five-year sets, moving toward ten-year sets) from several public data sources and running Monte Carlo simulations with multi-seeding to model scenarios over a five-to-ten-year horizon. Results are being kept internal until data quality is confirmed, with a plan to circulate the scenario list and simulation details for team feedback on coverage.

---

## Enablement Stack: Rose & Matrix

The project formerly referred to as Nexus was renamed Rose, with the software under development called Matrix. Rose is positioned as the enablement stack on top of the network, connecting the timing and contract layers into usable products; Matrix is the suite providing application infrastructure and a "last-mile" polish layer most blockchain projects lack. The motivating thesis is that putting any compute behind a price — via an audited escrow contract and the network's timing/measurement — enables an enterprise workflow and job-processing system, with agent-to-agent and system-to-system orchestration highlighted as the most important near-term application.

Components demonstrated or described included a workflow/orchestration tool (editable directly or agent-driven), local-first processing that uses available local compute before sending jobs to the network or cloud, packaging of workflows into portable bundles published to a private store or IPFS, and a memory subsystem (Matrix Memory) exposed as an MCP server using an event-and-job-queue model where jobs tie to on-chain tickets and escrow contracts. Roughly half the stack was reported at 80–90% completion and the remainder at 40–60%, targeted to be presentable by summer contingent on continued funding and developer hours. Several live demos hit bugs consistent with active alpha development. A prior grant proposal tied to this work was clarified as never having been paid out, with work continuing regardless.

The team also presented AIWG, an open-source AI workflow framework that front-loads planning into a structured, linked set of documents based on project-management methodology, providing guardrails that enable longer, more reliable agent runs and address the failure mode where agents lose context or loop without progress. It follows a waterfall-style documentation methodology — an adaptive intake process, then progressively detailed flows with gate checks down to near-pseudocode before a construction phase — and is intended to accelerate getting verticals to market, including the AI-accountability/HR vertical. The team agreed to try running the testnet work through the AIWG intake process.

---

## Incentivized Testnet: Credits & Anti-Gaming

The team designed a credit system for the incentivized testnet to track tester involvement so participants can be rewarded later. It tracks addresses interacting with the testnet, distinguishes regular users from validators, and gathers linked chain events via a modular configuration where per-address metrics each point to a tracking module. The first phase queries chain history directly (feasible while the chain is small), with a simple database planned for a second phase. A rewards-tracking application is in development that parses configurable on-chain events for activity such as transactions, staking, voting, and block production.

A gamification proposal would introduce tester levels — for example completing ten transactions, staking, acquiring Power Roko, participating in a vote, and running a validator as progressively higher tiers — simplifying reward distribution by rewarding by level reached rather than per-activity payouts, and potentially tying into a community badge or bot system across Discord and Telegram. Any community points would remain clearly non-monetary and decoupled from token value for compliance reasons. For anti-gaming, the favored approach gates the faucet behind a social-account link, limiting each account to a small daily amount of test tokens — providing sybil resistance and incidental marketing — since gating the faucet rather than address creation was deemed sufficient.

---

## Community & Marketing

### Roko TV and Streaming

An initiative to build a streaming presence — informally "Roko TV" — was announced, with a Twitch account under test as the basis for a channel running continuous content (recorded meetings, hangouts, and updates) to advertise the project and engage the community. Infrastructure is now in place to record a call and publish it online within a couple of hours, with the intent to move toward a rotating, TV-like list of videos with more professional production over time, pending member comfort with posting recordings, audio, and transcripts.

### Immersive Demos and Hardware On-Ramps

Creative engagement ideas were explored, including piping live audio/video streams into a 3D web environment with spatial audio (a "noclip" observability platform) where participants could gather virtually, and bringing custom 3D models such as project hardware into a shared virtual lab. The broader theme was that the project is multi-phasic, engaging different audiences — Web3, industrial automation, AI workflows, hardware — through whichever facet interests them. The team also discussed low-cost, approachable hardware projects as an on-ramp to get community members involved in embedded systems tied to the platform.

### Demonstrable Use Case

A recurring marketing theme was reaching a clear, demonstrable core use case — particularly MEV protection as a consequence of time-ordered transactions — as a near-term proof of concept and selling point for both Web3 and traditional-finance audiences.

---

## Tooling & Process

Several team members standardized on Linux for development and node operation, citing trust and privacy concerns. The team compared agentic coding tools and plan economics, noting AI is strong at generating dashboards but weak at debugging chain state, where it needs significant nudging, and that the persistent-loop approach is effective but token-intensive. A future direction discussed was an issue/ticket-driven workflow where contributors file tickets and work with a coding agent in a sandboxed, isolated VM, reducing direct CLI involvement. On cadence, the team consolidated to a single weekly Tuesday meeting with the Thursday DevOps meeting made optional/ad hoc, to protect development time given recent low attendance.

---

## Looking Ahead

- Complete legacy-transaction support and the fee system on the v3 branch, then promote v3 to replace the current testnet.
- Decide tokenomics parameters — execution fee level, credit minting rate per validator, and whether to apply credit decay — and simulate the transient/flash-loan-style settlement concept.
- Make the Docker image public and finalize the one-button validator deployment flow.
- Measure the mempool-hash anti-skipping mechanism's impact on block-production time.
- Hold the hardware-requirements meeting with Timebeat for concrete rack and server specifications, and scope whether the default substrate consensus layer can be modified to leverage time-network security.
- Work toward a demonstrable HR-vertical MVP for investor conversations and continue developing the pitch decks, including a separate academic/scientific deck.
- Confirm financial-analysis data quality, then circulate the scenario list for feedback.
- Build out the Roko TV channel and prototype the live-stream-into-3D-environment demo.

---

## Upcoming Milestones

- **Incentivized Testnet:** Validator onboarding repeatable; v3 branch to land fee system and legacy transactions before replacing v2
- **Matrix Platform:** Targeted to be presentable by summer, pending continued funding
- **First Vertical (HR Accountability):** Working proof/MVP targeted alongside the summer build
- **Mainnet:** Mid-year at the earliest, contingent on hardware and infrastructure buildout
