# Node Installation Guide

This comprehensive guide walks you through setting up a ROKO Network validator node from scratch. Follow these steps carefully to ensure proper installation and configuration.

## System Requirements

### Operating System
```yaml
Supported OS:
  - Ubuntu 22.04 LTS (Recommended)
  - Debian 11+
  - RHEL/Rocky/AlmaLinux 9+
  - Amazon Linux 2023

Kernel Version: 5.15+ with RT patches recommended
Filesystem: XFS or ext4
Partitioning: Separate /var partition recommended
```

## Pre-Installation Setup

### 1. System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo dnf update -y  # RHEL/Rocky

# Install essential packages
sudo apt install -y build-essential git curl wget jq net-tools htop
sudo apt install -y software-properties-common apt-transport-https

# Set timezone to UTC
sudo timedatectl set-timezone UTC
```

### 2. Kernel Optimization
```bash
# Edit sysctl.conf
sudo tee -a /etc/sysctl.conf <<EOF
# ROKO Network Node Optimizations
net.core.rmem_default = 134217728
net.core.wmem_default = 134217728
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.core.netdev_max_backlog = 250000
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.ip_local_port_range = 10000 65000
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
fs.file-max = 2097152
EOF

# Apply settings
sudo sysctl -p
```

### 3. Create Service User
```bash
# Create dedicated user for ROKO node
sudo useradd -m -s /bin/bash roko
sudo usermod -aG sudo roko

# Set up directories
sudo mkdir -p /opt/roko /var/lib/roko /var/log/roko
sudo chown -R roko:roko /opt/roko /var/lib/roko /var/log/roko
```

## ROKO Node Installation

### Method 1: Official Installer
```bash
# Download and run installer
curl -sSL https://install.roko.network | sudo bash

# Verify installation
roko-node version
# Output: roko-node v2.1.0-temporal
```

### Method 2: Binary Installation
```bash
# Download binary
wget https://github.com/roko-network/node/releases/latest/download/roko-node-linux-amd64.tar.gz

# Extract and install
tar -xzf roko-node-linux-amd64.tar.gz
sudo mv roko-node /usr/local/bin/
sudo chmod +x /usr/local/bin/roko-node

# Verify checksum
wget https://github.com/roko-network/node/releases/latest/download/checksums.txt
sha256sum -c checksums.txt
```

### Method 3: Build from Source
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Clone repository
git clone https://github.com/roko-network/node.git
cd node

# Build release version
cargo build --release
sudo cp target/release/roko-node /usr/local/bin/
```

## Node Configuration

### 1. Initialize Configuration
```bash
# Initialize node
sudo -u roko roko-node init \
  --network mainnet \
  --validator \
  --data-dir /var/lib/roko \
  --config-dir /etc/roko

# This creates:
# - /etc/roko/config.toml
# - /var/lib/roko/chain/
# - /var/lib/roko/keys/
```

### 2. Edit Configuration File
```toml
# /etc/roko/config.toml

[node]
name = "my-validator-01"
role = "validator"
network = "mainnet"
data_dir = "/var/lib/roko"
log_level = "info"

[network]
listen_addr = "0.0.0.0:30303"
external_addr = "YOUR_PUBLIC_IP:30303"
max_peers = 50
min_peers = 25
bootnodes = [
  "/dns4/boot1.roko.network/tcp/30303/p2p/QmBootnode1",
  "/dns4/boot2.roko.network/tcp/30303/p2p/QmBootnode2"
]

[rpc]
enabled = true
listen_addr = "127.0.0.1:8545"
cors_origins = ["http://localhost:3000"]
max_connections = 100

[websocket]
enabled = true
listen_addr = "127.0.0.1:8546"
max_connections = 50

[metrics]
enabled = true
listen_addr = "127.0.0.1:9090"

[consensus]
engine = "temporal_pos"
block_time_ns = 1000000000  # 1 second in nanoseconds
temporal_window = 100000000  # 100ms window

[validator]
stake_address = "0xYOUR_STAKE_ADDRESS"
reward_address = "0xYOUR_REWARD_ADDRESS"
commission_rate = 0.10  # 10%

[time]
source = "ptp"
interface = "eth0"
accuracy_ns = 100
attestation = true
grandmaster = "/dev/ptp0"

[storage]
ancient_dir = "/var/lib/roko/ancient"
cache_size = 4096  # MB
trie_cache = 2048  # MB
prune_mode = "archive"  # full, fast, or archive

[telemetry]
enabled = true
endpoint = "wss://telemetry.roko.network/submit"
```

