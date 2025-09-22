# Welcome to ROKO Network

## The Temporal Layer for Web3

ROKO Network is revolutionary blockchain infrastructure delivering **nanosecond precision** timing through **OCP-TAP compliance** and **IEEE 1588 PTP-grade synchronization**. We're building the foundation for time-sensitive decentralized applications that were previously impossible.

<figure><img src=".gitbook/assets/roko-banner.png" alt="ROKO Network - Temporal Blockchain"><figcaption><p>Nanosecond Precision. Infinite Possibilities.</p></figcaption></figure>

## Why ROKO?

### ⏱️ **Nanosecond Precision**
First blockchain with hardware-attested timestamps providing sub-100 nanosecond accuracy, enabling truly deterministic smart contract execution.

### 🔒 **MEV-Resistant by Design**
Temporal ordering based on actual signing time eliminates front-running and MEV attacks, ensuring fair transaction sequencing for all participants.

### 🏭 **Datacenter-Grade Standards**
Built on Open Compute Project Time Appliance Project (OCP-TAP) specifications with IEEE 1588 Precision Time Protocol for enterprise reliability.

### ⚡ **Predictable Performance**
2-3 second block times with guaranteed finality, sub-penny gas costs, and deterministic execution guarantees.

---

## Quick Start

<table data-view="cards">
<thead>
<tr>
<th></th>
<th></th>
<th data-hidden data-card-target data-type="content-ref"></th>
<th data-hidden data-card-cover data-type="files"></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>For Developers</strong></td>
<td>Build temporal applications with our SDKs</td>
<td><a href="getting-started/quick-start.md">quick-start.md</a></td>
<td></td>
</tr>
<tr>
<td><strong>For Validators</strong></td>
<td>Join the network and earn rewards</td>
<td><a href="validators/getting-started.md">getting-started.md</a></td>
<td></td>
</tr>
<tr>
<td><strong>For Token Holders</strong></td>
<td>Participate in governance</td>
<td><a href="governance/overview.md">overview.md</a></td>
<td></td>
</tr>
</tbody>
</table>

---

## Core Technology

### Temporal Consensus Engine
ROKO employs specialized hardware with custom firmware to generate cryptographically signed timestamps and proofs of time for every block. This moves beyond traditional gas-based transaction ordering to create temporal transactions automatically sequenced by their actual signing time.

{% content-ref url="core-technology/temporal-infrastructure.md" %}
[temporal-infrastructure.md](core-technology/temporal-infrastructure.md)
{% endcontent-ref %}

### NanoMoment Architecture
Native u128 timestamp support with nanosecond granularity enables time-critical applications impossible on other blockchains.

{% content-ref url="core-technology/nanomoment.md" %}
[nanomoment.md](core-technology/nanomoment.md)
{% endcontent-ref %}

### TimeRPC Authority
Decentralized time synchronization network ensuring global consensus on temporal ordering across all validators.

{% content-ref url="core-technology/timerpc.md" %}
[timerpc.md](core-technology/timerpc.md)
{% endcontent-ref %}

---

## Use Cases

ROKO's temporal precision unlocks entirely new categories of decentralized applications:

### 📈 **High-Frequency Finance**
- Microsecond arbitrage opportunities
- Fair order matching guaranteed
- MEV-resistant DeFi protocols

### 🏭 **Industrial IoT**
- 5G network synchronization
- Edge compute coordination
- Precision manufacturing control

### 🎮 **Gaming & Metaverse**
- Frame-perfect synchronization
- Fair competitive gaming
- Cross-platform time sync

### 🚛 **Supply Chain**
- Temporal provenance tracking
- Cold chain monitoring
- Automated SLA enforcement

{% content-ref url="products/use-cases.md" %}
[use-cases.md](products/use-cases.md)
{% endcontent-ref %}

---

## Project Nexus

ROKO's revolutionary compute marketplace combining temporal precision with automated smart contract execution. Nexus enables:

