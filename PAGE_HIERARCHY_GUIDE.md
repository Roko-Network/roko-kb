# GitBook Page Hierarchy & Ordering Guide

## 📖 How GitBook Pages Are Ordered

The **SUMMARY.md** file is the master control for your documentation structure. It defines:
1. **Order** - Pages appear in the exact order listed
2. **Hierarchy** - Indentation creates parent-child relationships
3. **Sections** - `##` headers create section dividers
4. **Navigation** - This becomes your left sidebar navigation

---

## 🎯 Understanding the Structure

### Basic Syntax:
```markdown
* [Page Title](path/to/file.md)           # Top-level page
  * [Subpage Title](path/to/subpage.md)   # Indented = child page
    * [Sub-subpage](path/to/sub2.md)      # Further nested
```

### Section Headers:
```markdown
## Section Name                            # Creates a section divider
```

---

## 📊 Current Page Order & Hierarchy

Here's your complete page structure with visual hierarchy:

```
📚 ROKO Network Documentation
│
├── 🏠 Welcome to ROKO (Homepage)
│
├── 📂 Getting Started
│   ├── ⚡ Introduction
│   ├── 🎯 What is Temporal Blockchain?
│   ├── ⏱️ Why Nanosecond Precision Matters
│   └── 🚀 Quick Start Guide
│
├── 📂 Core Technology
│   ├── 🔬 Temporal Infrastructure
│   │   ├── OCP-TAP Compliance
│   │   ├── IEEE 1588 PTP Implementation
│   │   └── Hardware Timestamping
│   ├── ⚙️ Consensus Mechanism
│   │   ├── NanoMoment Architecture
│   │   ├── TimeRPC Authority
│   │   └── MEV Prevention
│   └── 🌐 Network Architecture
│       ├── Validator Requirements
│       └── Network Synchronization
│
├── 📂 Developer Resources
│   ├── 💻 SDKs & Tools
│   │   ├── JavaScript/TypeScript SDK
│   │   ├── Rust SDK
│   │   ├── Python SDK
│   │   └── Go SDK
│   ├── 📡 API Reference
│   │   ├── Time Attestation API
│   │   ├── Validator API
│   │   └── WebSocket Events
│   └── 📜 Smart Contracts
│       ├── Temporal Contracts
│       ├── Time-Locked Operations
│       └── Contract Examples
│
├── 📂 Products & Solutions
│   ├── 🔷 Project Nexus
│   │   ├── Compute Marketplace
│   │   ├── MATRIC Orchestration
│   │   └── Integration Guide
│   └── 🏭 Use Cases
│       ├── High-Frequency Trading
│       ├── IoT & Edge Computing
│       ├── Gaming & Metaverse
│       ├── Supply Chain
│       └── DeFi Protocols
│
├── 📂 Network Participation
│   ├── ⚡ Becoming a Validator
│   │   ├── Hardware Requirements
│   │   ├── PTP Configuration
│   │   ├── Node Installation
│   │   └── Monitoring & Maintenance
│   └── 💰 Staking & Rewards
│       ├── ROKO Staking
│       ├── pwROKO Mechanics
│       └── Reward Distribution
│
├── 📂 Governance
│   ├── 🏛️ DAO Overview
│   ├── 🗳️ Governance Structure
│   │   ├── Multi-Token System
│   │   ├── Working Groups
│   │   └── Reputation System
│   ├── 📝 Proposal Process
│   │   ├── Creating Proposals
│   │   ├── Voting Mechanisms
│   │   └── Implementation
│   └── 💎 Treasury Management
│       ├── Fund Allocation
│       ├── Grant Programs
│       └── Multi-Sig Controls
│
├── 📂 Technical Specifications
│   ├── 📄 Whitepaper
│   ├── 📊 Performance Benchmarks
│   └── 🔒 Security
│       ├── Audits
│       └── Bug Bounty Program
│   └── 📈 Network Statistics
│
├── 📂 Resources
│   ├── 📚 Glossary
│   ├── ❓ FAQs
│   ├── 🔧 Troubleshooting
│   ├── 🌍 Community
│   │   ├── Discord (external link)
│   │   ├── Twitter (external link)
│   │   └── GitHub (external link)
│   └── 🎨 Brand Assets
│
└── 📂 Archive
    └── 📜 Historical Documents
        ├── Roko's Basilisk Philosophy
        └── Original Vision
```

---

## 🔧 How to Add/Reorder Pages

### To Add a New Page:

1. **Edit SUMMARY.md**
2. **Add your entry** at the desired position:
   ```markdown
   * [Your New Page Title](path/to/your-page.md)
   ```
3. **Create the corresponding .md file** in the correct folder

### To Add a Subpage:

1. **Find the parent page** in SUMMARY.md
2. **Add indented entry** below it:
   ```markdown
   * [Parent Page](parent.md)
     * [Your Subpage](subpage.md)  # Note the indent
   ```

### To Reorder Pages:

Simply **move the lines** in SUMMARY.md to their new position. The order in SUMMARY.md = the order in GitBook.

---

## 📝 Important Rules

### 1. **Indentation Matters**
- Use 2 spaces for each level of nesting
- Consistent indentation is critical

### 2. **File Paths Must Match**
- Path in SUMMARY.md must exactly match actual file location
- Paths are relative to the gitbook root folder

### 3. **Section Headers**
- Use `##` for main sections (not clickable, just dividers)
- Don't use `#` (that's for the document title)

### 4. **External Links**
- Can include external URLs directly:
  ```markdown
  * [Discord](https://discord.gg/roko)
  ```

### 5. **Maximum Nesting**
- GitBook supports up to 3 levels of nesting
- Keep it simple for better navigation

---

## 🎨 Visual Indicators in GitBook

When deployed, your structure will appear as:

- **Bold items** = Section headers (non-clickable)
- **Regular items** = Clickable pages
- **Indented items** = Child pages (collapsible)
- **Icons** = Emoji in titles are preserved

---

## 📊 Current Status

### Files That Exist:
✅ README.md (homepage)
✅ getting-started/introduction.md
✅ getting-started/quick-start.md
✅ core-technology/temporal-infrastructure.md
✅ governance/index.md (should be overview.md)
✅ products/project-nexus.md (listed as nexus.md)

### Files Referenced But Missing:
❌ Most other pages (~70+ files still needed)

---

## 🚀 Quick Reference

**To see the exact order and hierarchy:**
→ Open `SUMMARY.md`

**To change the order:**
→ Edit `SUMMARY.md` and move lines

**To add new pages:**
→ Add to `SUMMARY.md` + create the .md file

**To create sections:**
→ Use `## Section Name` in `SUMMARY.md`

**To nest pages:**
→ Indent with 2 spaces per level