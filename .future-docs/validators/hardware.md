# Hardware Requirements

Running a ROKO Network validator requires specialized hardware to achieve nanosecond-precision timestamping. This guide covers the complete hardware specifications for different validator tiers.

## Minimum Hardware Requirements

### Compute Resources
```yaml
CPU:
  Cores: 16 physical cores (32 threads)
  Architecture: x86_64 (Intel Xeon or AMD EPYC)
  Frequency: 3.0 GHz base clock minimum
  Features: AES-NI, AVX2, RDTSC invariant TSC

Memory:
  Capacity: 64 GB ECC DDR4
  Speed: 2666 MHz minimum
  Configuration: Dual-channel or better

Storage:
  Primary: 2 TB NVMe SSD (PCIe 4.0)
  IOPS: 500,000+ random read
  Latency: < 20 microseconds
  Endurance: 1 DWPD minimum
```

### Network Requirements
```yaml
Primary Connection:
  Bandwidth: 10 Gbps symmetric
  Latency: < 5ms to major peers
  Packet Loss: < 0.01%
  
Network Interface:
  Type: Intel X710 or Mellanox ConnectX-5
  Features: Hardware timestamping support
  PTP Support: IEEE 1588-2019 compliant
```

### Time Synchronization Hardware
```yaml
PTP Grandmaster Clock:
  Accuracy: < 100 nanoseconds to UTC
  Stability: 1×10^-11 Allan deviation
  Holdover: 1 microsecond/hour
  
GPS/GNSS Receiver:
  Channels: 72+ tracking channels
  Constellations: GPS, GLONASS, Galileo, BeiDou
  Timing Accuracy: < 20 nanoseconds RMS
```

## Recommended Hardware by Tier

### 🥉 Bronze Tier
```bash
# Server Configuration
Dell PowerEdge R640
- 2× Intel Xeon Silver 4214R (12 cores @ 2.4 GHz)
- 64 GB ECC DDR4-2933
- 2× 2 TB Samsung PM1733 NVMe
- Intel X710-DA2 10GbE NIC

# Time Source
Microchip TimeProvider 4100
- GPS/GNSS receiver
- PTP grandmaster
- 100ns accuracy

# Estimated Cost: $15,000
```

### 🥈 Silver Tier
```bash
# Server Configuration
HPE ProLiant DL380 Gen10 Plus
- 2× Intel Xeon Gold 6338 (32 cores @ 2.0 GHz)
- 128 GB ECC DDR4-3200
- 4× 2 TB Intel P5510 NVMe (RAID-10)
- Mellanox ConnectX-6 Dx 25GbE

# Time Source
Meinberg LANTIME M3000
- OCXO oscillator
- Multi-GNSS receiver
- 50ns accuracy
- Rubidium holdover option

# Estimated Cost: $35,000
```

### 🥇 Gold Tier
```bash
# Server Configuration
Supermicro SYS-2029U-TN24R4T
- 2× Intel Xeon Platinum 8358 (32 cores @ 2.6 GHz)
- 256 GB ECC DDR4-3200
- 8× 3.84 TB Intel P5520 NVMe (RAID-10)
- Mellanox ConnectX-6 Lx 50GbE

# Time Source
Microsemi TimeSource 3100
- Rubidium atomic clock
- Multi-GNSS with anti-jamming
- 10ns accuracy
- Cesium backup option

# Estimated Cost: $75,000
```

### 💎 Diamond Tier
```bash
# Server Configuration
Dell PowerEdge R750xa
- 2× AMD EPYC 7773X (64 cores @ 2.2 GHz)
- 512 GB ECC DDR4-3200
- 16× 7.68 TB Samsung PM1743 NVMe
- NVIDIA ConnectX-7 100GbE

# Time Source
Symmetricom/Microsemi 5071A
- Cesium beam atomic clock
- 1ns accuracy to UTC
- Dual redundant GPS receivers
- Automatic failover

# Estimated Cost: $250,000+
```

## Network Interface Cards

### PTP-Capable NICs
```yaml
Intel X710/XXV710:
  Timestamp Resolution: 1ns
  PTP Accuracy: ±50ns
  Price: $400-800

Mellanox ConnectX-5/6:
  Timestamp Resolution: 1ns
  PTP Accuracy: ±25ns
  Price: $800-1500

NVIDIA ConnectX-7:
  Timestamp Resolution: 0.1ns
  PTP Accuracy: ±10ns
  Price: $2000-3000

Solarflare XtremeScale:
  Timestamp Resolution: 1ns
  PTP Accuracy: ±30ns
  Price: $600-1200
```

