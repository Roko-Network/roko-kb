# Contract Examples

Complete smart contract examples leveraging ROKO's temporal features for MEV-resistant DeFi, gaming, and time-based applications.

## Core Temporal Contracts

### TimeAttestationConsumer

Base contract for consuming time attestations.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@roko/contracts/interfaces/ITimeAttestation.sol";
import "@roko/contracts/interfaces/ITimeOracle.sol";

contract TimeAttestationConsumer {
    ITimeAttestation public immutable timeAttestation;
    ITimeOracle public immutable timeOracle;
    
    uint256 public constant MAX_TIME_DRIFT = 1000000; // 1ms in nanoseconds
    uint256 public lastExecutionTime;
    
    mapping(bytes32 => bool) public usedAttestations;
    
    modifier withTimeProof(bytes calldata attestationData) {
        (uint256 timestamp, bytes32 hash, bytes memory proof) = 
            abi.decode(attestationData, (uint256, bytes32, bytes));
        
        // Verify attestation hasn't been used
        require(!usedAttestations[hash], "Attestation already used");
        
        // Verify temporal ordering
        require(timestamp > lastExecutionTime, "Out of temporal order");
        
        // Verify attestation validity
        require(
            timeAttestation.verifyAttestation(timestamp, hash, proof),
            "Invalid time attestation"
        );
        
        // Mark as used and update time
        usedAttestations[hash] = true;
        lastExecutionTime = timestamp;
        
        _;
    }
    
    modifier withinTimeWindow(uint256 startTime, uint256 endTime) {
        uint256 currentTime = timeOracle.getCurrentNanoTime();
        require(currentTime >= startTime, "Too early");
        require(currentTime <= endTime, "Too late");
        _;
    }
    
    function getCurrentNanoTime() public view returns (uint256) {
        return timeOracle.getCurrentNanoTime();
    }
    
    function getBlockNanoTime() public view returns (uint256) {
        return block.timestamp * 1e9; // Convert to nanoseconds
    }
}
```

## DeFi Examples

### Temporal DEX

MEV-resistant decentralized exchange using temporal ordering.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TimeAttestationConsumer.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TemporalDEX is TimeAttestationConsumer {
    struct Order {
        address trader;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOutMin;
        uint256 nanoTimestamp;
        bytes attestation;
        bool executed;
    }
    
    struct Pool {
        uint256 reserve0;
        uint256 reserve1;
        uint256 lastUpdateTime;
    }
    
    mapping(bytes32 => Order) public orders;
    mapping(bytes32 => Pool) public pools;
    
    uint256 public constant BATCH_WINDOW = 1000000000; // 1 second in nanoseconds
    uint256 public lastBatchTime;
    Order[] public pendingOrders;
    
    event OrderSubmitted(bytes32 indexed orderId, address indexed trader, uint256 nanoTime);
    event BatchExecuted(uint256 nanoTime, uint256 ordersProcessed);
    event SwapExecuted(address indexed trader, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);
    
    function submitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        (uint256 nanoTime, bytes32 attestationHash,) = 
            abi.decode(attestation, (uint256, bytes32, bytes));
        
        bytes32 orderId = keccak256(
            abi.encodePacked(msg.sender, tokenIn, tokenOut, amountIn, nanoTime)
        );
        
        orders[orderId] = Order({
            trader: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOutMin: amountOutMin,
            nanoTimestamp: nanoTime,
            attestation: attestation,
            executed: false
        });
        
        pendingOrders.push(orders[orderId]);
        
        emit OrderSubmitted(orderId, msg.sender, nanoTime);
        
        // Auto-execute batch if window passed
        if (nanoTime > lastBatchTime + BATCH_WINDOW) {
            executeBatch();
        }
    }
    
    function executeBatch() public {
        require(pendingOrders.length > 0, "No pending orders");
        
        uint256 currentTime = getCurrentNanoTime();
        require(currentTime > lastBatchTime + BATCH_WINDOW, "Batch window not complete");
        
        // Sort orders by temporal timestamp
        _quickSort(pendingOrders, 0, int256(pendingOrders.length - 1));
        
        // Execute orders in temporal order
        uint256 executed = 0;
        for (uint256 i = 0; i < pendingOrders.length; i++) {
            Order memory order = pendingOrders[i];
            if (!order.executed && _executeSwap(order)) {
                executed++;
            }
        }
        
        // Clear pending orders
        delete pendingOrders;
        lastBatchTime = currentTime;
        
        emit BatchExecuted(currentTime, executed);
    }
    
    function _executeSwap(Order memory order) private returns (bool) {
        bytes32 poolId = _getPoolId(order.tokenIn, order.tokenOut);
        Pool storage pool = pools[poolId];
        
        // Calculate output amount using constant product formula
        uint256 amountOut = _getAmountOut(
            order.amountIn,
            pool.reserve0,
            pool.reserve1
        );
        
        if (amountOut < order.amountOutMin) {
            return false; // Slippage protection
        }
        
        // Transfer tokens
        IERC20(order.tokenIn).transferFrom(order.trader, address(this), order.amountIn);
        IERC20(order.tokenOut).transfer(order.trader, amountOut);
        
        // Update reserves
        pool.reserve0 += order.amountIn;
        pool.reserve1 -= amountOut;
        pool.lastUpdateTime = order.nanoTimestamp;
        
        emit SwapExecuted(order.trader, order.tokenIn, order.amountIn, order.tokenOut, amountOut);
        
        return true;
    }
    
    function _quickSort(Order[] storage arr, int256 left, int256 right) private {
        if (left < right) {
            int256 pivotIndex = _partition(arr, left, right);
            _quickSort(arr, left, pivotIndex - 1);
            _quickSort(arr, pivotIndex + 1, right);
        }
    }
    
    function _partition(Order[] storage arr, int256 left, int256 right) private returns (int256) {
        uint256 pivot = arr[uint256(right)].nanoTimestamp;
        int256 i = left - 1;
        
        for (int256 j = left; j < right; j++) {
            if (arr[uint256(j)].nanoTimestamp <= pivot) {
                i++;
                Order memory temp = arr[uint256(i)];
                arr[uint256(i)] = arr[uint256(j)];
                arr[uint256(j)] = temp;
            }
        }
        
        Order memory temp = arr[uint256(i + 1)];
        arr[uint256(i + 1)] = arr[uint256(right)];
        arr[uint256(right)] = temp;
        
        return i + 1;
    }
    
    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) private pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }
    
    function _getPoolId(address token0, address token1) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            token0 < token1 ? token0 : token1,
            token0 < token1 ? token1 : token0
        ));
    }
}
```

