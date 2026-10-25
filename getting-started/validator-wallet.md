# Validator wallet: ROKO, pwROKO and enrollment

For validator enrollment, use a **local node-generated wallet** and the
[step-by-step node-wallet guide](https://docs.roko.network/pages/validator-node-wallet.html).
The October 23, 2026 operator guidance identifies this as the path with successful
validator deployment reported for ordinary users. MetaMask/Talisman enrollment
is unverified or known-failing. Connecting a browser wallet, seeing a balance or
importing a token does not establish enrollment support.

## Use the current testnet and the correct account

| Field | Current testnet value |
| --- | --- |
| Network | ROKO Testnet |
| EVM chain ID | `52370` (`0xcc92`) |
| Public RPC | `https://rpc.roko.network` |
| Explorer | `https://explorer.roko.network` |
| Native currency | ROKO, 18 decimals |
| Genesis | `0x0a2296f8f036f71437e8f6f2028ccbf0dc3dd6b3de9120fc15e43789c794e8bb` |

These network values were checked with read-only `eth_chainId` and
`chain_getBlockHash(0)` on October 24, 2026. Chain ID 442 in older KB examples is
historical. Check the live network again before signing after any testnet reset.

Fund the wallet's own public account: `0x` followed by 40 hexadecimal characters.
The node-wallet `create` output names it `account`. The staking wallet is separate
from node/session identities; never substitute a session key, P2P key or seed.
The node-wallet tool creates its own password-encrypted wallet; it does not import
or migrate the funded MetaMask account. An existing funded account can fund the
new public account through the normal supported transfer process, after checking
the destination and retaining its own fee reserve. Never send private keys or
wallet files to support.

## Locking is one step, not enrollment

Locking backs pwROKO one-for-one with native ROKO in the same account. pwROKO is
a non-transferable staking representation, not a freely transferable swap token.
Importing its read interface as a custom token does not perform a lock or bond.

The native workflow is:

1. `pwRoko.lock`: lock enough native ROKO to reach the intended pwROKO balance.
2. `staking.bond`: bond the requested pwROKO amount.
3. `session.setKeys`: register the verified public session package for that node.
4. `staking.validate`: declare validator intent.

The node-wallet command plans the next needed step from current finalized state;
do not repeat completed calls or rotate session keys to retry. Successful
registration still needs separate activation, election and finalized-authorship
checks. The linked guide covers readiness, Safe loopback RPC, the guarded session
package, submission and recovery. It uses ordinary account authority, not a sudo
or administrator account.

## Leave native ROKO for fees

Do not lock the entire native balance or use **MAX** unless the exact flow has
been shown to retain enough spendable native ROKO. pwROKO cannot pay native fees.
There is no verified universal minimum reserve: current fees, remaining calls,
existential deposit and staking minimums must be checked for the actual account
and runtime. A balance of 99 ROKO by itself does not establish a safe lock amount.

On the validator host, follow the linked guide to install the reviewed wallet
release, create/fund its encrypted wallet and prepare the public enrollment file.
Then review the read-only next-step plan, replacing the example account with the
public account printed by `create`:

```bash
bin/roko-validator-wallet plan \
  --wallet "$HOME/.local/share/roko-validator/staking-wallet.json" \
  --account 0xYOUR_40_HEX_CHARACTER_ACCOUNT \
  --enrollment roko-validator-enrollment.json
```

Run this from the reviewed tools checkout. The wallet JSON and enrollment JSON
are different files. `plan` does not unlock the wallet or submit a transaction.
Check `nextCall`, `estimatedFeePlanck`, `nativeRequiredPlanck` and
`nativeFreePlanck`; one ROKO is `1000000000000000000` planck. The plan estimates one
next call, not a guaranteed reserve for the whole enrollment. Rerun it after
funding and before each next action. If choosing a non-default stake, use the same
reviewed `--stake-planck` value for planning and enrollment. Only proceed to the
linked guide's explicit submission step after reviewing the account and plan.

## What is confirmed for MetaMask?

The issue's proposed [staking portal](https://stake.roko.network) flow — connect,
choose Lock ROKO, confirm and inspect the position — has **not been verified
end-to-end here for MetaMask**. It is not presented as a completed enrollment
procedure. If the button is disabled or fee estimation fails, do not force a
transaction, invent calldata or treat reconnecting the wallet as a repair.

The pwROKO precompile reference is
`0x0000000000000000000000000000000000000500` (pwROKO, 18 decimals). This is not a
staking wallet address: do not send ordinary transfers to it or enter it as the
node-wallet `--account`. The native node-wallet workflow needs neither an EVM
spender approval nor a token import. See the
[address/function reference](https://docs.roko.network/pages/prepare-validator.html#which-address-goes-where).

For a browser-flow investigation, record the public account, chain ID, relevant
software versions, exact visible error and any existing transaction hash. An EVM
transaction can be checked by hash in the explorer, including its success/failure
receipt; native enrollment must also be checked in finalized runtime state.
Never provide seeds, passwords, keystores or full wallet/environment exports.
A successful MetaMask lock/receipt/position verification and any browser-specific
reserve behavior remain separate qualification work; no transaction was submitted
for this documentation update.
