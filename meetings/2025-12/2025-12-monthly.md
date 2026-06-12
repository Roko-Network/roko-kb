# Roko Network Monthly Update

**Month:** December 2025

---

## Executive Summary

December 2025 saw the team push toward testnet readiness while turning its strategic attention to fundraising. The validator onboarding platform was built and deployed, the temporal transaction system advanced through several hard problems, and the synchronized clock network was targeted to come online by month's end. In parallel, a series of business sessions — several with an external financial advisor — worked to translate Roko's hybrid timing-plus-blockchain model into an investor-comprehensible pitch, converging on a core thesis of deterministic ordering, settlement, and auditable execution. The month closed with funding established as the central priority and a plan to enter the new year with working demos and a defined core product.

---

## Development Progress

### Validator Onboarding Platform

The administrative platform for validator onboarding moved from near-completion to deployment over the month. Built in Go, it connects to the chain, automatically tracks chain status and the temporal time window, and surfaces validator states and beacon information for debugging. Validator creation is fully automated: a single action generates keys, sets the validator's balance, activates it, and returns a short set of run instructions, removing the need to work through the full documentation. A faucet feature lets users request testnet tokens. A frontend interface and Docker images for simplified node deployment are planned to further streamline onboarding.

During deployment, the team uncovered and fixed a bug in how administrative (sudo-key) transactions interacted with the new temporal transaction system — transactions lacking certain fields were being downgraded to normal transactions, stripping required admin flags and breaking the sudo key.

### Temporal Transactions

Work on the time-ordering system for transaction sequencing continued throughout December. The team plans to proceed with the time RPC as the authoritative time source while embedding beacons in transactions for later evaluation as a potential replacement; a flag was added to allow the time RPC to be disabled (via sudo key or community vote) in favor of beacons alone. The current assessment is that beacons and fallbacks are not yet robust enough and still leave attack vectors, so the time RPC remains preferred — it is fast, provable on-chain (and so need not be trusted), and keeps the chain lightweight.

Backdating prevention remains the hardest open problem, since the only rigorous defense is witnesses, which are difficult in a gossip network. A separate issue — block producers omitting temporal transactions that validators expect, due to slightly differing mempools — is being addressed with a "magic number" mechanism that piggybacks on the beacon system and propagates faster than transactions themselves to signal that unseen transactions exist. This work was nearly complete and is to be finished as testnet validators come online; it is not required for initial testnet play. The team also noted that BitTensor recently implemented a centralized encrypted mempool to address MEV — an approach Roko had previously considered but deprioritized in favor of a more decentralized design.

### Wallet & Documentation

Development began on a dedicated Roko wallet — a streamlined version of Polkadot.js focused on balance display, transfers, and chain connectivity, with internal debugging tools, intended as the primary interface for testnet demonstrations. The documentation site entered final review with improved diagram rendering and presentation polish, with an announcement planned to accompany its launch.

---

## Infrastructure & Hardware

### Test Chain Validation

The test chain ran to roughly 375,000 blocks without consensus issues. A single cloud instance running five validators was observed to be RAM-constrained, with usage measured at approximately 350 MB per validator — a useful baseline for future capacity planning.

### Synchronized Clock Network

By month's end the team was targeting bringing the synchronized clock network online within the week. Systems were rebuilt across the infrastructure lead's network, another thorough security audit was completed, and VPN infrastructure to securely bootstrap and distribute the time signal was under construction (aided by a mesh-VPN tool). Source code deployment to machines was expected to begin within 24 hours of the month-end session, with public-facing repositories planned for release within a couple of weeks of testnet going live — a deliberate hold to allow testing to surface any issues first.

### Community Node Hardware

The team continued evaluating affordable hardware configurations for community node operators, including the OCP Time Hat and various single-board computer options, with the goal of lowering the barrier to entry. New server hardware was expected to arrive early in the month, and a hands-on session was planned to help a less technical member set up their single-board computer and join the network — part of broader work to make onboarding easier for users needing extra help.

---

## Business & Funding

### Fundraising as Central Priority

