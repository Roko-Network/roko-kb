# API Reference

## Complete ROKO Network API Documentation

Access all ROKO Network features through our comprehensive REST and WebSocket APIs.

## Base URLs

- **Mainnet**: `https://api.roko.network/v1`
- **Testnet**: `https://api.testnet.roko.network/v1`
- **WebSocket**: `wss://ws.roko.network/v1`

## Authentication

```bash
curl -H "X-API-Key: your-api-key" https://api.roko.network/v1/time/current
```

## Core Endpoints

### Time API

#### GET `/time/current`
Get current hardware-attested NanoMoment

```json
{
  "nanoMoment": "1704067200500000000",
  "accuracy": 45,
  "proof": {
    "hardware": "0x...",
    "node": "0x..."
  }
}
```

#### POST `/time/verify`
Verify a time proof

### Transaction API

#### POST `/tx/send`
Send a temporal transaction

```json
{
  "to": "0x...",
  "value": "1500000000000000000",
  "validUntil": "1704067500500000000",
  "data": "0x..."
}
```

#### GET `/tx/{hash}`
Get transaction details

### Block API

#### GET `/block/latest`
Get latest block

#### GET `/block/{number}`
Get block by number

## WebSocket Subscriptions

```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://ws.roko.network/v1');

// Subscribe to events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'blocks'
}));

// Receive updates
ws.on('message', (data) => {
  const block = JSON.parse(data);
  console.log('New block:', block);
});
```

## Rate Limits

- **Free Tier**: 100 requests/minute
- **Pro Tier**: 1000 requests/minute
- **Enterprise**: Unlimited

## SDKs

For easier integration, use our official SDKs:
- [JavaScript](./sdk-javascript.md)
- [Python](./sdk-python.md)
- [Rust](./sdk-rust.md)
- [Go](./sdk-go.md)

---

> **Full Documentation**: Complete API specs at [api.roko.network/docs](https://api.roko.network/docs)