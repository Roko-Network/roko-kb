# Auction Systems

## Temporal Auctions on ROKO

### Perfect Auction Timing

#### Sealed-Bid Implementation
```solidity
contract SealedAuction {
    uint128 public auctionEnd;
    
    function placeBid(bytes32 sealedBid) external {
        require(Time.nanoNow() < auctionEnd, "Auction ended");
        bids[msg.sender] = Bid({
            sealed: sealedBid,
            timestamp: Time.nanoNow()
        });
    }
    
    function revealBid(uint amount, uint nonce) external {
        require(Time.nanoNow() > auctionEnd, "Still accepting bids");
        // Verify and process bid
    }
}
```

### Auction Types

#### English Auction
- Real-time bidding
- Nanosecond precision
- No sniping possible

#### Dutch Auction
- Price decreases over time
- Exact purchase moments
- Fair participation

#### Candle Auction
- Random end time
- Temporal randomness
- Provably fair

### Benefits
- **No bid sniping**: Exact cutoff times
- **Fair ordering**: First bid wins ties
- **Transparent**: All bids timestamped
- **Automated**: Self-executing settlements

---

> **Bid with confidence**: Auctions with perfect timing.