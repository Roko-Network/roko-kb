# Best Practices

## Security Best Practices

### Validator Security

#### Key Management
- Use hardware security modules (HSM)
- Never share validator keys
- Backup keys securely offline
- Rotate keys periodically

#### Node Security
```bash
# Firewall configuration
ufw allow 26656/tcp  # P2P
ufw allow 26657/tcp  # RPC (local only)
ufw allow 26660/tcp  # Metrics (local only)
ufw enable
```

#### Monitoring
- Set up alerts for missed blocks
- Monitor time drift continuously
- Track peer connections
- Watch for DDoS attempts

### Smart Contract Security

#### Time-Based Vulnerabilities
```solidity
// ❌ BAD: Using block.timestamp
require(block.timestamp > deadline);

// ✅ GOOD: Using ROKO Time library
require(Time.nanoNow() > deadline);
```

#### Reentrancy Protection
```solidity
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

### User Security
- Use hardware wallets
- Verify contract addresses
- Check transaction details
- Never share seed phrases

---

> **Stay safe**: Security is everyone's responsibility.