# Smart Contracts

## Temporal Smart Contract Development

Build smart contracts that leverage nanosecond precision and temporal guarantees.

## Getting Started

```solidity
pragma solidity ^0.8.0;

import "@roko/contracts/Temporal.sol";

contract MyTemporalContract is Temporal {
    mapping(uint128 => uint256) public valueAtTime;
    
    function setValue(uint256 _value) external {
        uint128 currentTime = Time.nanoNow();
        valueAtTime[currentTime] = _value;
        
        emit ValueSet(currentTime, _value, msg.sender);
    }
}
```

## Core Concepts

### [Temporal Contracts](./temporal-contracts.md)
Contracts with built-in time awareness

### [Selfient Patterns](./selfient-patterns.md)  
Self-executing temporal logic patterns

## Time Library

```solidity
library Time {
    // Get current NanoMoment
    function nanoNow() internal view returns (uint128);
    
    // Check if timestamp is valid
    function isValid(uint128 timestamp) internal view returns (bool);
    
    // Get hardware proof
    function getProof() internal view returns (bytes memory);
}
```

## Development Tools

### Hardhat Plugin

```javascript
// hardhat.config.js
require("@roko/hardhat-plugin");

module.exports = {
  networks: {
    roko: {
      url: "https://rpc.roko.network",
      temporal: true
    }
  }
};
```

### Testing

```javascript
const { expect } = require("chai");
const { NanoMoment } = require("@roko/test-helpers");

describe("TemporalContract", () => {
  it("should record exact timestamp", async () => {
    const tx = await contract.setValue(42);
    const receipt = await tx.wait();
    
    // Check temporal ordering
    expect(receipt.nanoMoment).to.be.a('bigint');
  });
});
```

---

> **Build Temporal**: Create applications impossible on traditional blockchains.