# Deployment Guide

## Smart Contract Deployment on ROKO

### Prerequisites
- ROKO SDK installed
- Wallet with testnet/mainnet tokens
- Compiled contract artifacts

### Deployment Steps

#### 1. Compile Contract
```bash
npx hardhat compile --network roko
```

#### 2. Deploy Script
```javascript
const { TimeFactory } = require('@roko/sdk');

async function deploy() {
    const factory = new TimeFactory(signer);
    const contract = await factory.deploy({
        timePrecision: 'nanosecond',
        selfExecuting: true
    });
    
    console.log('Deployed at:', contract.address);
    console.log('Timestamp:', contract.deploymentTime);
}
```

#### 3. Verify Contract
```bash
npx hardhat verify --network roko CONTRACT_ADDRESS
```

### Network Configuration

#### Testnet
```javascript
{
    chainId: 7777,
    rpc: 'https://testnet.roko.network',
    explorer: 'https://scan-testnet.roko.network'
}
```

#### Mainnet
```javascript
{
    chainId: 7776,
    rpc: 'https://rpc.roko.network',
    explorer: 'https://scan.roko.network'
}
```

---

> **Deploy with precision**: Every deployment timestamped to the nanosecond.