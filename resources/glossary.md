# Glossary

## ROKO Technical Terms

### A-D

**Atomic Clock**: Ultra-precise timekeeping device using atomic transitions, achieving nanosecond accuracy.

**BABE (Blind Assignment for Blockchain Extension)**: Substrate's block production mechanism that ROKO extends with temporal proofs.

**Beacon Proof**: A K-of-N selection of time beacons included in a block or transaction to cryptographically prove its timestamp via median calculation.

**Beacons Pallet**: Substrate pallet responsible for teaching validators how to produce and broadcast time beacons.

**Drift**: Time deviation between validator clocks. Launch tolerance is 2 seconds, targeting 500ms as network matures.

**Drift Tolerance / Tolerance Window**: Configurable maximum time variance allowed between beacons for valid block/transaction proofs.

### E-H

**Epoch**: Fixed time period in ROKO consensus, inherited from BABE/GRANDPA.

**Epoch Randomness**: Random value included in time beacons for verification, derived from the current epoch.

**Frontier Pallet**: Forked Substrate pallet providing EVM compatibility with temporal ordering support.

**GRANDPA (GHOST-based Recursive ANcestor Deriving Prefix Agreement)**: Substrate's finality gadget used alongside BABE in ROKO.

**Hardware Timestamping**: Network card feature for precise packet timing, required for validator time cards.

### I-N

**IEEE 1588**: Precision Time Protocol (PTP) standard for network synchronization.

**MEV (Maximal Extractable Value)**: Profit extracted by reordering, inserting, or censoring transactions. ROKO's temporal ordering prevents MEV at the protocol level.

**NanoMoment**: ROKO's high-precision timestamp format combining seconds, nanoseconds, and hardware attestation.

### O-R

**OCP-TAP**: Open Compute Project Time Appliance Project specification for datacenter-grade timing hardware.

**PTP (Precision Time Protocol)**: Network protocol for sub-microsecond clock synchronization (IEEE 1588).

### S-T

**Selfient**: Self-executing smart contracts triggered by time conditions.

**Spread**: The difference between maximum and minimum beacon timestamps in a beacon proof, indicating time consensus quality.

**Temporal Consensus**: ROKO's time-based agreement mechanism built on top of BABE/GRANDPA using time beacons.

**Temporal Ordering**: Transaction execution order determined by proven signing time rather than block inclusion order or validator preference.

**Temporal Transaction (Type 3)**: Transaction type with embedded time beacon proof establishing cryptographically-verified signing time.

**Time Beacon**: Signed timestamp broadcast by validators at regular intervals (150ms target at launch) containing validatorId, timestamp, sequence number, signature, and epoch randomness.

**Time Blocks Pallet**: Substrate pallet that wraps BABE to introduce beacon proof requirements and timestamp verification for blocks.

**Time Card**: OCP-TAP compliant hardware providing GPS-synchronized, cryptographically-attested timestamps.

**TimeRPC**: ROKO's specialized RPC interface for temporal operations and beacon queries.

**Temporal Transactions Pallet**: Substrate pallet introducing Type 3 transactions with temporal ordering enforcement.

### U-Z

**UTC**: Coordinated Universal Time, the global time standard that ROKO validators synchronize to.

---

> **Note**: Some terms like NanoMoment and TimeRPC represent higher-level abstractions. The underlying implementation uses Time Beacons and Substrate pallets as described in the technical architecture.
