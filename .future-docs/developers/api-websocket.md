# WebSocket Events API

Real-time bidirectional communication for ROKO Network events, enabling instant updates for transactions, blocks, attestations, and network state changes.

## Connection

### WebSocket Endpoints

```javascript
// Mainnet
const ws = new WebSocket('wss://stream.roko.network/v1');

// Testnet
const ws = new WebSocket('wss://stream-testnet.roko.network/v1');

// Local development
const ws = new WebSocket('ws://localhost:8546');
```

### Authentication

```javascript
// Connect and authenticate
ws.on('open', () => {
  // Send authentication message
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'rk_live_abc123...',
    timestamp: Date.now(),
    signature: generateSignature(apiSecret, Date.now())
  }));
});

// Handle authentication response
ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'auth_success') {
    console.log('Authenticated:', msg.sessionId);
    // Now subscribe to channels
  } else if (msg.type === 'auth_error') {
    console.error('Authentication failed:', msg.error);
  }
});
```

## Subscription Management

### Subscribe to Channels

```javascript
// Subscribe to multiple channels
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: [
    'blocks',
    'transactions',
    'attestations',
    'validators',
    'governance'
  ],
  filters: {
    transactions: {
      from: '0x742d35Cc...',
      minValue: '1000000000000000000'
    },
    blocks: {
      validator: '0xValidator...'
    }
  }
}));
```

### Unsubscribe

```javascript
ws.send(JSON.stringify({
  type: 'unsubscribe',
  channels: ['governance']
}));
```

## Event Channels

### Blocks Channel

Real-time block production events.

```javascript
// Subscribe to blocks
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['blocks']
}));

// Block event
{
  "type": "block",
  "data": {
    "number": 1234567,
    "hash": "0xabc123...",
    "parentHash": "0xdef456...",
    "timestamp": "1705318245987654321",
    "validator": "0x742d35Cc...",
    "transactions": 142,
    "attestations": 89,
    "gasUsed": "12456789",
    "gasLimit": "30000000",
    "baseFee": "20000000000",
    "timeAccuracy": 87,
    "mevPrevented": 3
  }
}
```

### Transactions Channel

Real-time transaction events.

```javascript
// Subscribe with filters
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['transactions'],
  filters: {
    transactions: {
      to: '0xMyAddress...',
      minValue: '1000000000000000000',
      types: ['transfer', 'swap', 'stake']
    }
  }
}));

// Transaction event
{
  "type": "transaction",
  "data": {
    "hash": "0xtx123...",
    "from": "0xSender...",
    "to": "0xRecipient...",
    "value": "5000000000000000000",
    "nonce": 42,
    "gasPrice": "25000000000",
    "gasLimit": "21000",
    "input": "0x...",
    "timestamp": "1705318245123456789",
    "blockNumber": 1234567,
    "status": "pending",
    "attestation": {
      "id": "att_123",
      "timestamp": "1705318245123456789",
      "accuracy": 45
    }
  }
}
```

### Attestations Channel

Real-time time attestation events.

```javascript
// Subscribe to attestations
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['attestations'],
  filters: {
    attestations: {
      minAccuracy: 100,
      validators: ['0xVal1...', '0xVal2...']
    }
  }
}));

// Attestation event
{
  "type": "attestation",
  "data": {
    "id": "att_xyz789",
    "timestamp": "1705318245987654321",
    "dataHash": "0xhash...",
    "validator": "0xValidator...",
    "accuracy": 67,
    "hardwareProof": "0xproof...",
    "signature": "0xsig...",
    "merkleRoot": "0xroot...",
    "blockNumber": 1234567
  }
}
```

### Validators Channel

Validator status updates and changes.

```javascript
// Subscribe to validator events
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['validators'],
  filters: {
    validators: {
      addresses: ['0xVal1...', '0xVal2...'],
      events: ['status_change', 'slashing', 'rewards']
    }
  }
}));

// Validator event
{
  "type": "validator_update",
  "data": {
    "validator": "0x742d35Cc...",
    "event": "status_change",
    "previousStatus": "active",
    "newStatus": "jailed",
    "reason": "Excessive downtime",
    "timestamp": "1705318245000000000",
    "details": {
      "downtime": 14400,
      "missedBlocks": 12,
      "slashAmount": "100000000000000000000"
    }
  }
}
```

### MEV Prevention Channel

MEV detection and prevention events.

