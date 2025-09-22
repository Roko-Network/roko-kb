# JavaScript/TypeScript SDK

## Complete SDK for Web3 Development

The ROKO JavaScript SDK provides full access to temporal blockchain features with TypeScript support.

## Installation

```bash
npm install @roko/sdk
# or
yarn add @roko/sdk
# or
pnpm add @roko/sdk
```

## Quick Start

```typescript
import { RokoClient, NanoMoment } from '@roko/sdk';

const client = new RokoClient({
    network: 'mainnet',
    apiKey: process.env.ROKO_API_KEY
});

// Get current time
const now = await client.time.getNanoMoment();

// Send transaction
const tx = await client.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    value: '1.5',
    validUntil: now.add(5, 'minutes')
});
```

## Core Features

### NanoMoment Handling

```typescript
// Create NanoMoment
const moment = new NanoMoment('1704067200500000000');

// Arithmetic
const future = moment.add(1, 'hour');
const past = moment.subtract(30, 'seconds');

// Formatting
console.log(moment.toISO()); // 2024-01-01T12:00:00.500000000Z
console.log(moment.toUnix()); // 1704067200
```

### Smart Contracts

```typescript
const contract = client.contract(ADDRESS, ABI);

// Call with temporal constraints
const result = await contract.methods.swap(amount).call({
    executeAt: NanoMoment.future(10, 'seconds')
});

// Send temporal transaction
const tx = await contract.methods.stake(amount).send({
    validityWindow: 300000000000 // 5 minutes in nanoseconds
});
```

### WebSocket Events

```typescript
// Subscribe to temporal events
client.events.subscribe('TemporalEvent', (event) => {
    console.log(`Event at ${event.nanoMoment}: ${event.data}`);
});

// Real-time time updates
client.time.stream((time) => {
    console.log(`Current NanoMoment: ${time}`);
});
```

## API Reference

Full API documentation at [docs.roko.network/sdk/javascript](https://docs.roko.network/sdk/javascript)

---

> **TypeScript First**: Full type safety for temporal blockchain development.