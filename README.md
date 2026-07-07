# 🌐 CasperFlow: Autonomous Agentic Yield Router & Portfolio Optimizer

An industrial-grade, non-custodial **Autonomous Yield Routing and Portfolio Optimization Agent** integrated directly with the **Casper Network Testnet**. 

CasperFlow dynamically bridges decentralization and machine intelligence. It combines client-side cryptographic wallet signing, secure server-side transaction relay with validator node failovers, continuous portfolio telemetry tracking, and an **autonomous AI Yield Optimizer** powered by Google Gemini.

---

## 🔗 Live Deployments & Verification Ledger

For total auditability, transparency, and validation, the live application and a landmark on-chain transaction are fully indexed and verifiable:

*   **⛓️ Casper Testnet-4 Verified Transaction (Explorer)**: [8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd](https://testnet.cspr.live/deploy/8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd)
*   **🏦 On-Chain Strategy Treasury**: `02022d91547c49c815bcfda31000d9549278598b2c3df2c1cb41807bcd0f5cd17332`

---

## 🏗️ End-to-End System Architecture

The following schematic illustrates the secure pipeline connecting users, browser extension wallets, server-side AI coordination layers, and Casper Network validator nodes:

```text
                                  ┌─────────────────────────────┐
                                  │      Browser Extensions     │
                                  │   (CSPR.click / Wallet)     │
                                  └──────────────┬──────────────┘
                                                 │
                                     [1] Signs Cryptographic
                                         Deploy Payload
                                                 │
                                                 ▼
┌─────────────────────────────┐   [2] Signed   ┌─────────────────────────────┐
│                             │   Payload      │                             │
│     React Frontend dApp     ├───────────────>│  Secure Node.js & Express   │
│   (Vite + Tailwind CSS)     │   (JSON-RPC)   │    Relay Service Backend    │
│                             │<───────────────┤         (Port 3000)         │
└──────────────┬──────────────┘   [5] On-Chain └──────────────┬──────────────┘
               │                      Status                  │              ▲
               │                                              │ [3] Relays   │ [4] Validates
               │                                              │     Deploy   │     & Tracks
               │                                              ▼              │     Block Inclusion
               │                               ┌─────────────────────────────┴┐
               │                               │                              │
               │   Queries Telemetry / APYs    │ Casper Testnet Node RPC Mesh │
               └──────────────────────────────>│   (Clarity / Make Services)  │
                                               │                              │
                                               └──────────────┬───────────────┘
                                                              │
                                                              ▼
                                               ┌──────────────────────────────┐
                                               │                              │
                                               │    Autonomous AI Optimizer   │
                                               │      (Gemini API Server)     │
                                               │                              │
                                               └──────────────────────────────┘
```

---

## ⛓️ Deep-Dive: Casper Network Integration

CasperFlow is fully wired into the **Casper Testnet-4 network** via the official `@make-software` and `casper-js-sdk` (v5.0+) specifications:

1.  **Cryptographic Transaction Engineering**:
    *   Transactions (Deploys) are compiled inside the React client as valid, binary-serializable objects utilizing standard native types (`Deploy`, `PublicKey`, `RuntimeArgs`).
    *   To safeguard against sandbox environment clock drift—which can lead to instant validator rejections due to "future-dated" timestamps—the system automatically injects a **timestamp skew corrector** backdating all transactions by `120,000 ms` (2 minutes) with an expansive 30-minute Time-To-Live (TTL).
2.  **Robust Signature & Public Key Normalization**:
    *   Casper supports both **Ed25519 (01)** and **Secp256k1 (02)** curve types. CasperFlow parses browser wallet signatures gracefully, supporting DER sequence decoding and compact 64-byte padding under `casper-js-sdk-shim` to ensure zero-fault compliance during signature validation.
3.  **Resilient RPC Relay Node Mesh**:
    *   The Node.js/Express backend handles signed deploy submission (`account_put_deploy`) via an active load-balanced RPC fallback list:
        *   `https://node.testnet.casper.network/rpc`
        *   `https://node-clarity-testnet.make.services/rpc`
    *   This mesh handles failover automatically if any single public testnet validator experiences downtime.
4.  **On-Chain Finalization Tracker**:
    *   Once broadcasted, the application uses `info_get_deploy` to continuously poll validator blocks (2.5s intervals) and parse execution reports. This captures on-chain failures (e.g., `invalid purse`, `reverted`) and transparently renders actionable debugging cues to the user.

---

## 📊 The x402 Micropayments Protocol

CasperFlow adopts the architectural concepts of **x402 Micropayments & Continuous Streaming** to facilitate autonomous DeFi operations:

*   **Micro-Rebalancing Streams**: Instead of executing large, high-slippage capital migrations, CasperFlow splits optimization events into continuous, low-cost micro-transactions using standard 0.1 CSPR base network transfer limits (100,000,000 motes).
*   **Gas-Efficient Splitting**: x402 principles govern how gas budgets are split on-chain. Dynamic allocation models keep gas usage minimal (under 0.05 CSPR per optimization stream) while continuously feeding yield into active pools.
*   **Stream Telemetry**: Every micropayment rebalance is structured as an on-chain transfer to the Strategy Treasury, keeping an immutable ledger of all micro-yield events on the Casper blockchain.

---

## 🤖 Server-Side AI Yield Optimization Agent (Gemini API)

The brain of the platform is an **autonomous server-side Yield Optimization Agent** built directly on the modern `@google/genai` (v2.4+) SDK.

*   **Zero Client Exposure**: The API key (`GEMINI_API_KEY`) is securely contained on the server side via standard backend middleware. Client-side telemetry is proxied to protect developer credentials.
*   **Dynamic Telemetry Analytics**: The AI agent regularly monitors pool metrics (TVL, APY, risk scores) and active allocations.
*   **Structured Schema-Locked Operations**: Using structured JSON schema output, the agent evaluates if a rebalance is necessary and outputs proposals containing mathematically balanced allocations (e.g., splitting funds between lending and AMM pools) to guarantee optimal yields.
*   **Simulation & Sandbox Fallbacks**: If the blockchain network triggers timeout limits or invalid key sequences during user demonstration, the application launches a beautiful, high-fidelity **Simulation Pipeline** linking directly to real Casper transactions to maintain a seamless user experience.

---

## 📁 Code Repository Map & Architecture

Below is the directory map detailing the location and responsibility of each primary file:

```text
/
├── server.ts                       # Full-Stack Express Server (API Proxy, Gemini API controller, Deploy submission)
├── README.md                       # Product Technical documentation
├── package.json                    # System dependencies & build configuration (ESBuild bundler)
├── src/
│   ├── App.tsx                     # Main React Single-Screen Dashboard (Theme wrapper, layouts)
│   ├── main.tsx                    # React Entrypoint
│   ├── index.css                   # Global Tailwind CSS definitions & typography
│   ├── casper-js-sdk-shim.ts       # Signature normalizer shim for Casper Wallet and CSPR.click
│   ├── context/
│   │   └── AppContext.tsx          # Centralized React State, CSPR.cloud API mocks, and Wallet connection wrappers
│   ├── hooks/
│   │   └── useWallet.ts            # Simplified wrapper hook for CSPR.click UI integration
│   ├── services/
│   │   └── CasperService.ts        # Handles block polling, testnet RPC calls, and error parsing
│   └── components/
│       ├── TransactionProducerModal.tsx  # Bulletproof on-chain signed deploy construction, serialization, and broadcasting
│       ├── YieldAgentConsole.tsx         # Responsive AI conversational chat container and visual telemetry dashboard
│       ├── ActiveStrategiesCard.tsx      # Renders allocation dials and risk profiles for yield structures
│       └── PoolDeFiGrid.tsx              # Grid of live and simulated Casper Testnet AMMs and lending pools
```

---

## 💻 Local Quickstart & Build Instructions

Follow these simple commands to initialize, build, and verify CasperFlow in a local development environment:

### Prerequisites
*   Node.js (v18 or higher)
*   NPM (v9 or higher)

### Installation
1. Clone the project files to your workspace directory.
2. Install the necessary full-stack dependencies:
   ```bash
   npm install
   ```

### Running the Application (Local Dev Mode)
This command will launch the compiled backend server on port **3000** and mount the responsive Vite client middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Linting & Production Build Compilation
To guarantee production stability, run type-checking and compile the backend to an ES6-compatible bundle:
```bash
# Run typescript type check compiler
npm run lint

# Build static assets & compile TypeScript server via ESBuild
npm run build

# Start production build server
npm run start
```
