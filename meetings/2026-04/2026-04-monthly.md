# Roko Network Monthly Update

**Month:** April 2026

---

## Executive Summary

April 2026 advanced the network on several fronts at once: new temporal precompiles exposed transaction-level and mesh-consensus time to the EVM, a chain-halt bug was traced and fixed, and the team began rigorous real-hardware timing validation that clarified where current devices fall short of full timestamping quality. In parallel, wallet and faucet work began against the Roko chain on top of the Fortemi data layer, the Hall of the Mind UI was confirmed as Fortemi's public front end with downloadable installers, and a far-reaching tokenomics conversation took shape around separating governance, utility, and staking roles across the existing Ethereum token, the native coin, and Power Roko. A proposed hardware-authentication mechanism for timing sources was endorsed for a monitoring-level pilot. Most tokenomics and migration questions were treated explicitly as planned options for structured comparison rather than settled policy.

---

## Layer 1 and Temporal Precompiles

### New Temporal Precompiles
Two new temporal precompiles were committed to the main repository, extending what smart contracts can read about time:
- A function allowing a contract to read the timestamp of the **current transaction** (not just the current block), enabling ordering logic keyed to a specific transaction's stamped time.
- A function exposing the **current mesh consensus time**, which can differ slightly from block time and represents a time agreement between blocks.
- Both precompiles remain to be documented.

### Chain Halt Investigation and Fix
A chain-halt issue was traced and resolved. The root cause was a special class of transaction marking epoch changes that is local to every node rather than gossiped to peers. A node generating this transaction timestamped it and shared the timestamp; other validators then attempted to include the mandatory transaction despite not possessing it locally, causing the public-RPC node to diverge from the validator set. The scenario was reproduced locally and on testnet, fixed, and re-run successfully. The issue is not externally triggerable, as it is part of core substrate functionality.

### Pallet and Precompile Integration Guidance
The team clarified the external developer integration model:
- **Pallets** function as plugins to the chain and almost always require a governance vote or sudo key to install, making them suited to deeply integrated on-chain features rather than external apps.
- **External developers** are better served calling the chain's RPC/API directly in their language of choice.
- Exposing additional substrate functionality to the EVM is done **function by function via precompiles**, testable on a local devnet with edited precompiles before proposing changes via pull request. The peer identity system was cited as a case where little metadata reaches the EVM unless a dedicated precompile is created.

---

## Timing Hardware Validation

### Timebeat-Class Device Bring-Up
Extensive hands-on work brought up a validator on a Timebeat-class timing device, accessed remotely over Tailscale. The board joined the mesh and produced an initial batch of blocks but was repeatedly ejected from mesh consensus due to time drift and packets not reaching peers quickly enough. After roughly twenty-one hours across two days — rebuilding node versions, relaxing networking acceptance criteria, and trying several timekeeping configurations — the assessment was that the difficulty is primarily configuration rather than a hard device limitation, though Chrony was observed to keep better time than the device itself, which is not the desired outcome. The board lacks an onboard oscillator with strong holdover, a likely contributor to the drift.

### Hybrid Stabilization and Time-Quality Conclusions
The device's clock was later stabilized with a hybrid Chrony-plus-time-card setup, but the card drifts significantly on its own. The conclusion: the board can serve as a **smaller node** — producing blocks and earning some weight for lower-tier timestamping — but will not reach the time quality needed for full timestamping rewards. The underlying cause is the absence of an onboard quartz oscillator and therefore little holdover, so the board can report nanosecond accuracy yet drift onto the wrong UTC second; a driver issue was raised as a possible contributor. A full pass on the reward system surfaced and resolved one imbalance, prompting a node rebuild.

### Time Quality Testing with Indirect Sources
Separately, the team prepared to deploy a fourth validator drawing time from an indirect source (Chrony) rather than a direct time device, capping its time quality at a reduced tier. With only three validators running, introducing this weaker node was expected to lower overall mesh time quality by a few percentage points and to cause its assigned weight to drop and readjust — demonstrating that Roko time remains reliable even when not all validators are. The node was deployed in Docker on constrained hardware (four cores, 8 GB RAM); with roughly 400,000 blocks on the chain, initial sync on the small device took on the order of thirty to forty minutes.

### Design Intent Reinforced
This real-hardware work reinforced the network's core design intent: an individual node with weaker hardware can still participate because what matters is that the **mesh agrees on the time**, with the chain computing a time-quality number per validator and one for the mesh as a whole, enabling and disabling features as quality changes. Running multiple coordinated reference clocks (ideally three) is part of how hardware stays in sync; once enough high-quality reference nodes and proper grandmaster setups are running, edge participants are expected to need progressively less intensive hardware. Planned work includes exposing a grandmaster node for other operators to synchronize against, and adjusting the time-quality formulas so operators who invest in strong hardware are appropriately rewarded.

