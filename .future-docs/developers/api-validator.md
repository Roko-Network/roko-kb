# Validator API

The Validator API provides endpoints for validator management, monitoring, and operations on the ROKO Network.

## Authentication

Validator API requires enhanced authentication with validator credentials.

```bash
# Generate validator API credentials
roko-node validator api-key generate \
  --validator-address 0x742d35Cc... \
  --sign-with-key /path/to/validator.key

# Returns
{
  "apiKey": "vk_live_abc123...",
  "apiSecret": "vks_xyz789...",
  "validatorId": "val_123",
  "permissions": ["validator:*", "attestation:write"]
}
```

## Validator Management

### Register Validator

```bash
POST /v1/validator/register
```

Register a new validator on the network.

**Request:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc95e2c8F8C3e7",
  "publicKey": "0x04abc123...",
  "stake": "10000000000000000000000",
  "commission": 1000,
  "metadata": {
    "moniker": "Temporal Validator 01",
    "website": "https://validator.example.com",
    "description": "High-precision temporal validator",
    "contact": "ops@validator.example.com"
  },
  "hardware": {
    "cpu": "AMD EPYC 7763",
    "ram": "256GB ECC",
    "timeSource": "Rubidium Atomic Clock",
    "accuracy": 50
  },
  "signature": "0xsignature..."
}
```

**Response:**
```json
{
  "validatorId": "val_abc123",
  "status": "pending_activation",
  "activationHeight": 1234567,
  "estimatedActivation": "2024-01-15T12:00:00Z",
  "stakeConfirmation": "0xtxhash...",
  "rank": 42
}
```

### Get Validator Status

```bash
GET /v1/validator/{validatorId}/status
```

**Response:**
```json
{
  "validatorId": "val_abc123",
  "address": "0x742d35Cc...",
  "status": "active",
  "uptime": 99.98,
  "performance": {
    "blocksProposed": 1024,
    "blocksMissed": 2,
    "attestations": 50000,
    "avgTimeAccuracy": 87,
    "mevPrevented": 156
  },
  "stake": {
    "self": "10000000000000000000000",
    "delegated": "50000000000000000000000",
    "total": "60000000000000000000000",
    "rank": 42
  },
  "rewards": {
    "accumulated": "1234500000000000000000",
    "pending": "12340000000000000000",
    "lastClaim": "2024-01-14T10:00:00Z"
  },
  "slashing": {
    "events": 0,
    "totalSlashed": "0",
    "riskScore": 5
  },
  "hardware": {
    "timeAccuracy": 87,
    "syncQuality": "EXCELLENT",
    "attestationRate": 1000,
    "lastAttestation": "2024-01-15T10:30:45.123456789Z"
  }
}
```

### Update Validator Settings

```bash
PATCH /v1/validator/{validatorId}/settings
```

**Request:**
```json
{
  "commission": 1500,
  "metadata": {
    "website": "https://new.validator.example.com",
    "description": "Updated description"
  },
  "rewardAddress": "0xNewRewardAddress...",
  "operatorAddress": "0xNewOperatorAddress..."
}
```

## Staking Operations

### Stake Tokens

```bash
POST /v1/validator/{validatorId}/stake
```

**Request:**
```json
{
  "amount": "5000000000000000000000",
  "duration": 180,
  "autoCompound": true,
  "fromAddress": "0xStaker...",
  "signature": "0xsig..."
}
```

### Request Unstake

```bash
POST /v1/validator/{validatorId}/unstake
```

**Request:**
```json
{
  "amount": "1000000000000000000000",
  "immediate": false,
  "acceptPenalty": false
}
```

**Response:**
```json
{
  "unstakeId": "unstake_xyz",
  "amount": "1000000000000000000000",
  "availableAt": "2024-02-05T10:30:45Z",
  "unbondingPeriod": 1814400,
  "penalty": "0"
}
```

### Claim Rewards

```bash
POST /v1/validator/{validatorId}/rewards/claim
```

**Request:**
```json
{
  "compound": false,
  "recipient": "0xRecipient..."
}
```

**Response:**
```json
{
  "claimed": "123450000000000000000",
  "transaction": "0xtxhash...",
  "newBalance": "0",
  "nextRewardAt": "2024-01-16T00:00:00Z"
}
```

## Delegation Management

### List Delegators

```bash
GET /v1/validator/{validatorId}/delegators
```

**Response:**
```json
{
  "delegators": [
    {
      "address": "0xDelegator1...",
      "amount": "10000000000000000000000",
      "since": "2024-01-01T00:00:00Z",
      "rewards": "1234000000000000000",
      "autoCompound": true
    },
    {
      "address": "0xDelegator2...",
      "amount": "5000000000000000000000",
      "since": "2024-01-05T00:00:00Z",
      "rewards": "567000000000000000",
      "autoCompound": false
    }
  ],
  "total": 156,
  "totalDelegated": "50000000000000000000000",
  "averageStake": "320512820512820512820"
}
```

### Delegator Analytics

```bash
GET /v1/validator/{validatorId}/delegators/analytics
```

**Response:**
```json
{
  "metrics": {
    "totalDelegators": 156,
    "newDelegatorsThisMonth": 12,
    "churnRate": 2.5,
    "averageStakeDuration": 127,
    "loyaltyScore": 87
  },
  "distribution": [
    {"range": "0-1000", "count": 45, "percentage": 28.8},
    {"range": "1000-10000", "count": 78, "percentage": 50.0},
    {"range": "10000-100000", "count": 30, "percentage": 19.2},
    {"range": "100000+", "count": 3, "percentage": 1.9}
  ],
  "topDelegators": [
    {"address": "0xWhale...", "amount": "500000000000000000000000", "percentage": 10}
  ]
}
```

## Performance Monitoring

### Get Performance Metrics

```bash
GET /v1/validator/{validatorId}/metrics
```

**Response:**
```json
{
  "period": "24h",
  "blocks": {
    "proposed": 287,
    "missed": 1,
    "successRate": 99.65
  },
  "attestations": {
    "total": 8640,
    "successful": 8638,
    "failed": 2,
    "averageTime": 87
  },
  "time": {
    "accuracy": {
      "current": 87,
      "average": 92,
      "best": 45,
      "worst": 234
    },
    "drift": {
      "current": 12,
      "max": 156,
      "events": 3
    }
  },
  "network": {
    "peers": 48,
    "latency": 12,
    "bandwidth": {
      "in": "125.4 MB/s",
      "out": "89.2 MB/s"
    }
  },
  "resources": {
    "cpu": 45.2,
    "memory": 67.8,
    "disk": 34.5,
    "temperature": 62
  }
}
```

### Historical Performance

```bash
GET /v1/validator/{validatorId}/history
```

**Query Parameters:**
- `period`: `hour`, `day`, `week`, `month`
- `metric`: `blocks`, `attestations`, `rewards`, `accuracy`
- `resolution`: `1m`, `5m`, `1h`, `1d`

**Response:**
```json
{
  "period": "week",
  "metric": "accuracy",
  "dataPoints": [
    {"timestamp": "2024-01-08T00:00:00Z", "value": 89},
    {"timestamp": "2024-01-09T00:00:00Z", "value": 91},
    {"timestamp": "2024-01-10T00:00:00Z", "value": 87},
    {"timestamp": "2024-01-11T00:00:00Z", "value": 93},
    {"timestamp": "2024-01-12T00:00:00Z", "value": 88},
    {"timestamp": "2024-01-13T00:00:00Z", "value": 90},
    {"timestamp": "2024-01-14T00:00:00Z", "value": 92}
  ],
  "statistics": {
    "average": 90,
    "median": 90,
    "stdDev": 2.16,
    "min": 87,
    "max": 93
  }
}
```

## Slashing & Penalties

### Get Slashing History

```bash
GET /v1/validator/{validatorId}/slashing
```

**Response:**
```json
{
  "events": [
    {
      "id": "slash_001",
      "timestamp": "2024-01-10T15:30:00Z",
      "type": "downtime",
      "duration": 14400,
      "amount": "10000000000000000000",
      "reason": "Offline for 4 hours"
    }
  ],
  "totalSlashed": "10000000000000000000",
  "riskMetrics": {
    "score": 15,
    "trend": "improving",
    "recommendations": [
      "Implement redundant nodes",
      "Improve monitoring alerts"
    ]
  }
}
```

### Appeal Slashing

```bash
POST /v1/validator/{validatorId}/slashing/{slashId}/appeal
```

**Request:**
```json
{
  "reason": "Network partition caused by ISP outage",
  "evidence": [
    {"type": "log", "url": "https://..."},
    {"type": "attestation", "hash": "0x..."}
  ],
  "signature": "0xsig..."
}
```

## Hardware Management

### Update Hardware Config

```bash
POST /v1/validator/{validatorId}/hardware/update
```

**Request:**
```json
{
  "timeSource": {
    "type": "atomic_clock",
    "model": "Microsemi 5071A",
    "accuracy": 10
  },
  "server": {
    "cpu": "AMD EPYC 7773X",
    "ram": "512GB",
    "network": "100Gbps"
  },
  "attestation": "0xhardware_attestation..."
}
```

### Time Sync Status

```bash
GET /v1/validator/{validatorId}/timesync
```

**Response:**
```json
{
  "syncStatus": "EXCELLENT",
  "timeSource": "Cesium Atomic Clock",
  "offset": 23,
  "drift": 2,
  "accuracy": 10,
  "lastSync": "2024-01-15T10:30:45.123456789Z",
  "ptp": {
    "grandmaster": "gm_001",
    "delay": 456,
    "offset": 23,
    "frequency": -12
  },
  "quality": {
    "score": 98,
    "grade": "A+",
    "percentile": 99.5
  }
}
```

## Governance Participation

### Cast Vote

```bash
POST /v1/validator/{validatorId}/governance/vote
```

**Request:**
```json
{
  "proposalId": "prop_123",
  "vote": "yes",
  "weight": "60000000000000000000000",
  "reason": "Supports network decentralization",
  "signature": "0xsig..."
}
```

### Create Proposal

```bash
POST /v1/validator/{validatorId}/governance/propose
```

**Request:**
```json
{
  "title": "Reduce Minimum Stake Requirement",
  "description": "Propose reducing minimum stake from 10,000 to 5,000 ROKO",
  "type": "parameter_change",
  "parameters": {
    "minStake": "5000000000000000000000"
  },
  "deposit": "1000000000000000000000",
  "votingPeriod": 604800
}
```

## Alerts & Notifications

### Configure Alerts

```bash
POST /v1/validator/{validatorId}/alerts/config
```

**Request:**
```json
{
  "alerts": [
    {
      "type": "downtime",
      "threshold": 300,
      "severity": "critical",
      "channels": ["email", "sms", "discord"]
    },
    {
      "type": "time_drift",
      "threshold": 1000,
      "severity": "warning",
      "channels": ["email"]
    },
    {
      "type": "missed_blocks",
      "threshold": 3,
      "window": 3600,
      "severity": "warning",
      "channels": ["discord"]
    }
  ],
  "contacts": {
    "email": "ops@validator.example.com",
    "sms": "+1234567890",
    "discord": "webhook_url"
  }
}
```

### Get Alert History

```bash
GET /v1/validator/{validatorId}/alerts/history
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "timestamp": "2024-01-15T08:15:00Z",
      "type": "time_drift",
      "severity": "warning",
      "message": "Time drift exceeded 1000ns",
      "value": 1234,
      "resolved": true,
      "resolvedAt": "2024-01-15T08:17:00Z"
    }
  ],
  "statistics": {
    "total": 15,
    "critical": 1,
    "warning": 10,
    "info": 4,
    "mttr": 180
  }
}
```

## WebSocket Subscriptions

```javascript
const ws = new WebSocket('wss://api.roko.network/v1/validator/stream');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'vk_live_abc123...'
  }));
  
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: [
      'performance',
      'rewards',
      'delegations',
      'alerts'
    ],
    validatorId: 'val_abc123'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  switch(msg.type) {
    case 'performance':
      updateDashboard(msg.metrics);
      break;
    case 'reward':
      console.log(`New reward: ${msg.amount} ROKO`);
      break;
    case 'delegation':
      console.log(`New delegation: ${msg.amount} from ${msg.delegator}`);
      break;
    case 'alert':
      handleAlert(msg);
      break;
  }
});
```

## Rate Limiting

Validator API has higher rate limits than standard API.

| Operation | Limit | Window |
|-----------|-------|--------|
| Read operations | 1000/min | 60s |
| Write operations | 100/min | 60s |
| Governance | 10/hour | 3600s |
| Hardware updates | 10/day | 86400s |

## Error Codes

| Code | Description |
|------|-------------|
| `VAL001` | Validator not found |
| `VAL002` | Insufficient stake |
| `VAL003` | Validator not active |
| `VAL004` | Operation not permitted |
| `VAL005` | Hardware attestation failed |
| `VAL006` | Time sync out of range |
| `VAL007` | Slashing in progress |
| `VAL008` | Delegation limit reached |

## Next Steps

- [WebSocket Events](./api-websocket.md) - Real-time event streaming
- [Validator Setup](../validators/getting-started.md) - Become a validator
- [Monitoring Guide](../validators/monitoring.md) - Monitor your validator
- [Staking Guide](../validators/staking.md) - Staking operations

---

*Validator Support: validators@roko.network*