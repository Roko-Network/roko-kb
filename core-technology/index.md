# Core Technology

ROKO Network adds proven time to blockchain. Hardware-attested timestamps for blocks and transactions, built on datacenter-grade timing infrastructure.

## In This Section

### [Time Beacons](./time-beacons.md)
Validators broadcast signed timestamps. Blocks prove their time using beacon consensus.

### [Consensus Mechanism](./consensus.md)
BABE/GRANDPA with temporal proof requirements. Proven timestamps, not promises.

### [Temporal Transactions](./temporal-transactions.md)
Type 3 transactions with signing-time proofs. Execution order determined at signing, not inclusion.

### [Temporal Infrastructure](./temporal-infrastructure.md)
OCP-TAP hardware, IEEE 1588 PTP, GPS synchronization. The timing stack under the blockchain.

### [MEV Prevention](./mev-prevention.md)
Temporal ordering removes reordering. No front-running when time is proven.

### [NanoMoment Architecture](./nanomoment.md)
128-bit nanosecond timestamps. The data structure behind temporal precision.

### [Network Architecture](./network-architecture.md)
Distributed timing infrastructure and validator topology.

### [Validator Requirements](./validator-requirements.md)
Hardware and synchronization requirements for block production.

## Technical Specifications

| Feature | Specification |
|---------|--------------|
| **Timestamp Precision** | Microsecond (μs) in beacons |
| **Time Data Type** | u128 NanoMoment |
| **Synchronization Protocol** | IEEE 1588-2019 PTP |
| **Hardware Support** | OCP TAP 2.0 Time Cards |
| **Drift Tolerance** | 2s at launch, 500ms target |
| **Beacon Interval** | 150ms target |
| **Block Time** | 2-3 seconds |
