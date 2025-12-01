# PTP Configuration Guide

Precision Time Protocol (PTP) IEEE 1588-2019 is essential for ROKO Network validators to achieve nanosecond-precision synchronization. This guide covers complete PTP setup and optimization.

## PTP Overview

PTP provides sub-microsecond accuracy time synchronization over packet networks, essential for:
- Transaction ordering with nanosecond precision
- Network-wide consensus on time
- MEV prevention through deterministic ordering
- Hardware-attested timestamps

## Prerequisites

### Hardware Requirements
```bash
# Check NIC PTP support
lspci -vv | grep -i "precision time"
ethtool -T eth0  # Should show hardware timestamping

# Verify kernel support
zgrep PTP /proc/config.gz
# Should show:
# CONFIG_PTP_1588_CLOCK=y
# CONFIG_PTP_1588_CLOCK_PCH=y
```

### Software Installation
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y linuxptp ethtool chrony ntpdate

# RHEL/CentOS/Rocky
sudo dnf install -y linuxptp ethtool chrony

# Verify installation
ptp4l -v  # Should show version 3.1 or higher
phc2sys -v
pmc -v
```

## Basic PTP Configuration

### 1. Configure Network Interface
```bash
# Enable hardware timestamping
sudo ethtool -K eth0 rx-vlan-offload off
sudo ethtool -K eth0 tx-vlan-offload off
sudo ethtool -K eth0 hw-tc-offload on

# Set interrupt coalescing for better precision
sudo ethtool -C eth0 rx-usecs 0 tx-usecs 0
sudo ethtool -C eth0 adaptive-rx off adaptive-tx off

# Increase ring buffer sizes
sudo ethtool -G eth0 rx 4096 tx 4096
```

### 2. PTP4L Configuration
```ini
# /etc/linuxptp/ptp4l.conf
[global]
# Device Configuration
domainNumber            24
slaveOnly               1
priority1               128
priority2               128

# Timing Parameters
logAnnounceInterval     1
logSyncInterval         -4  # 16 messages per second
logMinDelayReqInterval  -4

# Accuracy Settings
clockAccuracy           0x21  # 100ns
clockClass              248
offsetScaledLogVariance 0xFFFF

# Protocol Settings
network_transport       L2
delay_mechanism         E2E
time_stamping           hardware

# Servo Settings
clock_servo             linreg
first_step_threshold    0.00002
step_threshold          0.00002

# Management
assumeReversible        1
fault_reset_interval    4

# Hardware Timestamping
tx_timestamp_timeout    100
check_fup_sync          1

# Message Rates
operLogSyncInterval     -4
operLogPdelayReqInterval -4

[eth0]
# Interface-specific settings
logAnnounceInterval     1
logSyncInterval         -4
logMinDelayReqInterval  -4
udp_ttl                 1
masterOnly              0
delay_mechanism         E2E
network_transport       UDPv4
```

### 3. PHC2SYS Configuration
```bash
# Synchronize system clock to PTP hardware clock
sudo phc2sys -s eth0 -c CLOCK_REALTIME -w -O 0 -R 256 -u 10

# For automatic startup, create systemd service
cat <<EOF | sudo tee /etc/systemd/system/phc2sys.service
[Unit]
Description=Synchronize system clock to PTP hardware clock
After=ptp4l.service
Requires=ptp4l.service

[Service]
Type=simple
ExecStart=/usr/sbin/phc2sys -s eth0 -c CLOCK_REALTIME -w -O 0 -R 256 -u 10
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable phc2sys
sudo systemctl start phc2sys
```

## Advanced Configuration

### Grandmaster Clock Setup
```ini
# /etc/linuxptp/gm.conf
[global]
# Grandmaster Settings
slaveOnly               0
priority1               1
priority2               1
domainNumber            24
clockClass              6  # GPS-locked
clockAccuracy           0x20  # 25ns
offsetScaledLogVariance 0x4E5D

# Time Source
timeSource              0x20  # GPS

# Announce Settings
logAnnounceInterval     0
announceReceiptTimeout  3

# Sync Settings
logSyncInterval         -6  # 64 msgs/sec for grandmaster

# Best Master Clock Algorithm
bmca                    ptp

# GPS Interface
[/dev/pps0]
dataset_comparison      G.8275.x
```

### Hardware Timestamping Optimization
```bash
#!/bin/bash
# optimize_ptp.sh

# Set CPU affinity for PTP
PTP_PID=$(pidof ptp4l)
sudo taskset -cp 0-3 $PTP_PID

# Set real-time priority
sudo chrt -f -p 99 $PTP_PID

# Configure interrupt affinity
IRQ=$(grep eth0 /proc/interrupts | awk '{print $1}' | sed 's/://')
echo 1 | sudo tee /proc/irq/$IRQ/smp_affinity

# Disable CPU frequency scaling
for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    echo performance | sudo tee $cpu
done

# Set network queue affinity
sudo systemctl stop irqbalance
for i in {0..7}; do
    echo $((1 << i)) | sudo tee /proc/irq/$((IRQ + i))/smp_affinity
done
```

## PTP Monitoring

### Real-time Monitoring Script
```python
#!/usr/bin/env python3
# monitor_ptp.py

import subprocess
import time
import json
from datetime import datetime

