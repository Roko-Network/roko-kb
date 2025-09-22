# Rust SDK

## High-Performance Temporal Blockchain SDK

Build blazing-fast applications with ROKO's Rust SDK.

## Installation

```toml
# Cargo.toml
[dependencies]
roko-sdk = "1.0"
tokio = { version = "1", features = ["full"] }
```

## Quick Start

```rust
use roko_sdk::{Client, NanoMoment, Transaction};
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client
    let client = Client::new(
        "mainnet",
        env::var("ROKO_API_KEY")?
    );
    
    // Get current time
    let now = client.time().get_nano_moment().await?;
    println!("Current NanoMoment: {}", now);
    
    // Send transaction
    let tx = Transaction::builder()
        .to("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9")
        .value(1_500_000_000_000_000_000u128) // 1.5 ROKO in wei
        .valid_until(now + Duration::minutes(5))
        .build()?;
    
    let receipt = client.send_transaction(tx).await?;
    println!("Transaction hash: {}", receipt.hash);
    
    Ok(())
}
```

## Features

### Zero-Copy Performance

```rust
use roko_sdk::NanoMoment;

// Zero-allocation operations
let moment = NanoMoment::now();
let future = moment.add_nanos(1_000_000_000);

// Efficient serialization
let bytes = moment.to_bytes();
let decoded = NanoMoment::from_bytes(&bytes)?;
```

### Async/Await Support

```rust
// Concurrent operations
let (time, balance, nonce) = tokio::join!(
    client.time().get_nano_moment(),
    client.get_balance(address),
    client.get_nonce(address)
);
```

---

> **Performance**: Zero-copy operations and async I/O for maximum efficiency.