### 3. Generate Validator Keys
```bash
# Generate validator keypair
roko-node account new --validator \
  --keystore /var/lib/roko/keys \
  --password /etc/roko/.password

# Output:
Public key: 0x742d35Cc6634C0532925a3b844Bc95e2c8F8C3e7
Path: /var/lib/roko/keys/UTC--2024-01-15T10-30-45.123456789Z--742d35cc6634c0532925a3b844bc95e2c8f8c3e7

# Backup keys securely!
cp -r /var/lib/roko/keys /secure/backup/location/
```

## Systemd Service Setup

### Create Service File
```ini
# /etc/systemd/system/roko-node.service

[Unit]
Description=ROKO Network Validator Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Restart=always
RestartSec=5
User=roko
Group=roko
Environment="HOME=/home/roko"
WorkingDirectory=/var/lib/roko

# Resource Limits
LimitNOFILE=65536
LimitNPROC=4096

# Security
PrivateTmp=true
ProtectSystem=full
NoNewPrivileges=true

# Performance
CPUWeight=100
IOWeight=100
TasksMax=4096

ExecStart=/usr/local/bin/roko-node \
  --config /etc/roko/config.toml \
  --validator \
  --unlock 0x742d35Cc6634C0532925a3b844Bc95e2c8F8C3e7 \
  --password /etc/roko/.password \
  --metrics \
  --pprof \
  --log-json

ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable roko-node

# Start the node
sudo systemctl start roko-node

# Check status
sudo systemctl status roko-node

# View logs
sudo journalctl -u roko-node -f
```

## Firewall Configuration

```bash
# Configure UFW (Ubuntu)
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 30303/tcp     # P2P
sudo ufw allow 30303/udp     # P2P Discovery
sudo ufw allow from any to any port 319 proto udp  # PTP
sudo ufw allow from 127.0.0.1 to any port 8545     # RPC (local only)
sudo ufw allow from 127.0.0.1 to any port 8546     # WebSocket (local only)
sudo ufw allow from 127.0.0.1 to any port 9090     # Metrics (local only)
sudo ufw enable

# Or using iptables
sudo iptables -A INPUT -p tcp --dport 30303 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 30303 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 319 -j ACCEPT
sudo iptables-save > /etc/iptables/rules.v4
```

## Node Synchronization

### Monitor Sync Progress
```bash
# Check sync status
roko-node sync status

# Output:
Current Block: 1,234,567
Highest Block: 1,234,890
Sync Progress: 99.97%
Peers: 42
Time Accuracy: 87ns
Estimated Time: ~2 minutes

# Watch sync in real-time
watch -n 1 'roko-node sync status'
```

### Fast Sync Options
```bash
# Download snapshot (recommended for new nodes)
wget https://snapshots.roko.network/mainnet-latest.tar.gz
tar -xzf mainnet-latest.tar.gz -C /var/lib/roko/chain/

# Or use state sync
roko-node sync --mode=state \
  --trusted-height=1234567 \
  --trusted-hash=0xabcd...
```

## Health Checks

