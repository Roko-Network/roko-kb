# SDKs & Tools

## Official ROKO Network SDKs

Build temporal applications with our comprehensive SDKs available in multiple languages.

## Available SDKs

### [JavaScript/TypeScript SDK](./sdk-javascript.md)
Full-featured SDK for web and Node.js applications

### [Python SDK](./sdk-python.md)
Perfect for data science and backend services

### [Rust SDK](./sdk-rust.md)
High-performance SDK for systems programming

### [Go SDK](./sdk-go.md)
Efficient SDK for cloud-native applications

## Installation

### JavaScript/TypeScript
```bash
npm install @roko/sdk
# or
yarn add @roko/sdk
```

### Python
```bash
pip install roko-sdk
```

### Rust
```toml
[dependencies]
roko-sdk = "1.0"
```

### Go
```bash
go get github.com/roko-network/roko-go
```

## Common Features

All SDKs provide:
- NanoMoment timestamp handling
- TimeRPC integration
- Transaction building and signing
- Smart contract interaction
- WebSocket subscriptions
- Hardware time attestation

## Quick Example

```javascript
import { RokoClient } from '@roko/sdk';

const client = new RokoClient({
    network: 'mainnet',
    apiKey: process.env.ROKO_API_KEY
});

// Get current nanosecond time
const now = await client.time.getNanoMoment();
console.log(`Current time: ${now}`);

// Send temporal transaction
const tx = await client.sendTransaction({
    to: '0x...',
    value: '1.5',
    temporalConstraints: {
        validUntil: now.add(5, 'minutes')
    }
});
```

---

> **Choose Your Language**: All SDKs provide the same powerful temporal features.