```javascript
// Subscribe to MEV events
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['mev']
}));

// MEV prevention event
{
  "type": "mev_prevented",
  "data": {
    "id": "mev_001",
    "timestamp": "1705318245123456789",
    "type": "sandwich",
    "transactions": [
      "0xfront...",
      "0xvictim...",
      "0xback..."
    ],
    "preventionMethod": "temporal_ordering",
    "savedValue": "2500000000000000000",
    "validator": "0xValidator...",
    "details": {
      "originalOrder": [2, 0, 1],
      "temporalOrder": [0, 1, 2],
      "timeDifference": 1234567
    }
  }
}
```

### Governance Channel

Governance proposals and voting events.

```javascript
// Subscribe to governance
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['governance']
}));

// Proposal event
{
  "type": "proposal_created",
  "data": {
    "proposalId": "prop_123",
    "proposer": "0xProposer...",
    "title": "Reduce Minimum Stake",
    "type": "parameter_change",
    "startTime": "1705318245000000000",
    "endTime": "1705923045000000000",
    "deposit": "1000000000000000000000",
    "threshold": "500000000000000000000000"
  }
}

// Vote event
{
  "type": "vote_cast",
  "data": {
    "proposalId": "prop_123",
    "voter": "0xVoter...",
    "vote": "yes",
    "weight": "10000000000000000000000",
    "timestamp": "1705318245000000000",
    "currentTally": {
      "yes": "150000000000000000000000",
      "no": "50000000000000000000000",
      "abstain": "10000000000000000000000"
    }
  }
}
```

### Market Data Channel

Price and market updates.

```javascript
// Subscribe to market data
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['market'],
  filters: {
    market: {
      pairs: ['ROKO/USDT', 'ROKO/ETH'],
      interval: '1m'
    }
  }
}));

// Market update
{
  "type": "market_update",
  "data": {
    "pair": "ROKO/USDT",
    "price": "3.456",
    "volume24h": "12345678.90",
    "change24h": 5.67,
    "high24h": "3.567",
    "low24h": "3.123",
    "timestamp": "1705318245000000000",
    "trades": [
      {
        "price": "3.456",
        "amount": "1000",
        "side": "buy",
        "timestamp": "1705318245123456789"
      }
    ]
  }
}
```

## Advanced Features

### Aggregated Streams

```javascript
// Subscribe to aggregated data
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['aggregated'],
  options: {
    interval: 5000,  // 5 seconds
    metrics: [
      'tps',
      'blockTime',
      'validatorCount',
      'totalStake',
      'networkTime'
    ]
  }
}));

// Aggregated data event
{
  "type": "network_stats",
  "data": {
    "timestamp": "1705318245000000000",
    "tps": 5432,
    "blockTime": 987654321,
    "activeValidators": 150,
    "totalStake": "15000000000000000000000000",
    "networkTime": {
      "accuracy": 89,
      "drift": 12,
      "syncQuality": "EXCELLENT"
    },
    "gasPrice": {
      "slow": "20000000000",
      "standard": "25000000000",
      "fast": "30000000000"
    }
  }
}
```

### Custom Filters

```javascript
// Complex filter example
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['transactions'],
  filters: {
    transactions: {
      $or: [
        {
          from: '0xAddress1...',
          minValue: '1000000000000000000'
        },
        {
          to: '0xAddress2...',
          method: 'swap'
        }
      ],
      $and: [
        { gasPrice: { $gte: '20000000000' } },
        { gasPrice: { $lte: '100000000000' } }
      ]
    }
  }
}));
```

### Replay & Historical Data

```javascript
// Request historical events
ws.send(JSON.stringify({
  type: 'replay',
  channels: ['blocks'],
  from: 1234500,
  to: 1234567,
  speed: 2  // 2x speed
}));

// Historical event (with replay flag)
{
  "type": "block",
  "replay": true,
  "data": {
    // ... block data
  }
}
```

## Error Handling

### Error Messages

```javascript
// Error event
{
  "type": "error",
  "error": {
    "code": "SUBSCRIPTION_FAILED",
    "message": "Invalid filter parameters",
    "details": {
      "channel": "transactions",
      "reason": "Invalid address format"
    },
    "timestamp": "1705318245000000000"
  }
}
```

### Reconnection Logic