---

## Anti-Spoofing and Mesh Hardening

### Hardware-Authenticated Timing Concept
A proposed mechanism to detect and authenticate the timing hardware a validator is actually using was presented, based on the characteristic **phase-noise signature** of different oscillator classes. The concept is explicitly additive — not a replacement for the existing Grandpa/Babe consensus — and is intended to let peers observe whether a neighbor's phase noise is honest and to make hardware-level timestamping harder to spoof in software. The proposed rollout is tiered: a monitoring **observer** role first, then an **advisory** role, and only later a **production-gating** role, with a built-in safe-valve that falls back to advisory mode if a large fraction of nodes appear to be misclassifying their clocks, so the mechanism cannot itself destroy the mesh.

The team agreed to begin at the monitoring level as a pilot, provided it does not meaningfully increase compute load, log volume, or node latency. If reliable over a few months, it could later gate validator capabilities — for example, allowing a node to produce blocks but not timestamp if its time source is insufficient — and underpin economic incentives. The verification math is to be designed as interchangeable, so alternative noise or integer-series methods can be swapped in.

### Mesh Layer Hardening
Small mesh-layer tweaks followed an incident in which a newly launched validator, affected by a port-forwarding issue on the operator's side, briefly connected to a peer and left stale temporal data that drained that peer's reputation over time. A filter now activates within roughly ten seconds to clean up such stale data; a small attack scenario exercising the vector was tested and confirmed no longer effective. The team also noted that a poorly configured device can, given the small validator set, break the chain's timekeeping into a semi-unrecoverable state requiring an admin refresh function — underscoring the value of real-hardware testing in finding the threshold between an acceptable contribution and a harmful one.

---

## Networking and Validator Operations

### Latency and Network Path
The current setup routes validator traffic through a VPS acting as an exit node over a mobile VPN path, which is not ideal for timing-sensitive validators. Options weighed included port-forwarding the device through the operator's own router with a local proxy versus standing up a lighter-latency VPS closer to the other nodes. For exposing a node, the consensus was that straightforward port forwarding of the gossip-channel port is sufficient for now, with acceptance criteria able to be tightened as the network grows.

### Agent-Friendly Validator Deployment
Work continued on a deployment script intended to live alongside the node binary and simplify validator configuration. The script is testnet-only because it carries sudo access to registration functions, and is designed so an AI agent could either run it directly or read its source to diagnose and patch a failed step — aiming to make spinning up a validator possible on any machine with minimal manual intervention.

---

## Wallet, Faucet, and UI

### Wallet and Faucet Development
Wallet integration directed at the Roko chain began, along with a faucet site, building on the team's validator and documentation work. The wallet draws on the Fortemi data wallet, whose backup, export, and data-sharding capabilities are built on a PKCS#12 key store that creates a wallet behind the scenes when backup encryption is enabled. The current generic PKCS#12 implementation is being adapted to substrate while remaining modular enough to plug into multiple chains. The team framed this as delivering on the original promise of NFTs — licensing and access control over decentralized storage, including a confederated-storage model that brings businesses in — without adopting the NFT label.

### Hall of the Mind (Fortemi Front End)
Hall of the Mind (HRTM) was confirmed as the front-end UI for Fortemi, now public in its repository with DMG, DEB, and RPM release packages. Installing the front end automatically stands up Fortemi and Postgres in the background, lowering the setup burden versus the prior Docker-based flow. It is built with Rust and Tauri wrapping a React app and can still run as a Docker module pointed at an existing Fortemi server. The current build is a developer package without a full Apple signature, so it requires allowing developer packages; the team considers it close to but not yet ready for general advertisement until Apple signing is set up. Hall of the Mind was the original prototype Fortemi grew out of before the server was separated from the UI.

### Cross-Project Tooling Consolidation
Tooling developed on a partner red-teaming engagement is being normalized into products — some open source or free, some packaged for enterprise. A pattern from that work — a browser-based agent able to control multiple applications with embedded memory, runnable without installing an application — is expected to become an entry point for trying Fortemi and related tools. As a direct result, Fortemi can now ship as regular downloadable Linux and macOS application installers.

---

## Tokenomics and Economic Model

The bulk of two meetings was a wide-ranging tokenomics discussion, treated explicitly as a brainstorm rather than settled policy.

