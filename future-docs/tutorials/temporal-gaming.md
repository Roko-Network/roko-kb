# Temporal Gaming

## Build a Time-Based Game on ROKO

### Game Concept: Nano Racer
A racing game where players compete with nanosecond precision timing.

### Smart Contract

```solidity
// NanoRacer.sol
pragma solidity ^0.8.19;
import "@roko/contracts/Time.sol";

contract NanoRacer {
    struct Race {
        uint128 startTime;
        uint128 endTime;
        mapping(address => uint128) finishTimes;
        address[] participants;
    }
    
    mapping(uint => Race) public races;
    uint public nextRaceId;
    
    function startRace(uint128 duration) external returns (uint) {
        uint raceId = nextRaceId++;
        Race storage race = races[raceId];
        race.startTime = Time.nanoNow();
        race.endTime = race.startTime + duration;
        return raceId;
    }
    
    function joinRace(uint raceId) external {
        Race storage race = races[raceId];
        require(Time.nanoNow() < race.startTime, "Race started");
        race.participants.push(msg.sender);
    }
    
    function finishRace(uint raceId) external {
        Race storage race = races[raceId];
        uint128 currentTime = Time.nanoNow();
        require(currentTime >= race.startTime, "Not started");
        require(currentTime <= race.endTime, "Race ended");
        
        race.finishTimes[msg.sender] = currentTime;
    }
}
```

### Frontend Game

```javascript
// game.js
class NanoRacerGame {
    constructor(contract) {
        this.contract = contract;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    async startRace() {
        const duration = 30_000_000_000n; // 30 seconds
        const raceId = await this.contract.startRace(duration);
        this.currentRace = raceId;
        this.animate();
    }
    
    animate() {
        const render = async () => {
            const nanoTime = await provider.getNanoTime();
            const raceData = await this.contract.races(this.currentRace);
            
            // Draw race progress
            this.drawTrack();
            this.drawRacers(raceData, nanoTime);
            
            requestAnimationFrame(render);
        };
        render();
    }
}
```

---

> **Game on**: Build games with perfect timing fairness.