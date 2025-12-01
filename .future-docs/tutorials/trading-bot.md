# Trading Bot Tutorial

## Build a MEV-Resistant Trading Bot

### Overview
Create a trading bot that leverages ROKO's temporal ordering to execute fair trades without MEV.

### Setup

```bash
# Install dependencies
npm install @roko/sdk ethers dotenv
npm install --save-dev typescript @types/node
```

### Bot Implementation

```typescript
// tradingBot.ts
import { ROKOProvider, TemporalDEX } from '@roko/sdk';
import { ethers } from 'ethers';

class TemporalTradingBot {
    private provider: ROKOProvider;
    private dex: TemporalDEX;
    
    constructor(privateKey: string) {
        this.provider = new ROKOProvider('https://rpc.roko.network');
        const wallet = new ethers.Wallet(privateKey, this.provider);
        this.dex = new TemporalDEX(wallet);
    }
    
    async executeTrade(tokenIn: string, tokenOut: string, amount: bigint) {
        // Get current price with nanosecond precision
        const price = await this.dex.getPrice(tokenIn, tokenOut);
        const nanoTime = await this.provider.getNanoTime();
        
        // Calculate slippage protection
        const minOut = price.amountOut * 99n / 100n; // 1% slippage
        
        // Execute swap with temporal ordering
        const tx = await this.dex.swap({
            tokenIn,
            tokenOut,
            amountIn: amount,
            minAmountOut: minOut,
            deadline: nanoTime + 60_000_000_000n // 60 seconds
        });
        
        console.log(`Trade executed at ${tx.nanoTimestamp}`);
        return tx;
    }
    
    async startArbitrage() {
        // Monitor price differences
        while (true) {
            const opportunity = await this.findArbitrage();
            if (opportunity) {
                await this.executeArbitrage(opportunity);
            }
            await this.sleep(100); // Check every 100ms
        }
    }
}
```

### Strategy Configuration

```javascript
// config.js
module.exports = {
    pairs: ['ROKO/USDC', 'ETH/ROKO', 'BTC/ROKO'],
    minProfit: 10n * 10n**18n, // 10 ROKO minimum
    maxGas: 1000000n,
    slippage: 0.01 // 1%
};
```

---

> **Fair trading**: No MEV, just skill and timing.