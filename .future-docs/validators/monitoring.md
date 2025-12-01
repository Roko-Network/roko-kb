# Monitoring

## Validator Monitoring & Alerts

### Key Metrics

#### Time Synchronization
```bash
# Check time drift
roko-node status | jq .sync_info.time_drift_ns

# Monitor PTP status
cat /sys/class/ptp/ptp0/clock_name
```

#### Node Health
```bash
# Node status
roko-node status

# Peer connections
roko-node query tendermint peers

# Consensus state
roko-node query slashing signing-info $(roko-node tendermint show-validator)
```

### Prometheus Metrics
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'roko-validator'
    static_configs:
      - targets: ['localhost:26660']
```

Key metrics to monitor:
- `roko_time_drift_nanoseconds`
- `roko_blocks_missed_total`
- `roko_validator_power`
- `roko_consensus_height`

### Alert Rules
```yaml
# Critical: Time drift > 100ns
- alert: HighTimeDrift
  expr: roko_time_drift_nanoseconds > 100
  annotations:
    summary: "Time drift exceeded threshold"

# Warning: Missed blocks
- alert: MissedBlocks
  expr: rate(roko_blocks_missed_total[5m]) > 0.01
```

### Dashboard Setup
- Grafana dashboard: [roko.network/grafana-template](https://roko.network/grafana-template)
- Metrics endpoint: `http://localhost:26660/metrics`

---

> **Monitor precisely**: Track nanosecond-level performance.