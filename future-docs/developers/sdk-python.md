# Python SDK

## Python SDK for ROKO Network

Build temporal blockchain applications with Python's simplicity and power.

## Installation

```bash
pip install roko-sdk
# or
poetry add roko-sdk
# or
conda install -c roko roko-sdk
```

## Quick Start

```python
from roko import Client, NanoMoment
import os

# Initialize client
client = Client(
    network='mainnet',
    api_key=os.environ['ROKO_API_KEY']
)

# Get current time
now = client.time.get_nano_moment()
print(f"Current NanoMoment: {now}")

# Send transaction
tx = client.send_transaction(
    to='0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    value=1.5,
    valid_until=now + (5 * 60 * 10**9)  # 5 minutes
)
```

## Features

### Temporal Operations

```python
# NanoMoment arithmetic
future = NanoMoment.now().add_seconds(30)
past = NanoMoment.now().subtract_minutes(5)

# Time proofs
proof = client.time.get_proof(NanoMoment.now())
is_valid = client.time.verify_proof(proof)
```

### Smart Contracts

```python
# Deploy contract
contract = client.deploy_contract(
    bytecode=compiled_code,
    abi=contract_abi,
    constructor_args=[arg1, arg2]
)

# Interact with contract
result = contract.functions.get_value().call()
tx_hash = contract.functions.set_value(42).transact()
```

### Async Support

```python
import asyncio
from roko.async_client import AsyncClient

async def main():
    async with AsyncClient() as client:
        time = await client.time.get_nano_moment()
        tx = await client.send_transaction(...)
        
asyncio.run(main())
```

---

> **Pythonic**: Intuitive API design following Python best practices.