# Validator Tutorial

## Complete Guide to Running a ROKO Validator

### Prerequisites
- Ubuntu 22.04 server
- 32GB RAM, 1TB NVMe SSD
- Static IP address
- Basic Linux knowledge

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y build-essential git curl wget jq chrony

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 26656/tcp
sudo ufw allow 26657/tcp
sudo ufw enable
```

### Step 2: Install ROKO Node

```bash
# Download binary
wget https://github.com/roko-network/node/releases/latest/roko-node
chmod +x roko-node
sudo mv roko-node /usr/local/bin/

# Verify installation
roko-node version
```

### Step 3: Configure Time Sync

```bash
# Install PTP support
sudo apt install -y linuxptp

# Configure chrony for PTP
sudo nano /etc/chrony/chrony.conf
# Add these lines:
# server time.google.com iburst
# server time.cloudflare.com iburst
# makestep 0.001 3
# rtcsync

sudo systemctl restart chrony
```

### Step 4: Initialize Validator

```bash
# Initialize node
roko-node init my-validator --chain-id roko-1

# Create validator key
roko-node keys add validator

# Save the mnemonic securely!
```

### Step 5: Configure Node

```bash
# Edit config
nano ~/.roko/config/config.toml

# Set persistent peers
persistent_peers = "node1@ip:26656,node2@ip:26656"

# Enable Prometheus metrics
prometheus = true
```

### Step 6: Start Node & Sync

```bash
# Create systemd service
sudo tee /etc/systemd/system/roko.service > /dev/null <<EOF
[Unit]
Description=ROKO Node
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/roko-node start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl enable roko
sudo systemctl start roko

# Check logs
journalctl -u roko -f
```

### Step 7: Create Validator

```bash
# After sync completes, create validator
roko-node tx staking create-validator \
  --amount=10000000000uroko \
  --pubkey=$(roko-node tendermint show-validator) \
  --moniker="My Validator" \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="10000" \
  --from=validator \
  --fees=1000uroko
```

---

> **Validator ready**: You're now securing the temporal network!