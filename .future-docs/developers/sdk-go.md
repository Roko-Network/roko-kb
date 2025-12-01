# Go SDK

## Cloud-Native Temporal Blockchain SDK

Build scalable services with ROKO's Go SDK.

## Installation

```bash
go get github.com/roko-network/roko-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "log"
    "os"
    
    "github.com/roko-network/roko-go"
)

func main() {
    // Initialize client
    client := roko.NewClient("mainnet", os.Getenv("ROKO_API_KEY"))
    
    // Get current time
    now, err := client.Time.GetNanoMoment()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Current NanoMoment: %v\n", now)
    
    // Send transaction
    tx := &roko.Transaction{
        To:    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9",
        Value: roko.ParseROKO("1.5"),
        ValidUntil: now.Add(5 * time.Minute),
    }
    
    receipt, err := client.SendTransaction(tx)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Transaction hash: %s\n", receipt.Hash)
}
```

## Features

### Concurrent Operations

```go
// Goroutine-safe operations
var wg sync.WaitGroup
results := make(chan *roko.NanoMoment, 10)

for i := 0; i < 10; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        time, _ := client.Time.GetNanoMoment()
        results <- time
    }()
}

wg.Wait()
close(results)
```

### Context Support

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

tx, err := client.SendTransactionWithContext(ctx, transaction)
```

---

> **Cloud Ready**: Designed for microservices and Kubernetes deployments.