def get_ptp_status():
    cmd = "pmc -u -b 0 'GET CURRENT_DATA_SET'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    status = {}
    for line in result.stdout.split('\n'):
        if 'offsetFromMaster' in line:
            status['offset'] = float(line.split()[-1])
        elif 'meanPathDelay' in line:
            status['delay'] = float(line.split()[-1])
        elif 'stepsRemoved' in line:
            status['steps'] = int(line.split()[-1])
    
    return status

def check_sync_quality(offset_ns):
    if abs(offset_ns) < 100:
        return "EXCELLENT ✅"
    elif abs(offset_ns) < 500:
        return "GOOD ✓"
    elif abs(offset_ns) < 1000:
        return "ACCEPTABLE ⚠"
    else:
        return "POOR ❌"

print("ROKO PTP Monitor - Press Ctrl+C to exit\n")
print(f"{'Timestamp':<20} {'Offset (ns)':<15} {'Delay (ns)':<15} {'Quality':<12} {'Steps'}")
print("-" * 80)

while True:
    try:
        status = get_ptp_status()
        if status:
            timestamp = datetime.now().strftime("%H:%M:%S")
            offset = status.get('offset', 0) * 1e9  # Convert to nanoseconds
            delay = status.get('delay', 0) * 1e9
            quality = check_sync_quality(offset)
            steps = status.get('steps', 0)
            
            print(f"{timestamp:<20} {offset:<15.2f} {delay:<15.2f} {quality:<12} {steps}")
        
        time.sleep(1)
    except KeyboardInterrupt:
        print("\nMonitoring stopped")
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)
```

### Grafana Dashboard Configuration
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ptp_metrics'
    static_configs:
      - targets: ['localhost:9100']
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'node_timex_.*|node_ptp_.*'
        action: keep
```

## Troubleshooting

### Common Issues and Solutions

#### 1. No PTP Hardware Clock Found
```bash
# Check available PHC devices
ls /dev/ptp*

# If no devices found, check driver
sudo modprobe ptp
sudo modprobe i40e  # For Intel NICs
sudo modprobe mlx5_core  # For Mellanox NICs
```

#### 2. Poor Synchronization Quality
```bash
# Check network statistics
etstat -s | grep -i error
ethtool -S eth0 | grep -E "drop|error"

# Verify PTP traffic
sudo tcpdump -i eth0 -c 10 port 319 or port 320

# Check system clock drift
chronyc sources -v
timedatectl status
```

#### 3. High Offset Values
```bash
# Reset PTP service
sudo systemctl restart ptp4l phc2sys

# Check for network congestion
ping -c 100 <grandmaster_ip> | tail -3

# Verify NTP is disabled
sudo systemctl stop ntp ntpd chronyd
sudo systemctl disable ntp ntpd chronyd
```

## Performance Validation

### Accuracy Testing
```bash
#!/bin/bash
# test_ptp_accuracy.sh

echo "Testing PTP Accuracy for ROKO Validator"
echo "========================================"

# Collect 1000 samples
for i in {1..1000}; do
    pmc -u -b 0 'GET CURRENT_DATA_SET' | \
        grep offsetFromMaster | \
        awk '{print $NF}'
    sleep 0.1
done > /tmp/ptp_samples.txt

# Calculate statistics
awk '{
    sum += $1
    sumsq += $1^2
    if (NR == 1 || $1 < min) min = $1
    if (NR == 1 || $1 > max) max = $1
}
END {
    mean = sum / NR
    variance = (sumsq - sum^2/NR) / (NR-1)
    stddev = sqrt(variance)
    print "Samples:", NR
    print "Mean offset:", mean * 1e9, "ns"
    print "Std deviation:", stddev * 1e9, "ns"
    print "Min offset:", min * 1e9, "ns"
    print "Max offset:", max * 1e9, "ns"
    
    if (stddev * 1e9 < 100)
        print "\n✅ PASSED: Suitable for ROKO validator"
    else
        print "\n❌ FAILED: Improve PTP configuration"
}' /tmp/ptp_samples.txt
```

## Best Practices

### 1. Network Optimization
- Use dedicated VLAN for PTP traffic
- Enable QoS with highest priority for PTP
- Minimize switch hops to grandmaster
- Use PTP-aware switches when possible

### 2. System Optimization
- Disable power management features
- Use performance CPU governor
- Isolate PTP processes on dedicated cores
- Increase kernel timer frequency

### 3. Monitoring and Alerting
```yaml
Alert Rules:
  - PTP offset > 1 microsecond: WARNING
  - PTP offset > 10 microseconds: CRITICAL
  - PTP link down: CRITICAL
  - Grandmaster change: WARNING
  - Packet loss > 0.01%: WARNING
```

## Integration with ROKO Node

```bash
# Configure ROKO node to use PTP
roko-node config set time.source ptp
roko-node config set time.interface eth0
roko-node config set time.accuracy 100  # nanoseconds

# Verify time source
roko-node time status
# Output:
# Time Source: PTP (eth0)
# Current Offset: 42.3 ns
# Mean Deviation: 18.7 ns
# Sync Quality: EXCELLENT
# Attestation: VALID
```

## Next Steps

1. **Hardware Setup** → [Hardware Requirements](./hardware.md)
2. **Node Installation** → [Node Setup Guide](./node-setup.md)
3. **Start Validating** → [Staking Guide](./staking.md)
4. **Monitor Performance** → [Monitoring Guide](./monitoring.md)

---

*For PTP configuration support, contact: ptp-support@roko.network*