- **Decentralized compute orchestration** with nanosecond precision
- **Automated employment contracts** with guaranteed payment timing  
- **Service marketplaces** with temporal SLA enforcement
- **Complex milestone agreements** with time-locked conditions

{% content-ref url="products/nexus.md" %}
[nexus.md](products/nexus.md)
{% endcontent-ref %}

---

## Developer Resources

### 🛠️ SDKs Available

<table>
<thead>
<tr>
<th>Language</th>
<th>Package</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr>
<td>JavaScript/TypeScript</td>
<td><code>@roko/sdk</code></td>
<td>✅ Stable</td>
</tr>
<tr>
<td>Rust</td>
<td><code>roko-sdk</code></td>
<td>✅ Stable</td>
</tr>
<tr>
<td>Python</td>
<td><code>roko-python</code></td>
<td>🚧 Beta</td>
</tr>
<tr>
<td>Go</td>
<td><code>github.com/roko-network/go-sdk</code></td>
<td>🚧 Beta</td>
</tr>
</tbody>
</table>

### Quick Example

{% tabs %}
{% tab title="JavaScript" %}
```javascript
import { RokoClient } from '@roko/sdk';

const client = new RokoClient({
  network: 'mainnet',
  precision: 'nanosecond'
});

// Generate temporal attestation
const attestation = await client.time.attest({
  data: payload,
  timestamp: RokoTime.now()
});

console.log(attestation.proof);
```
{% endtab %}

{% tab title="Rust" %}
```rust
use roko_sdk::prelude::*;

#[temporal_contract]
pub fn execute_at_time(
    ctx: &Context,
    target: NanoMoment
) -> Result<()> {
    // Guaranteed execution at exact time
    ensure!(ctx.time() == target);
    
    // Your logic here
    Ok(())
}
```
{% endtab %}
{% endtabs %}

{% content-ref url="developers/sdks.md" %}
[sdks.md](developers/sdks.md)
{% endcontent-ref %}

---

## Network Statistics

<table>
<thead>
<tr>
<th>Metric</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>Active Validators</td>
<td>127</td>
</tr>
<tr>
<td>Network TPS</td>
<td>50,000+</td>
</tr>
<tr>
<td>Sync Precision</td>
<td><100 nanoseconds</td>
</tr>
<tr>
<td>Block Time</td>
<td>2.5 seconds</td>
</tr>
<tr>
<td>Gas Cost</td>
<td><$0.01</td>
</tr>
<tr>
<td>Total Staked</td>
<td>45M ROKO</td>
</tr>
</tbody>
</table>

{% content-ref url="technical/statistics.md" %}
[statistics.md](technical/statistics.md)
{% endcontent-ref %}

---

## Join the Community

<table data-view="cards">
<thead>
<tr>
<th></th>
<th data-hidden data-card-target data-type="content-ref"></th>
</tr>
</thead>
<tbody>
<tr>
<td>💬 <strong>Discord</strong><br>Technical discussions and support</td>
<td><a href="https://discord.gg/roko">https://discord.gg/roko</a></td>
</tr>
<tr>
<td>🐦 <strong>Twitter</strong><br>Latest updates and announcements</td>
<td><a href="https://twitter.com/rokonetwork">https://twitter.com/rokonetwork</a></td>
</tr>
<tr>
<td>📦 <strong>GitHub</strong><br>Open source repositories</td>
<td><a href="https://github.com/roko-network">https://github.com/roko-network</a></td>
</tr>
</tbody>
</table>

---

## Getting Help

- 📚 Browse the [documentation](getting-started/introduction.md)
- ❓ Check our [FAQs](resources/faqs.md)
- 🔧 Visit [Troubleshooting](resources/troubleshooting.md)
- 💬 Ask in [Discord](https://discord.gg/roko)

---

<div align="center">

**Built with Temporal Precision** ⏱️

ROKO Network © 2025 | [Terms](https://roko.network/terms) | [Privacy](https://roko.network/privacy)

</div>