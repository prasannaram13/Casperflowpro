# CasperFlow: On-Chain Casper dApp Integration

CasperFlow is a decentralized yield routing and optimization dApp wired directly to the Casper Network Testnet. This documentation details the smart contract deployment, backend relay servers, on-chain state queries, and transaction verification flows.

## 🚀 Smart Contract Details

- **Chain**: Casper Testnet (`casper-test`)
- **Real Deploy Hash**: `8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd`
- **Block Height**: `8404600`
- **Explorer Tracker**: [Casper Live Deploy Tracker](https://testnet.cspr.live/deploy/8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd)

### Smart Contract Entry Points (Odra VM)
The underlying Smart Contract is built using the **Odra** framework and implements the following core endpoints:
- `initialize(initial_pools: Vec<DefiPool>)`: Sets up the target liquidity pools and configures the initial baseline parameters (authorized admin/owner only).
- `deposit(pool_id: u8, amount: U512)`: Deposits CSPR (in motes) into the target optimization pool.
- `withdraw(pool_id: u8, amount: U512)`: Redeems assets and pulls funds back to the user's connected wallet.
- `rebalance(allocations: Vec<StrategyAllocation>)`: Triggers an active portfolio re-route across registered yield providers.
- `update_pool_apy(pool_id: u8, new_apy: u32)`: Admin/Oracle entry point to update a specific pool's yield rate (APY) on-chain.

---

## 🛠️ Architecture and End-to-End Wiring

The application is fully decentralized, removing all simulated mock transaction fallbacks.

```
┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
│   React Client (Vite)  │ ──────> │  Express Relay Server  │ ──────> │  Casper Testnet Node   │
│   (CSPR.click / SDK)   │ <────── │  (Balance / Broadcast) │ <────── │  (JSON-RPC / State)    │
└────────────────────────┘         └────────────────────────┘         └────────────────────────┘
```

### 1. Cryptographic Handshake (`src/components/TransactionProducerModal.tsx`)
- Constructed with `ExecutableDeployItem.newStoredContractByHashCall` and proper CLValue encoding for all custom arguments (such as `U512` converted to motes, list allocations, etc.).
- Direct integration with Casper wallet extensions (CSPR.click, Casper Wallet, Casper Signer) ensures secure client-side signing. All mock offline signature generation has been strictly removed.

### 2. Relay Backend proxy (`server.ts`)
- `/api/casper/put-deploy`: Relays the signed transactions directly to multiple testnet nodes (`https://node.testnet.casper.network/rpc`, `https://node-clarity-testnet.make.services/rpc`, etc.). Real responses or rejects are relayed back to the client instantly.
- `/api/casper/deploy-status/:hash`: Queries the execution result of the transaction and reports status.

### 3. Verification & Polling (`src/services/CasperService.ts`)
- `pollDeployStatus()`: Constantly monitors the Casper blockchain. If a transaction is reverted or encounters an error (e.g., Out of Gas, Revert), the actual error message and status (`Failure`) are extracted from the block state and displayed directly on the UI instead of masking them.

---

## 💻 Testing and Execution

To start the local developer server:
```bash
npm run dev
```

The dev server binds automatically to `http://localhost:3000` behind the secure ingress proxy. Connect your Casper Wallet on Testnet-4, fund your account via the Casper Testnet Faucet, and run transactions directly through the client to see live on-chain status tracking in action.
