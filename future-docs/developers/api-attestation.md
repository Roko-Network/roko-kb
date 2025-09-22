# Time Attestation API

The Time Attestation API provides nanosecond-precision temporal proofs for transactions, smart contracts, and external systems. This API is the foundation of ROKO's temporal ordering guarantees.

## Overview

The Time Attestation API enables:
- Hardware-attested nanosecond timestamps
- Cryptographic time proofs
- Temporal ordering verification
- Cross-chain time synchronization
- MEV prevention through time-based ordering

## Authentication

### API Keys

```bash
# Generate API key
curl -X POST https://api.roko.network/v1/auth/keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": ["attestation:read", "attestation:write"],
    "rateLimit": 1000
  }'

# Response
{
  "apiKey": "rk_live_abc123...",
  "apiSecret": "rks_abc123...",
  "createdAt": "2024-01-15T10:30:45.123456789Z",
  "expiresAt": "2025-01-15T10:30:45.123456789Z"
}
```

### Request Signing

```javascript
// Sign requests with HMAC-SHA256
const crypto = require('crypto');

function signRequest(method, path, body, apiSecret) {
  const timestamp = Date.now();
  const message = `${method}${path}${timestamp}${JSON.stringify(body)}`;
  
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
  
  return {
    'X-ROKO-Key': apiKey,
    'X-ROKO-Timestamp': timestamp,
    'X-ROKO-Signature': signature
  };
}
```

## Endpoints

### Get Current Time

```bash
GET /v1/time/current
```

Returns hardware-attested current time with nanosecond precision.

**Response:**
```json
{
  "nanotime": "1705318245123456789",
  "unixMs": 1705318245123,
  "iso8601": "2024-01-15T10:30:45.123456789Z",
  "attestation": {
    "hardware": "Intel SGX",
    "signature": "0xabc123...",
    "certificate": "-----BEGIN CERTIFICATE-----\nMIID...",
    "accuracy": 87,
    "drift": 12
  },
  "syncStatus": {
    "source": "GPS/Atomic",
    "quality": "EXCELLENT",
    "offset": 23
  }
}
```

### Create Time Attestation

```bash
POST /v1/attestation/create
```

Creates a cryptographic proof of time for data.

**Request Body:**
```json
{
  "data": {
    "type": "transaction",
    "hash": "0x742d35cc...",
    "sender": "0x123...",
    "recipient": "0x456...",
    "value": "1000000000000000000",
    "nonce": 42
  },
  "options": {
    "precision": "nanosecond",
    "includeHardwareProof": true,
    "chainAnchoring": true
  }
}
```

**Response:**
```json
{
  "attestationId": "att_abc123",
  "timestamp": {
    "nano": "1705318245987654321",
    "formatted": "2024-01-15T10:30:45.987654321Z"
  },
  "proof": {
    "merkleRoot": "0xdef456...",
    "merkleProof": [
      "0x111...",
      "0x222...",
      "0x333..."
    ],
    "signature": "0x789abc...",
    "publicKey": "0xpubkey..."
  },
  "hardware": {
    "device": "Mellanox ConnectX-6",
    "attestation": "0xhardware...",
    "teeReport": {
      "mrenclave": "0xabc...",
      "mrsigner": "0xdef...",
      "isvprodid": 1,
      "isvsvn": 1
    }
  },
  "anchoring": {
    "status": "pending",
    "estimatedBlock": 1234567,
    "estimatedTime": "2024-01-15T10:31:00Z"
  }
}
```

### Verify Attestation

```bash
GET /v1/attestation/{attestationId}/verify
```

Verifies the validity of a time attestation.

**Response:**
```json
{
  "valid": true,
  "attestationId": "att_abc123",
  "timestamp": "1705318245987654321",
  "verification": {
    "signatureValid": true,
    "merkleProofValid": true,
    "hardwareAttestationValid": true,
    "chainAnchorValid": true,
    "timeRangeValid": true
  },
  "details": {
    "signerAddress": "0xvalidator...",
    "hardwareId": "hw_123",
    "anchorBlock": 1234567,
    "anchorTxHash": "0xanchor..."
  }
}
```

### Batch Attestation

```bash
POST /v1/attestation/batch
```

Create attestations for multiple items efficiently.

**Request Body:**
```json
{
  "items": [
    {
      "id": "item1",
      "data": {"type": "trade", "amount": 100}
    },
    {
      "id": "item2",
      "data": {"type": "order", "price": 50000}
    }
  ],
  "options": {
    "aggregationType": "merkle_tree",
    "compressionEnabled": true
  }
}
```

**Response:**
```json
{
  "batchId": "batch_xyz789",
  "timestamp": "1705318245999999999",
  "count": 2,
  "merkleRoot": "0xroot...",
  "attestations": [
    {
      "id": "item1",
      "attestationId": "att_001",
      "proof": ["0xa...", "0xb..."]
    },
    {
      "id": "item2",
      "attestationId": "att_002",
      "proof": ["0xc...", "0xd..."]
    }
  ],
  "gasOptimized": true,
  "estimatedSavings": "45%"
}
```

### Query Attestations

```bash
GET /v1/attestations/query
```

Query historical attestations with filters.

**Query Parameters:**
- `startTime`: Start timestamp (nanoseconds)
- `endTime`: End timestamp (nanoseconds)
- `dataHash`: Hash of attested data
- `creator`: Creator address
- `limit`: Maximum results (default: 100)
- `offset`: Pagination offset

**Example:**
```bash
curl "https://api.roko.network/v1/attestations/query?\
startTime=1705318240000000000&\
endTime=1705318250000000000&\
creator=0x123...&\
limit=10"
```

