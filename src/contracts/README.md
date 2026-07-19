# Casper Network DeFi Yield Router Smart Contract Deployment Guide

This guide details how to build and deploy the **Yield Agent** Odra Smart Contract to the Casper Testnet. The web app now sends Deposit, Withdraw, and Rebalance as `StoredContractByHash` calls. It no longer silently converts a Deposit into a native CSPR transfer.

## Prerequisites

1. **Rust Toolchain**: Install Rustup and switch to a stable channel.
   ```bash
   rustup toolchain install stable
   rustup target add wasm32-unknown-unknown
   ```

2. **Cargo Odra**: Install the Odra development framework tool.
   ```bash
   cargo install cargo-odra --locked
   ```

3. **Casper Client**: To interact directly with testnet nodes.
   ```bash
   cargo install casper-client
   ```

---

## 1. Compile the Smart Contract

Navigate to the project directory and build the Odra WASM binary:

```bash
cargo odra build
```

This compiles the smart contract into a compact, optimized WASM module ready for Casper VM execution:
- Target output location: `target/wasm32-unknown-unknown/release/yield_agent.wasm`

---

## 2. Deploy to Casper Testnet-4

To deploy the contract, execute a standard deploy transaction to a Casper Testnet validator node.

### A. Deploy Command (via Casper Client CLI)

Replace `<PATH_TO_YOUR_KEY>` with your active Casper Wallet private key path, and `<AMOUNT>` with your deployment budget (standard is 50-80 CSPR):

```bash
casper-client put-deploy \
  --node-address https://rpc.testnet.casper.network:7777 \
  --chain-name casper-test \
  --secret-key <PATH_TO_YOUR_KEY>/secret_key.pem \
  --payment-amount 50000000000 \
  --session-path target/wasm32-unknown-unknown/release/yield_agent.wasm
```

### B. View Transaction on-chain
The transaction returns a `deploy_hash` string. Check its status on the official explorer:
- **Casper Testnet Explorer**: `https://testnet.cspr.live/deploy/<DEPLOY_HASH>`

---

## 3. Initialize the Contract

Once the install deploy is finalized, query the contract hash from the deployer's named keys. Call `init` once to establish the owner and default pools:

```bash
casper-client put-deploy \
  --node-address https://rpc.testnet.casper.network:7777 \
  --chain-name casper-test \
  --secret-key <PATH_TO_YOUR_KEY>/secret_key.pem \
  --payment-amount 10000000000 \
  --session-hash hash-<CONTRACT_HASH_HERE> \
  --session-entry-point init
```

Then enter the resulting `hash-...` contract hash in the app's Settings page. The UI validates that a 64-hex-character contract hash is present before it can sign a contract call.

> Important: a contract call with an `amount` argument updates the contract's accounting state. It does not automatically move native CSPR into the contract. Native CSPR custody requires a separate, explicitly designed purse-transfer flow or a token contract such as CEP-18.

---

## 4. Contract entry points used by the app

The app calls these entry points with Casper serialized runtime arguments:

- `deposit(amount: U512, pool_id: U8)`
- `withdraw(amount: U512, pool_id: U8)`
- `rebalance(strategy_mode: String, target_allocations: Vec<StrategyAllocation>)`

The current frontend produces the first two calls directly. Rebalance integration should be enabled after the deployed contract ABI is verified on Testnet.

## 5. Periodic Oracle Updates

Oracle agents update pool APYs automatically on-chain via the `update_pool_apy` entry point:

```bash
casper-client put-deploy \
  --node-address https://rpc.testnet.casper.network:7777 \
  --chain-name casper-test \
  --secret-key <PATH_TO_YOUR_KEY>/secret_key.pem \
  --payment-amount 5000000000 \
  --session-hash hash-<CONTRACT_HASH_HERE> \
  --session-entry-point update_pool_apy \
  --session-arg "pool_id:u8='1'" \
  --session-arg "new_apy:u64='142'"
```

---

## 6. Fetch Active Strategies (Read-Only)

To query active portfolio breakdowns without paying gas:

```bash
casper-client get-state-item \
  --node-address https://rpc.testnet.casper.network:7777 \
  --state-root-hash <LATEST_STATE_ROOT_HASH> \
  --key hash-<CONTRACT_HASH_HERE> \
  --path "current_strategy"
```