### Temporal Lending Protocol

Time-based lending with nanosecond precision interest calculation.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TemporalLending is TimeAttestationConsumer {
    struct LendingPool {
        address asset;
        uint256 totalDeposits;
        uint256 totalBorrows;
        uint256 utilizationRate;
        uint256 supplyAPY;
        uint256 borrowAPY;
        uint256 lastUpdateNanoTime;
    }
    
    struct Position {
        uint256 depositAmount;
        uint256 borrowAmount;
        uint256 depositNanoTime;
        uint256 borrowNanoTime;
        uint256 accumulatedInterest;
        address collateralAsset;
        uint256 collateralAmount;
    }
    
    mapping(address => LendingPool) public pools;
    mapping(address => mapping(address => Position)) public positions;
    
    uint256 public constant NANOSECONDS_PER_YEAR = 31536000000000000;
    uint256 public constant PRECISION = 1e18;
    
    function deposit(
        address asset,
        uint256 amount,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        (uint256 nanoTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        LendingPool storage pool = pools[asset];
        Position storage position = positions[msg.sender][asset];
        
        // Calculate and distribute interest
        _accrueInterest(pool, nanoTime);
        
        // Update position
        position.depositAmount += amount;
        position.depositNanoTime = nanoTime;
        
        // Update pool
        pool.totalDeposits += amount;
        _updateRates(pool);
        
        // Transfer tokens
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
    }
    
    function borrow(
        address asset,
        uint256 amount,
        address collateralAsset,
        uint256 collateralAmount,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        (uint256 nanoTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        LendingPool storage pool = pools[asset];
        Position storage position = positions[msg.sender][asset];
        
        // Check collateral ratio
        require(
            _getCollateralValue(collateralAsset, collateralAmount) >= 
            _getBorrowValue(asset, amount) * 150 / 100,
            "Insufficient collateral"
        );
        
        // Calculate and distribute interest
        _accrueInterest(pool, nanoTime);
        
        // Update position
        position.borrowAmount += amount;
        position.borrowNanoTime = nanoTime;
        position.collateralAsset = collateralAsset;
        position.collateralAmount = collateralAmount;
        
        // Update pool
        pool.totalBorrows += amount;
        _updateRates(pool);
        
        // Transfer tokens
        IERC20(collateralAsset).transferFrom(msg.sender, address(this), collateralAmount);
        IERC20(asset).transfer(msg.sender, amount);
    }
    
    function _accrueInterest(LendingPool storage pool, uint256 currentNanoTime) private {
        if (currentNanoTime <= pool.lastUpdateNanoTime) return;
        
        uint256 nanoElapsed = currentNanoTime - pool.lastUpdateNanoTime;
        uint256 yearFraction = nanoElapsed * PRECISION / NANOSECONDS_PER_YEAR;
        
        // Calculate interest with nanosecond precision
        uint256 borrowInterest = pool.totalBorrows * pool.borrowAPY * yearFraction / PRECISION / 100;
        uint256 supplyInterest = pool.totalDeposits * pool.supplyAPY * yearFraction / PRECISION / 100;
        
        // Distribute interest
        pool.totalBorrows += borrowInterest;
        pool.totalDeposits += supplyInterest;
        pool.lastUpdateNanoTime = currentNanoTime;
    }
    
    function _updateRates(LendingPool storage pool) private {
        if (pool.totalDeposits == 0) {
            pool.utilizationRate = 0;
            pool.supplyAPY = 0;
            pool.borrowAPY = 500; // 5% base rate
            return;
        }
        
        // Calculate utilization rate
        pool.utilizationRate = pool.totalBorrows * PRECISION / pool.totalDeposits;
        
        // Interest rate model (simplified)
        if (pool.utilizationRate < 80 * PRECISION / 100) {
            pool.borrowAPY = 500 + (pool.utilizationRate * 1500 / PRECISION);
        } else {
            pool.borrowAPY = 2000 + ((pool.utilizationRate - 80 * PRECISION / 100) * 10000 / PRECISION);
        }
        
        pool.supplyAPY = pool.borrowAPY * pool.utilizationRate / PRECISION * 85 / 100; // 85% of borrow APY
    }
    
    function _getCollateralValue(address asset, uint256 amount) private view returns (uint256) {
        // Implement price oracle integration
        return amount; // Simplified
    }
    
    function _getBorrowValue(address asset, uint256 amount) private view returns (uint256) {
        // Implement price oracle integration
        return amount; // Simplified
    }
}
```

## Gaming Examples

### Temporal Gaming Contract

Fair gaming with provable temporal randomness.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TemporalGaming is TimeAttestationConsumer {
    struct Game {
        bytes32 id;
        address[] players;
        uint256 betAmount;
        uint256 startNanoTime;
        uint256 endNanoTime;
        address winner;
        bool settled;
    }
    
    struct PlayerAction {
        address player;
        uint256 actionType;
        uint256 nanoTimestamp;
        bytes data;
        bytes attestation;
    }
    
    mapping(bytes32 => Game) public games;
    mapping(bytes32 => PlayerAction[]) public gameActions;
    mapping(address => uint256) public playerScores;
    
    uint256 public constant ACTION_WINDOW = 100000000; // 100ms in nanoseconds
    
    event GameCreated(bytes32 indexed gameId, uint256 startTime);
    event ActionRecorded(bytes32 indexed gameId, address indexed player, uint256 nanoTime);
    event GameSettled(bytes32 indexed gameId, address winner, uint256 prize);
    
    function createGame(
        uint256 betAmount,
        uint256 durationNanos,
        bytes calldata attestation
    ) external payable withTimeProof(attestation) returns (bytes32) {
        require(msg.value >= betAmount, "Insufficient bet");
        
        (uint256 startTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        bytes32 gameId = keccak256(
            abi.encodePacked(msg.sender, startTime, betAmount)
        );
        
        games[gameId] = Game({
            id: gameId,
            players: new address[](0),
            betAmount: betAmount,
            startNanoTime: startTime,
            endNanoTime: startTime + durationNanos,
            winner: address(0),
            settled: false
        });
        
        games[gameId].players.push(msg.sender);
        
        emit GameCreated(gameId, startTime);
        return gameId;
    }
    
    function recordAction(
        bytes32 gameId,
        uint256 actionType,
        bytes calldata actionData,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        Game storage game = games[gameId];
        require(!game.settled, "Game already settled");
        
        (uint256 actionTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        // Verify action is within game window
        require(actionTime >= game.startNanoTime, "Action before game start");
        require(actionTime <= game.endNanoTime, "Action after game end");
        
        // Verify temporal ordering of actions
        if (gameActions[gameId].length > 0) {
            PlayerAction memory lastAction = gameActions[gameId][gameActions[gameId].length - 1];
            require(actionTime > lastAction.nanoTimestamp, "Action out of order");
        }
        
        // Record action
        gameActions[gameId].push(PlayerAction({
            player: msg.sender,
            actionType: actionType,
            nanoTimestamp: actionTime,
            data: actionData,
            attestation: attestation
        }));
        
        // Calculate score based on timing precision
        uint256 timingScore = _calculateTimingScore(gameId, actionTime, actionType);
        playerScores[msg.sender] += timingScore;
        
        emit ActionRecorded(gameId, msg.sender, actionTime);
    }
    
    function settleGame(
        bytes32 gameId,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        Game storage game = games[gameId];
        require(!game.settled, "Game already settled");
        
        (uint256 currentTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        require(currentTime > game.endNanoTime, "Game not ended");
        
        // Determine winner based on actions and timing
        address winner = _determineWinner(gameId);
        game.winner = winner;
        game.settled = true;
        
        // Transfer prize
        uint256 prize = game.betAmount * game.players.length;
        payable(winner).transfer(prize);
        
        emit GameSettled(gameId, winner, prize);
    }
    
    function _calculateTimingScore(
        bytes32 gameId,
        uint256 actionTime,
        uint256 actionType
    ) private view returns (uint256) {
        PlayerAction[] memory actions = gameActions[gameId];
        
        // Reward actions with precise timing
        uint256 targetTime = games[gameId].startNanoTime + (actionType * ACTION_WINDOW);
        uint256 deviation = actionTime > targetTime ? 
            actionTime - targetTime : targetTime - actionTime;
        
        // Score inversely proportional to timing deviation
        if (deviation < 1000000) { // < 1ms
            return 1000;
        } else if (deviation < 10000000) { // < 10ms
            return 500;
        } else if (deviation < 100000000) { // < 100ms
            return 100;
        } else {
            return 10;
        }
    }
    
    function _determineWinner(bytes32 gameId) private view returns (address) {
        Game memory game = games[gameId];
        address winner = game.players[0];
        uint256 highestScore = playerScores[winner];
        
        for (uint256 i = 1; i < game.players.length; i++) {
            if (playerScores[game.players[i]] > highestScore) {
                highestScore = playerScores[game.players[i]];
                winner = game.players[i];
            }
        }
        
        return winner;
    }
    
    function getTemporalRandomness(uint256 nanoTime, uint256 nonce) 
        public 
        pure 
        returns (uint256) 
    {
        // Generate deterministic randomness from nanosecond timestamp
        return uint256(keccak256(abi.encodePacked(
            nanoTime,
            nanoTime % 1000000, // microsecond component
            nanoTime % 1000,    // nanosecond component
            nonce
        )));
    }
}
```

## Auction Examples

### Temporal Auction

Fair sealed-bid auction with temporal ordering.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TemporalAuction is TimeAttestationConsumer {
    struct Auction {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 startNanoTime;
        uint256 endNanoTime;
        uint256 revealEndNanoTime;
        uint256 minimumBid;
        address highestBidder;
        uint256 highestBid;
        bool settled;
    }
    
    struct SealedBid {
        bytes32 commitment;
        uint256 submitNanoTime;
        uint256 bidAmount;
        uint256 nonce;
        bool revealed;
    }
    
    mapping(bytes32 => Auction) public auctions;
    mapping(bytes32 => mapping(address => SealedBid)) public bids;
    
    event AuctionCreated(bytes32 indexed auctionId, uint256 endTime);
    event BidSubmitted(bytes32 indexed auctionId, address indexed bidder, uint256 nanoTime);
    event BidRevealed(bytes32 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionSettled(bytes32 indexed auctionId, address winner, uint256 amount);
    
    function createAuction(
        address tokenContract,
        uint256 tokenId,
        uint256 durationNanos,
        uint256 revealDurationNanos,
        uint256 minimumBid,
        bytes calldata attestation
    ) external withTimeProof(attestation) returns (bytes32) {
        (uint256 startTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        bytes32 auctionId = keccak256(abi.encodePacked(
            msg.sender,
            tokenContract,
            tokenId,
            startTime
        ));
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            tokenContract: tokenContract,
            tokenId: tokenId,
            startNanoTime: startTime,
            endNanoTime: startTime + durationNanos,
            revealEndNanoTime: startTime + durationNanos + revealDurationNanos,
            minimumBid: minimumBid,
            highestBidder: address(0),
            highestBid: 0,
            settled: false
        });
        
        // Transfer NFT to contract
        IERC721(tokenContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit AuctionCreated(auctionId, auctions[auctionId].endNanoTime);
        return auctionId;
    }
    
    function submitSealedBid(
        bytes32 auctionId,
        bytes32 commitment,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        (uint256 bidTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        Auction memory auction = auctions[auctionId];
        require(bidTime >= auction.startNanoTime, "Auction not started");
        require(bidTime <= auction.endNanoTime, "Bidding ended");
        
        bids[auctionId][msg.sender] = SealedBid({
            commitment: commitment,
            submitNanoTime: bidTime,
            bidAmount: 0,
            nonce: 0,
            revealed: false
        });
        
        emit BidSubmitted(auctionId, msg.sender, bidTime);
    }
    
    function revealBid(
        bytes32 auctionId,
        uint256 bidAmount,
        uint256 nonce,
        bytes calldata attestation
    ) external payable withTimeProof(attestation) {
        (uint256 revealTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        Auction storage auction = auctions[auctionId];
        require(revealTime > auction.endNanoTime, "Bidding still active");
        require(revealTime <= auction.revealEndNanoTime, "Reveal period ended");
        
        SealedBid storage bid = bids[auctionId][msg.sender];
        require(!bid.revealed, "Already revealed");
        
        // Verify commitment
        bytes32 commitment = keccak256(abi.encodePacked(
            msg.sender,
            bidAmount,
            nonce
        ));
        require(commitment == bid.commitment, "Invalid reveal");
        
        // Verify payment
        require(msg.value >= bidAmount, "Insufficient payment");
        
        bid.bidAmount = bidAmount;
        bid.nonce = nonce;
        bid.revealed = true;
        
        // Update highest bid if applicable
        if (bidAmount > auction.highestBid && bidAmount >= auction.minimumBid) {
            // Refund previous highest bidder
            if (auction.highestBidder != address(0)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            }
            
            auction.highestBid = bidAmount;
            auction.highestBidder = msg.sender;
        } else {
            // Refund if not highest
            payable(msg.sender).transfer(msg.value);
        }
        
        emit BidRevealed(auctionId, msg.sender, bidAmount);
    }
    
    function settleAuction(
        bytes32 auctionId,
        bytes calldata attestation
    ) external withTimeProof(attestation) {
        (uint256 settleTime,,) = abi.decode(attestation, (uint256, bytes32, bytes));
        
        Auction storage auction = auctions[auctionId];
        require(!auction.settled, "Already settled");
        require(settleTime > auction.revealEndNanoTime, "Reveal period not ended");
        
        auction.settled = true;
        
        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner
            IERC721(auction.tokenContract).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );
            
            // Transfer payment to seller
            payable(auction.seller).transfer(auction.highestBid);
            
            emit AuctionSettled(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // No valid bids, return NFT to seller
            IERC721(auction.tokenContract).transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
            
            emit AuctionSettled(auctionId, address(0), 0);
        }
    }
}
```

## Integration Patterns

### Using ROKO SDK with Contracts

```javascript
// JavaScript integration
const { ethers } = require('ethers');
const { RokoTimeClient } = require('@roko/sdk');

class TemporalContractClient {
    constructor(provider, signer, contractAddress) {
        this.provider = provider;
        this.signer = signer;
        this.contract = new ethers.Contract(contractAddress, ABI, signer);
        this.rokoClient = new RokoTimeClient();
    }
    
    async submitWithTimeProof(method, params) {
        // Get time attestation
        const attestation = await this.rokoClient.createAttestation({
            data: {
                method: method,
                params: params,
                sender: await this.signer.getAddress()
            }
        });
        
        // Encode attestation
        const attestationBytes = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'bytes32', 'bytes'],
            [
                attestation.timestamp,
                attestation.hash,
                attestation.proof
            ]
        );
        
        // Call contract method with attestation
        return await this.contract[method](...params, attestationBytes);
    }
    
    async executeTemporalBatch(transactions) {
        // Sort transactions by timestamp
        transactions.sort((a, b) => a.timestamp - b.timestamp);
        
        // Execute in order
        const results = [];
        for (const tx of transactions) {
            const result = await this.submitWithTimeProof(
                tx.method,
                tx.params
            );
            results.push(result);
        }
        
        return results;
    }
}

// Usage example
const client = new TemporalContractClient(
    provider,
    signer,
    '0xContractAddress'
);

// Submit order with time proof
const tx = await client.submitWithTimeProof('submitOrder', [
    tokenIn,
    tokenOut,
    amountIn,
    amountOutMin
]);

console.log('Transaction:', tx.hash);
```

## Testing Patterns

```javascript
// Hardhat test example
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TemporalDEX', function() {
    let dex, timeOracle, owner, trader1, trader2;
    
    beforeEach(async function() {
        [owner, trader1, trader2] = await ethers.getSigners();
        
        // Deploy mock time oracle
        const TimeOracle = await ethers.getContractFactory('MockTimeOracle');
        timeOracle = await TimeOracle.deploy();
        
        // Deploy DEX
        const TemporalDEX = await ethers.getContractFactory('TemporalDEX');
        dex = await TemporalDEX.deploy(timeOracle.address);
    });
    
    it('Should maintain temporal ordering', async function() {
        const time1 = BigNumber.from('1705318245000000000');
        const time2 = BigNumber.from('1705318246000000000');
        
        // Create attestations
        const attestation1 = await createMockAttestation(time1);
        const attestation2 = await createMockAttestation(time2);
        
        // Submit orders
        await dex.connect(trader1).submitOrder(
            token1,
            token2,
            amount1,
            minAmount1,
            attestation1
        );
        
        await dex.connect(trader2).submitOrder(
            token1,
            token2,
            amount2,
            minAmount2,
            attestation2
        );
        
        // Execute batch
        await dex.executeBatch();
        
        // Verify temporal ordering
        const order1 = await dex.orders(0);
        const order2 = await dex.orders(1);
        
        expect(order1.nanoTimestamp).to.be.lt(order2.nanoTimestamp);
    });
});
```

## Gas Optimization

```solidity
// Optimized batch processing
contract OptimizedTemporalBatch {
    using SafeMath for uint256;
    
    // Pack struct for gas efficiency
    struct PackedOrder {
        uint128 amountIn;
        uint128 amountOutMin;
        uint64 nanoTime;
        address trader;
        address tokenIn;
        address tokenOut;
    }
    
    // Use bitmap for tracking
    mapping(uint256 => uint256) private executedBitmap;
    
    function isExecuted(uint256 orderId) public view returns (bool) {
        uint256 wordIndex = orderId / 256;
        uint256 bitIndex = orderId % 256;
        uint256 word = executedBitmap[wordIndex];
        return (word & (1 << bitIndex)) != 0;
    }
    
    function markExecuted(uint256 orderId) private {
        uint256 wordIndex = orderId / 256;
        uint256 bitIndex = orderId % 256;
        executedBitmap[wordIndex] |= (1 << bitIndex);
    }
}
```

## Security Considerations

1. **Time Manipulation**: Always verify attestations on-chain
2. **Replay Attacks**: Track used attestations
3. **Front-running**: Use commit-reveal patterns
4. **Precision Loss**: Handle nanosecond arithmetic carefully
5. **Gas Limits**: Batch processing with size limits

## Next Steps

- [Time-Locked Operations](./time-locked.md) - Advanced time-based patterns
- [Smart Contracts Guide](./smart-contracts.md) - General contract development
- [Testing Framework](./testing-framework.md) - Testing temporal contracts
- [API Reference](./api-reference.md) - Contract API documentation

---

*Contract Support: contracts@roko.network*