**Response:**
```json
{
  "attestations": [
    {
      "id": "att_001",
      "timestamp": "1705318245123456789",
      "dataHash": "0xhash...",
      "creator": "0x123...",
      "proof": "0xproof..."
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## WebSocket Streaming

### Real-time Attestations

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.roko.network/v1/attestations');

ws.on('open', () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'rk_live_abc123...'
  }));
  
  // Subscribe to attestations
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['attestations', 'time'],
    filters: {
      minValue: '1000000000000000000',
      types: ['transaction', 'trade']
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.type === 'attestation') {
    console.log('New attestation:', message.data);
    // Process real-time attestation
  } else if (message.type === 'time_update') {
    console.log('Time sync:', message.timestamp);
  }
});
```

## Smart Contract Integration

### On-chain Verification

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITimeAttestation {
    struct Attestation {
        uint256 timestamp;
        bytes32 dataHash;
        bytes signature;
        bytes32 merkleRoot;
    }
    
    function verifyAttestation(
        Attestation calldata attestation,
        bytes32[] calldata merkleProof
    ) external view returns (bool);
    
    function getAttestationTime(
        bytes32 attestationId
    ) external view returns (uint256);
}

contract TimeOrderedExecution {
    ITimeAttestation public attestationContract;
    
    function executeWithTimeProof(
        bytes calldata data,
        ITimeAttestation.Attestation calldata attestation,
        bytes32[] calldata proof
    ) external {
        // Verify time attestation
        require(
            attestationContract.verifyAttestation(attestation, proof),
            "Invalid time proof"
        );
        
        // Ensure temporal ordering
        require(
            attestation.timestamp > lastExecutionTime,
            "Out of temporal order"
        );
        
        // Execute logic
        _execute(data);
        lastExecutionTime = attestation.timestamp;
    }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { TimeAttestationClient } from '@roko/attestation-sdk';

const client = new TimeAttestationClient({
  apiKey: process.env.ROKO_API_KEY,
  network: 'mainnet'
});

// Create attestation
async function attestTransaction(tx: Transaction) {
  const attestation = await client.createAttestation({
    data: tx,
    options: {
      precision: 'nanosecond',
      includeHardwareProof: true
    }
  });
  
  console.log(`Attestation ID: ${attestation.id}`);
  console.log(`Timestamp: ${attestation.timestamp.nano}`);
  
  // Store proof for later verification
  await db.saveAttestation(tx.hash, attestation);
  
  return attestation;
}

// Verify attestation
async function verifyTiming(attestationId: string) {
  const result = await client.verifyAttestation(attestationId);
  
  if (!result.valid) {
    throw new Error(`Invalid attestation: ${result.reason}`);
  }
  
  return result;
}
```

### Python

```python
from roko_attestation import AttestationClient
import asyncio

client = AttestationClient(
    api_key="rk_live_abc123...",
    network="mainnet"
)

async def attest_data(data: dict) -> dict:
    """Create time attestation for data"""
    
    attestation = await client.create_attestation(
        data=data,
        precision="nanosecond",
        hardware_proof=True
    )
    
    print(f"Attestation created:")
    print(f"  ID: {attestation['id']}")
    print(f"  Time: {attestation['timestamp']['nano']}")
    print(f"  Proof: {attestation['proof']['signature'][:16]}...")
    
    return attestation

# Batch attestation
async def batch_attest(items: list) -> dict:
    """Create attestations for multiple items"""
    
    batch = await client.batch_attestation(
        items=items,
        aggregation="merkle_tree"
    )
    
    print(f"Batch attestation complete:")
    print(f"  Count: {batch['count']}")
    print(f"  Root: {batch['merkleRoot']}")
    print(f"  Gas saved: {batch['estimatedSavings']}")
    
    return batch

# Run
async def main():
    data = {"type": "order", "amount": 100, "price": 50000}
    attestation = await attest_data(data)
    
    # Verify later
    verification = await client.verify_attestation(attestation['id'])
    assert verification['valid'] == True

asyncio.run(main())
```

## Rate Limiting

### Limits by Tier

| Tier | Requests/Second | Requests/Day | Batch Size |
|------|-----------------|--------------|------------|
| Free | 10 | 1,000 | 10 |
| Basic | 100 | 100,000 | 100 |
| Pro | 1,000 | 10,000,000 | 1,000 |
| Enterprise | Custom | Unlimited | Custom |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318250
X-RateLimit-Burst: 200
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_TIMESTAMP",
    "message": "Timestamp is outside acceptable range",
    "details": {
      "provided": "1705318245123456789",
      "minAcceptable": "1705318240000000000",
      "maxAcceptable": "1705318250000000000"
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_API_KEY` | Invalid or expired API key | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INVALID_TIMESTAMP` | Timestamp out of range | 400 |
| `HARDWARE_UNAVAILABLE` | Hardware attestation unavailable | 503 |
| `INVALID_PROOF` | Proof verification failed | 400 |
| `INSUFFICIENT_PRECISION` | Cannot meet precision requirement | 422 |

## Best Practices

1. **Cache Attestations**: Store attestations locally to avoid repeated API calls
2. **Batch Operations**: Use batch endpoints for multiple attestations
3. **Handle Clock Drift**: Account for time differences between systems
4. **Verify Critical Operations**: Always verify attestations for high-value transactions
5. **Use WebSockets**: For real-time applications, use WebSocket streaming
6. **Implement Retries**: Use exponential backoff for failed requests

## Next Steps

- [Validator API](./api-validator.md) - Validator-specific endpoints
- [WebSocket Events](./api-websocket.md) - Real-time event streaming
- [SDK Documentation](./sdks.md) - Language-specific SDKs
- [Smart Contract Examples](./contract-examples.md) - On-chain integration

---

*API Support: api@roko.network | Status: status.roko.network*