# Build Your First DApp

## Creating a Temporal DApp on ROKO

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Basic JavaScript knowledge

### Step 1: Setup Project

```bash
# Create project
mkdir my-temporal-dapp
cd my-temporal-dapp
npm init -y

# Install dependencies
npm install @roko/sdk ethers react
```

### Step 2: Connect to ROKO

```javascript
// app.js
import { ROKOProvider } from '@roko/sdk';

const provider = new ROKOProvider('https://rpc.roko.network');
const signer = provider.getSigner();
```

### Step 3: Create Time Display

```javascript
// TimeDisplay.jsx
function TimeDisplay() {
    const [nanoTime, setNanoTime] = useState(0n);
    
    useEffect(() => {
        const interval = setInterval(async () => {
            const time = await provider.getNanoTime();
            setNanoTime(time);
        }, 100);
        
        return () => clearInterval(interval);
    }, []);
    
    return <div>Current NanoTime: {nanoTime.toString()}</div>;
}
```

### Step 4: Deploy Contract

```solidity
// TimeVault.sol
contract TimeVault {
    mapping(address => uint128) public unlockTimes;
    
    function deposit(uint128 lockDuration) external payable {
        unlockTimes[msg.sender] = Time.nanoNow() + lockDuration;
    }
}
```

### Step 5: Run DApp

```bash
npm run dev
# Open http://localhost:3000
```

---

> **Your first DApp**: Welcome to temporal development!