```javascript
class RokoWebSocket {
  constructor(url, apiKey) {
    this.url = url;
    this.apiKey = apiKey;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscriptions = new Set();
    
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.on('open', () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.resubscribe();
    });
    
    this.ws.on('close', () => {
      console.log('Disconnected');
      this.reconnect();
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    this.ws.on('message', (data) => {
      this.handleMessage(JSON.parse(data));
    });
  }
  
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  authenticate() {
    this.send({
      type: 'auth',
      apiKey: this.apiKey
    });
  }
  
  resubscribe() {
    this.subscriptions.forEach(subscription => {
      this.send(subscription);
    });
  }
  
  subscribe(channels, filters = {}) {
    const subscription = {
      type: 'subscribe',
      channels,
      filters
    };
    
    this.subscriptions.add(subscription);
    this.send(subscription);
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  handleMessage(message) {
    // Handle different message types
    switch(message.type) {
      case 'auth_success':
        console.log('Authenticated');
        break;
      case 'error':
        console.error('Error:', message.error);
        break;
      default:
        // Emit event for application handling
        this.emit(message.type, message.data);
    }
  }
}

// Usage
const rokoWs = new RokoWebSocket(
  'wss://stream.roko.network/v1',
  'rk_live_abc123...'
);

rokoWs.subscribe(['blocks', 'transactions']);

rokoWs.on('block', (block) => {
  console.log('New block:', block.number);
});
```

## Performance Optimization

### Message Batching

```javascript
// Enable message batching
ws.send(JSON.stringify({
  type: 'config',
  settings: {
    batching: true,
    batchSize: 100,
    batchInterval: 1000  // milliseconds
  }
}));

// Batched message
{
  "type": "batch",
  "events": [
    {"type": "transaction", "data": {...}},
    {"type": "transaction", "data": {...}},
    // ... up to batchSize events
  ],
  "count": 100,
  "timestamp": "1705318245000000000"
}
```

### Compression

```javascript
// Enable compression
const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.roko.network/v1', {
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1,
      memLevel: 8,
      strategy: 1
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    threshold: 1024  // Compress messages > 1KB
  }
});
```

## SDK Integration

### JavaScript/TypeScript SDK

```typescript
import { RokoStreamClient } from '@roko/stream-sdk';

const client = new RokoStreamClient({
  apiKey: process.env.ROKO_API_KEY,
  network: 'mainnet',
  autoReconnect: true
});

// Subscribe to events
client.subscribe('blocks', (block) => {
  console.log('New block:', block);
});

client.subscribe('transactions', {
  filters: {
    to: '0xMyAddress...',
    minValue: '1000000000000000000'
  },
  handler: (tx) => {
    console.log('Incoming transaction:', tx);
  }
});

// Aggregated stats
client.subscribeStats({
  interval: 5000,
  metrics: ['tps', 'blockTime'],
  handler: (stats) => {
    updateDashboard(stats);
  }
});
```

### Python SDK

```python
import asyncio
from roko_stream import StreamClient

client = StreamClient(
    api_key="rk_live_abc123...",
    network="mainnet"
)

async def handle_block(block):
    print(f"New block: {block['number']}")

async def handle_transaction(tx):
    print(f"Transaction: {tx['hash']} - {tx['value']} ROKO")

async def main():
    await client.connect()
    
    # Subscribe to blocks
    await client.subscribe('blocks', handle_block)
    
    # Subscribe to transactions with filters
    await client.subscribe(
        'transactions',
        handler=handle_transaction,
        filters={
            'to': '0xMyAddress...',
            'minValue': '1000000000000000000'
        }
    )
    
    # Keep running
    await client.run_forever()

asyncio.run(main())
```

## Rate Limits

| Tier | Connections | Messages/sec | Subscriptions |
|------|-------------|--------------|---------------|
| Free | 1 | 10 | 5 |
| Basic | 5 | 100 | 20 |
| Pro | 20 | 1000 | 100 |
| Enterprise | Unlimited | Unlimited | Unlimited |

## Best Practices

1. **Handle Reconnections**: Implement exponential backoff
2. **Manage Subscriptions**: Unsubscribe from unused channels
3. **Process Asynchronously**: Don't block the message handler
4. **Monitor Connection Health**: Implement heartbeat/ping-pong
5. **Use Filters**: Reduce bandwidth with specific filters
6. **Enable Compression**: For high-volume streams
7. **Batch Processing**: Process messages in batches when possible

## Next Steps

- [API Reference](./api-reference.md) - REST API documentation
- [Time Attestation API](./api-attestation.md) - Attestation endpoints
- [SDK Documentation](./sdks.md) - Language-specific SDKs
- [Contract Examples](./contract-examples.md) - Smart contract integration

---

*WebSocket Support: streaming@roko.network | Status: status.roko.network*