Securing investment became the explicit central priority during December. Several leads were under evaluation — including potential grants and an investment connection in the UAE — though none provided immediate funds. The consensus was to keep the team together month-to-month while accelerating investment outreach and to enter the new year with working demos to build investor confidence. A contributor's proposal for a flat monthly retainer (covering time plus the servers and network infrastructure they operate) was acknowledged; the team agreed to fulfill one month to stabilize the near term, consider a modest end-of-year contributor distribution, and revisit month-to-month, while reserving treasury funds for foreseeable new-year costs such as audits. The month closed with a frank acknowledgment that funding will take time and a "dirty grind," paired with a shared commitment to keep momentum.

### Pitch Deck & Use of Funds

The team began assembling an investor pitch deck, prompted by interested parties asking for a straightforward proposal stating how much is being raised and how funds will be used. A participant with associate-side pitch-deck experience offered to help structure a standard deck (market sizing, use of funds, valuation, competitors, problem and solution). The group acknowledged that Roko's hybrid PTP-timing-plus-blockchain model is novel territory with no direct comparables — framed as a blockchain primitive without established competition. The planned approach starts from tiered development estimates (what roughly a one-million versus a five-million spend would each deliver) and layers on peripheral costs (certification, auditing, advertising, business development, mainnet launch), noting development is only a fraction of total spend. A use-of-funds one-pager mapped against the DAO distribution model was identified as the immediate priority, with an initial draft targeted around January 1st.

### Investment Philosophy & Governance

The team articulated a guiding principle for taking on investors: maintain management control of the project and the DAO, distribute influence across multiple investors rather than concentrating it, and avoid granting any single party veto power. The current governance model was described as fluid and still largely centralized — a small set of active community members vote through a centralized forum on a one-token-one-vote basis with a historically high approval rate that may partly reflect speculative holders rather than deep technical understanding. The stated goal is to transition toward a decentralized model in which validators running network hardware become the primary voters, with holders able to delegate voting power to trusted validators.

The team reiterated its two-entity legal structure: a foundation representing the DAO and holding assets, and a wholly-owned corporation that executes contracts and developer distributions, with a multi-signature wallet controlling treasury movements. A discussed concern is that the infrastructure lead remains, on paper, the ultimate beneficiary today; the team wants to formally establish token holders as beneficiaries once decentralized governance is in place. Views differed on timing, with one favoring giving the L1 at least a year in public operation — through certification audits and back-testing — before launching public on-chain governance, using that window to develop the substrate pallets that would automate treasury actions.

---

## Strategy & Positioning

### Defining the Core Value Proposition

A recurring theme across December's strategy sessions was precisely articulating why Roko fuses timing services with blockchain. The discussion converged on the view that Roko's highest-value proposition may be **ordering, settlement, and auditable execution rather than timing alone**: work written immutably to the blockchain, with validators concurring, removes the need for after-the-fact auditing — framed as a potential "game changer" that could displace traditional audit work and position Roko as a step beyond existing cloud-compute offerings. An advisor questioned whether Roko needs to resell PTP timing as a service at all, suggesting the timing partner may be better used as an ingestion tool while Roko's core product is described as deterministic ordering and auditable execution.

### The "Last Mile" and "Business in a Box"

The team positioned Roko's distinct opportunity as the "last mile" — bringing high-stratum, near-clock timing precision into front offices, labs, and homes rather than only data centers, where timing equipment is already commonplace. This connected to a "business in a box" concept: enabling small businesses, brokerages, and family offices to perform custodial and financial-management functions (DeFi-based custody, payroll, treasury management, compliant timestamped record-keeping) that today require bank-grade infrastructure. The discussed model envisions smart contracts automating the legal and compliance layer, fraud-detection and address-screening capability so operators do not facilitate illicit activity, and third parties building applications atop Roko via existing-tool APIs rather than Roko building them in-house. A detailed worked example (a small medical practice using over-collateralized DeFi lending as a "self-paying loan") was used illustratively to convey the thesis, not as a committed product plan.

### Banking Backbone & Industrial Applications