### Multi-Token Structure
The team weighed separating governance, utility, and staking roles across three instruments — the existing Ethereum-based token, the native chain coin, and Power Roko (the staking token):
- A **two-token analogy** to corporate structure was discussed, where a governance/DAO token is deliberately separate from the operational coin, much as a board is separate from management.
- Under the model discussed, validators would **lock a governance token** to participate, while the native coin would be kept relatively stable and inexpensive to keep it flowing freely for services.
- The intent is to **unhook the network's intrinsic equitable value** (which pays dividends) from its operational cost, so volatility in one does not destabilize the other.
- One direction treats the existing token as a representation of the **secured core** of the network — potentially free to appreciate — while keeping the operational token stable and predictable for enterprise customers priced in it.

### Reward-Token Open Question
A specific open question emerged over whether timestamping and other rewards should be paid in the **native coin** or in **Power Roko**. Power Roko was conceived as a staking instrument with specific legal properties (including a two-week unlock and tax-simplification intent), and paying general rewards in it could undermine those properties and add complexity. This was flagged as a **tokenomics rather than technical decision**; non-staking reward paths are being kept in the native coin pending direction. The locking mechanism was generally appreciated as a way to control liquidity and let holders manage when they realize value.

### Ethereum Token Migration (Planned, Not Committed)
The team discussed a possible migration away from the existing Ethereum-based token, with broad agreement to **re-roll** it so it no longer needs to be part of the chain's economics or governance:
- The present moment — a holder base in the low thousands with limited on-chain liquidity tooling — was noted as the **least disruptive** time to migrate if undertaken.
- Migration was treated as **not on the table** until DeFi, a DEX, and bridge basics are in place; participants flagged legal review and a careful dilution strategy as prerequisites.
- The treasury was noted to still hold roughly **30–40% of supply**, which could provide runway for emissions.
- A **staking model** delegating the governance token to validators to earn chain emissions was discussed, alongside a phased "dam" liquidity-release concept to spin up circulating flow gradually rather than dumping value onto the market.
- Migration mechanics (a claim contract and bridge, an exchange ratio or decimal pre-inflation, and a token burn) were discussed at a high level as options to be detailed later.
- Current holder distribution appeared reasonably fair per third-party analytics, with the noted risk that long-dormant holders may not actively use the network.

The team agreed to consolidate tokenomics options — pros, cons, and added complexity — into a shared document for structured comparison and broader input, and to model the economic flows with a Monte Carlo setup with outside feedback from crypto practitioners.

---

## Enterprise Positioning and Business

### Enterprise Positioning
The team discussed positioning the network as an alternative to traditional cloud providers, where chain emissions and operation could offset much of a customer's operating cost after their up-front hardware expenditure. The group acknowledged pricing must stay within a competitive range of mainstream cloud providers to be credible, and offered a Monte Carlo simulation as a tool to model the economics and product additions more rigorously.

### Operations
A brief operational note covered an ongoing external-services discussion on hold; the team agreed to re-engage the counterparty directly and reset expectations, emphasizing that committing to significant recurring cost is premature until the network can demonstrably generate revenue. No private figures or negotiating details were resolved.

---

## Documentation and Knowledge

A new half-technical document describing the Roko network is in progress, with the author flagging a desire to include the open question of how to **reward validators for timestamping** — a capability not yet implemented because the best mechanism has not been settled — so the team can reason through it collectively. Substrate-related features continued to be added to the block explorer. The team also discussed the value of semantic knowledge tooling to keep project information consolidated and discoverable across channels from the outset, and planned to aggregate recent call transcripts into the research repository for reference.

---

## Forward-Looking Items

### Planned and Targeted Next Steps
- Document the new transaction-timestamp and mesh-consensus-time precompiles.
- Complete the agent-friendly validator deployment script for testnet use.
- Continue tuning timing-device configuration and networking to achieve reliable block production, then send timestamping transactions to observe raw hardware time data for the first time.
- Stand up a higher-tier precision board with an onboard oscillator as a second node on the same LAN for comparison (targeted within roughly one to two weeks of late April).
- Reduce validator latency via an improved network path (port forwarding with a local proxy, or a lighter-latency VPS).
- Integrate the hardware-authentication mechanism at the monitoring level as a pilot, validating its resource footprint before any gating role.
- Continue wallet development against the Fortemi data layer and publish a spec others can build on; stand up the faucet site.
- Complete Apple signing for the Hall of the Mind installer before advertising it to general users.
- Resolve the reward-token question (native coin vs. Power Roko) as a tokenomics decision, then align node reward paths accordingly.
- Stand up a shared tokenomics document to compare token-structure and migration options with the full team, and model economic flows with the Monte Carlo setup.

### Concepts Marinating for Future Consideration
- A timing-focused incentivized subnet, applying a model similar to existing AI subnet ecosystems but oriented around time validators and timing hardware — raised for future consideration rather than immediate action.