### Automated Health Check Script
```bash
#!/bin/bash
# /usr/local/bin/roko-health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "ROKO Node Health Check"
echo "====================="

# Check if service is running
if systemctl is-active --quiet roko-node; then
    echo -e "${GREEN}✓${NC} Service is running"
else
    echo -e "${RED}✗${NC} Service is not running"
    exit 1
fi

# Check sync status
SYNC_STATUS=$(roko-node sync status --json | jq -r '.syncing')
if [ "$SYNC_STATUS" = "false" ]; then
    echo -e "${GREEN}✓${NC} Node is fully synced"
else
    echo -e "${YELLOW}⚠${NC} Node is syncing"
fi

# Check peer count
PEER_COUNT=$(roko-node peers count)
if [ $PEER_COUNT -gt 20 ]; then
    echo -e "${GREEN}✓${NC} Connected to $PEER_COUNT peers"
elif [ $PEER_COUNT -gt 10 ]; then
    echo -e "${YELLOW}⚠${NC} Connected to $PEER_COUNT peers (low)"
else
    echo -e "${RED}✗${NC} Only $PEER_COUNT peers connected"
fi

# Check time sync
TIME_OFFSET=$(roko-node time offset)
if [ $(echo "$TIME_OFFSET < 1000" | bc) -eq 1 ]; then
    echo -e "${GREEN}✓${NC} Time sync: ${TIME_OFFSET}ns offset"
else
    echo -e "${RED}✗${NC} Time sync poor: ${TIME_OFFSET}ns offset"
fi

# Check disk space
DISK_USAGE=$(df /var/lib/roko | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓${NC} Disk usage: ${DISK_USAGE}%"
elif [ $DISK_USAGE -lt 90 ]; then
    echo -e "${YELLOW}⚠${NC} Disk usage: ${DISK_USAGE}% (high)"
else
    echo -e "${RED}✗${NC} Disk usage: ${DISK_USAGE}% (critical)"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓${NC} Memory usage: ${MEM_USAGE}%"
else
    echo -e "${YELLOW}⚠${NC} Memory usage: ${MEM_USAGE}% (high)"
fi

echo ""
echo "Health check complete!"
```

### Schedule Health Checks
```bash
# Add to crontab
crontab -e

# Run health check every 5 minutes
*/5 * * * * /usr/local/bin/roko-health-check.sh >> /var/log/roko/health.log 2>&1
```

## Backup and Recovery

### Backup Strategy
```bash
#!/bin/bash
# /usr/local/bin/backup-roko.sh

BACKUP_DIR="/backup/roko/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Stop node for consistency
sudo systemctl stop roko-node

# Backup critical files
cp -r /etc/roko $BACKUP_DIR/
cp -r /var/lib/roko/keys $BACKUP_DIR/
cp -r /var/lib/roko/chain/nodekey $BACKUP_DIR/

# Create tarball
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# Restart node
sudo systemctl start roko-node

# Upload to remote storage
aws s3 cp $BACKUP_DIR.tar.gz s3://my-backups/roko/

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

## Troubleshooting

### Common Issues

#### Node Won't Start
```bash
# Check logs
journalctl -u roko-node -n 100 --no-pager

# Verify config
roko-node config validate

# Check permissions
ls -la /var/lib/roko/
ls -la /etc/roko/
```

#### Sync Issues
```bash
# Reset peer database
rm -rf /var/lib/roko/chain/nodes
sudo systemctl restart roko-node

# Add specific peers
roko-node admin addPeer "enode://..."
```

#### High Resource Usage
```bash
# Check goroutines
curl http://localhost:6060/debug/pprof/goroutine?debug=1

# Memory profile
curl http://localhost:6060/debug/pprof/heap > heap.pprof
go tool pprof heap.pprof
```

## Next Steps

1. **Configure PTP** → [PTP Setup Guide](./ptp-setup.md)
2. **Begin Staking** → [Staking Guide](./staking.md)
3. **Setup Monitoring** → [Monitoring Guide](./monitoring.md)
4. **Join Community** → [Discord](https://discord.gg/roko)

---

*For installation support: node-support@roko.network*