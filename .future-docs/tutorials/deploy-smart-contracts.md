# Deploy Smart Contracts

## Deploying to ROKO Network

### Environment Setup

#### 1. Install Hardhat
```bash
npm install --save-dev hardhat @roko/hardhat-plugin
npx hardhat init
```

#### 2. Configure Networks
```javascript
// hardhat.config.js
module.exports = {
    networks: {
        roko_testnet: {
            url: "https://testnet.roko.network",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 7777
        },
        roko_mainnet: {
            url: "https://rpc.roko.network",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 7776
        }
    }
};
```

### Write Contract

```solidity
// contracts/TemporalAuction.sol
pragma solidity ^0.8.19;
import "@roko/contracts/Time.sol";

contract TemporalAuction {
    uint128 public auctionEnd;
    address public highestBidder;
    uint public highestBid;
    
    constructor(uint128 _duration) {
        auctionEnd = Time.nanoNow() + _duration;
    }
    
    function bid() external payable {
        require(Time.nanoNow() < auctionEnd, "Auction ended");
        require(msg.value > highestBid, "Bid too low");
        
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}
```

### Deploy Script

```javascript
// scripts/deploy.js
async function main() {
    const Auction = await ethers.getContractFactory("TemporalAuction");
    const duration = 3600_000_000_000n; // 1 hour in nanoseconds
    const auction = await Auction.deploy(duration);
    
    console.log("Auction deployed to:", auction.address);
    console.log("Ends at:", await auction.auctionEnd());
}

main().catch(console.error);
```

### Deploy Command
```bash
npx hardhat run scripts/deploy.js --network roko_testnet
```

---

> **Contract deployed**: Your temporal logic is live!