The team explored whether delivering legitimate timing to the edge for financial use may require a private Layer-2 backbone for bank-grade communication, raising potential partnerships with ISPs and global-backbone providers offering dedicated leased-fiber connectivity. A cost-versus-competitiveness tension was flagged — a Layer-2 backbone and stringent timing targets make transactions inherently more expensive than plain blockchain — and whether a full backbone is required was left as a key open question. On the industrial side, the team noted an informal connection with the head of R&D at a major industrial tool manufacturer and proposed a write-up on manufacturing-vertical applications (quality-assurance monitoring, equipment failure detection, oil/gas pipeline monitoring), observing that OCP TAP compatibility lets Roko improve existing systems rather than require rip-and-replace.

### Timing Partner Relationship

Discussion addressed how central the London-based timing service provider should be. The provider — which developed an amendment enabling a distributed, non-hierarchical concept of time sync — was described as potentially supplying master-clock infrastructure, network certification, and international regional certifications, allowing Roko to focus on the edge rather than a large self-managed core investment. The team indicated it has already purchased several clocks and a master clock from this provider (some purchases including a limited allotment of development time) and expects functional test infrastructure by the end of January. Global service coverage was estimated at low-eight-figure infrastructure spend, with clocks placed in roughly a dozen strategically and legally favorable data-center sites. The team noted the provider is among very few organizations worldwide offering a decentralized timing-network approach, raising a vendor-dependency consideration worth examining.

---

## Community & Marketing

The team discussed an expanded marketing push tied to its new public-facing assets, including a weekly newsletter and a broader presence across channels. A contributor offered to take ownership of LinkedIn outreach, motivated by feedback that the platform is effective for sourcing investor and partnership contacts, and the broader marketing plan is being documented so responsibilities can be distributed. The team also discussed warming up to regular informal, authenticity-first live Q&A sessions on X (Twitter), and noted an emerging relationship with an AI and security-focused content collective whose larger channels could eventually amplify announcements once arrangements are confirmed.

For developer onboarding, the team discussed micro-grant programs and hackathons under a proposed structure where developers complete a bounty task and receive a Roko node as a reward — vetting participants while distributing hardware to engaged community members. A grant-funding section to seed application development was identified as a component of the forthcoming investor materials.

### Privacy-Preserving Attestation

A longer-term concept explored across sessions was attested, privacy-preserving monitoring — for example, an encrypted closed-loop system that attests that work or review occurred and then deletes the underlying data, posting only the attestation to the chain, in contrast to centralized surveillance that retains footage. This connected to themes of media authentication, returning data control to users (a Web3 "your data is your data" model), and enabling technologies such as event-based/neuromorphic cameras that preserve anonymity while allowing validation. The team treated this as a digression from the immediate need and recommitted to defining a simple, clear core value proposition.

---

## Key Metrics

| Metric | Status |
|--------|--------|
| Validator Onboarding Platform | Built and deployed |
| Test Chain | ~375,000 blocks, no consensus issues |
| Validator Resource Baseline | ~350 MB RAM per validator |
| Synchronized Clock Network | Targeted online by end of December |
| Timing Test Infrastructure | Functional by end of January (targeted) |
| Funding | Central priority; multiple leads under evaluation |
| Investor Pitch Deck | Drafting underway; one-pager targeted ~January 1 |

---

## Looking Ahead

- Bring the synchronized clock network online and deploy source code to machines.
- Begin connecting validators to the time device for syncing tests and add the mempool reconciliation check as testing progresses.
- Set up a validator and run test transactions over the new year.
- Convene a focused follow-up session to define Roko Core versus Roko Apps, resolve the fee structure (flagged as the biggest open gap), and develop vertical strategies and an 18–24 month roadmap.
- Draft the development-tiers and use-of-funds one-pager (targeted ~January 1) and capture the brand/creative storytelling process for the deck.
- Reassess the timing partner's role (service provider vs. ingestion) and pursue clarity on certification and any needed standard amendment.
- Accelerate investment outreach, build a target list of partners and investors, and reconnect with the fund-management partner ahead of the new-year planning sessions.
- Stand up regular X (Twitter) live sessions and publish a documented, distributable marketing plan.
