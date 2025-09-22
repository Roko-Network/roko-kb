# Setup Guide

## Validator Node Setup

### System Requirements
- Ubuntu 22.04 LTS or later
- 32GB RAM minimum
- 1TB NVMe SSD
- 1Gbps network connection
- Static IP address

### Installation

#### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y build-essential git chrony
```

#### 2. Install ROKO Node
```bash
wget https://github.com/roko-network/node/releases/latest/roko-node
chmod +x roko-node
sudo mv roko-node /usr/local/bin/
```

#### 3. Configure Time Sync
```bash
# Configure chrony for PTP
sudo nano /etc/chrony/chrony.conf
# Add: refclock PHC /dev/ptp0 poll 1 dpoll -2 offset 0
```

#### 4. Initialize Node
```bash
roko-node init --validator \
  --moniker "YourValidatorName" \
  --chain-id roko-1
```

#### 5. Start Validator
```bash
roko-node start --time-source ptp \
  --consensus-port 26656 \
  --api-port 26657
```

### Key Management
```bash
# Generate validator keys
roko-node keys add validator

# Backup keys (CRITICAL!)
roko-node keys export validator > validator-key-backup.json
```

---

> **Setup complete**: Your validator is ready to synchronize time.