## Atomic Clock Options

### Rubidium Clocks
```yaml
Stanford Research FS725:
  Stability: 2×10^-11 @ 1s
  Drift: < 0.05 ppb/day
  Warmup: 5 minutes
  Price: $3,000-5,000

Microsemi SA.45s CSAC:
  Stability: 1×10^-10 @ 1s
  Power: < 125mW
  Size: Chip-scale
  Price: $2,000-3,000
```

### Cesium Clocks
```yaml
Microsemi 5071A:
  Stability: 1×10^-12 @ 1s
  Accuracy: ±1×10^-12
  MTBF: > 200,000 hours
  Price: $50,000-75,000

Oscilloquartz OSA 3230B:
  Stability: 5×10^-13 @ 1s
  Holdover: 1μs/day
  Redundancy: Hot-swappable
  Price: $40,000-60,000
```

## Colocation Requirements

### Data Center Specifications
```yaml
Power:
  Primary: 2× 20A 208V circuits
  Redundancy: N+1 UPS with generator
  Efficiency: PUE < 1.4

Cooling:
  Type: Hot/cold aisle containment
  Temperature: 18-24°C (64-75°F)
  Humidity: 40-60% RH

Security:
  Physical: 24/7 guards, biometric access
  Compliance: SOC 2 Type II, ISO 27001
  Network: DDoS protection, multiple carriers

Network Connectivity:
  Carriers: Minimum 3 tier-1 providers
  Peering: Direct IX presence preferred
  Latency: < 2ms to regional IX
```

## Performance Benchmarks

### CPU Performance Requirements
```bash
# Single-core performance (Geekbench 5)
Minimum: 1,200 points
Recommended: 1,500+ points

# Multi-core performance (Geekbench 5)
Minimum: 15,000 points
Recommended: 30,000+ points

# Cryptographic operations
ECDSA verify/s: > 50,000
SHA256 hash rate: > 10 GB/s
AES-256-GCM: > 20 GB/s
```

### Storage Performance
```bash
# Sequential performance
Read: > 3,500 MB/s
Write: > 3,000 MB/s

# Random 4K performance
Read IOPS: > 500,000
Write IOPS: > 400,000

# Latency requirements
Average: < 100 microseconds
P99: < 500 microseconds
P99.9: < 1 millisecond
```

## Cost Analysis

### Total Cost of Ownership (3 Years)
```yaml
Bronze Validator:
  Hardware: $15,000
  Colocation: $18,000 ($500/month)
  Bandwidth: $7,200 ($200/month)
  Maintenance: $3,600 ($100/month)
  Total: $43,800
  ROI: 14-18 months

Silver Validator:
  Hardware: $35,000
  Colocation: $36,000 ($1,000/month)
  Bandwidth: $14,400 ($400/month)
  Maintenance: $7,200 ($200/month)
  Total: $92,600
  ROI: 10-12 months

Gold Validator:
  Hardware: $75,000
  Colocation: $54,000 ($1,500/month)
  Bandwidth: $21,600 ($600/month)
  Maintenance: $10,800 ($300/month)
  Total: $161,400
  ROI: 8-10 months
```

## Vendor Recommendations

### Server Vendors
- **Dell Technologies**: Enterprise support, global availability
- **HPE**: ProLiant reliability, iLO management
- **Supermicro**: Customizable, cost-effective
- **Lenovo**: ThinkSystem quality, XClarity management

### Time Synchronization Vendors
- **Meinberg**: Industry leader in PTP grandmasters
- **Microsemi/Microchip**: Atomic clocks and timing solutions
- **Oscilloquartz (ADVA)**: Telecom-grade synchronization
- **Orolia**: GPS/GNSS and resilient timing

### Network Equipment
- **Arista**: Low-latency switches with PTP support
- **Juniper**: QFX series with enhanced timing
- **Mellanox/NVIDIA**: Leading NIC timestamp accuracy

## Next Steps

1. **Assess Requirements**: Determine your target validator tier
2. **Budget Planning**: Calculate TCO and expected ROI
3. **Vendor Selection**: Request quotes from recommended vendors
4. **Site Survey**: Evaluate colocation facilities
5. **Order Hardware**: Allow 4-6 weeks for delivery
6. **Installation**: Follow our [Node Setup Guide](./node-setup.md)

---

*For hardware procurement assistance, contact hardware@roko.network*