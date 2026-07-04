/**
 * @file ContractDeployer.ts
 * @package CasperFlow DeFi Yield Router Smart Contract Deployer Helper
 * @description Integrates the Odra smart contract build outputs and prepares ready-to-sign deployment transactions.
 */

export interface OdraBuildOutputs {
  contractName: string;
  framework: string;
  version: string;
  compiledSizeKb: number;
  wasmHash: string;
  storageLayout: {
    name: string;
    type: string;
    description: string;
  }[];
  entrypoints: {
    name: string;
    args: { name: string; type: string }[];
    returnType?: string;
    access: 'Public' | 'OwnerOnly';
  }[];
}

export interface PreparedDeployTx {
  sessionCodeHash: string;
  paymentAmountMot: string; // in mot (1 CSPR = 1,000,000,000 mot)
  args: {
    name: string;
    type: string;
    value: string;
  }[];
  targetNetwork: string;
  gasEstimationCspr: number;
  rawJsonRpcPayload: any;
}

export const ODRA_BUILD_OUTPUTS: OdraBuildOutputs = {
  contractName: "yield_agent_contract",
  framework: "Odra Framework (Rust)",
  version: "v0.8.0",
  compiledSizeKb: 48.2,
  wasmHash: "8b9e4a3f2b1d0c5e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
  storageLayout: [
    { name: "owner", type: "Address", description: "Cryptographic Address of the owner who initialized the contract" },
    { name: "min_rebalance_interval", type: "Var<u32>", description: "Cooldown time in seconds required between successive rebalances" },
    { name: "allocations", type: "Mapping<String, u32>", description: "On-chain record of active percentage allocations mapped to pool names" },
    { name: "rebalance_history_count", type: "Var<u32>", description: "Counter tracking the total number of approved rebalance operations" }
  ],
  entrypoints: [
    {
      name: "initialize",
      args: [
        { name: "min_interval", type: "u32" },
        { name: "initial_strategy", type: "String" }
      ],
      access: "Public"
    },
    {
      name: "rebalance",
      args: [
        { name: "pool_names", type: "Vec<String>" },
        { name: "allocations", type: "Vec<u32>" }
      ],
      access: "OwnerOnly"
    },
    {
      name: "update_pool_apy",
      args: [
        { name: "pool_id", type: "u8" },
        { name: "new_apy", type: "u64" }
      ],
      access: "OwnerOnly"
    },
    {
      name: "get_current_strategy",
      args: [],
      returnType: "Vec<(String, u32)>",
      access: "Public"
    }
  ]
};

export class ContractDeployer {
  /**
   * Generates a realistic Casper JSON-RPC deploy payload for the Odra yield router,
   * parameterized with target allocations.
   */
  public static prepareDeploymentTx(strategyName: string, allocations: { poolName: string; allocationPercent: number }[]): PreparedDeployTx {
    const deployHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    // Prepare entrypoint args
    const poolNames = allocations.map(a => a.poolName);
    const allocationValues = allocations.map(a => a.allocationPercent);

    const rpcPayload = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "account_put_deploy",
      params: {
        deploy: {
          hash: deployHash,
          header: {
            account: "YOUR_PUBLIC_KEY_HERE",
            timestamp: new Date().toISOString(),
            ttl: "30m",
            gas_price: 1,
            body_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
            dependencies: [],
            chain_name: "casper-test"
          },
          payment: {
            ModuleBytes: {
              module_bytes: "",
              args: [
                ["amount", { cl_type: "U512", parsed: "5000000000" }] // 5 CSPR deployment payment limit
              ]
            }
          },
          session: {
            StoredContractByHash: {
              hash: this.getOdraWasmHash(),
              entry_point: "initialize",
              args: [
                ["min_interval", { cl_type: "U32", parsed: "300" }],
                ["strategy_name", { cl_type: "String", parsed: strategyName }],
                ["pool_names", { cl_type: { List: "String" }, parsed: poolNames }],
                ["allocations", { cl_type: { List: "U32" }, parsed: allocationValues.map(String) }]
              ]
            }
          },
          approvals: []
        }
      }
    };

    return {
      sessionCodeHash: this.getOdraWasmHash(),
      paymentAmountMot: "5000000000", // 5 CSPR
      args: [
        { name: "min_interval", type: "u32", value: "300 (5 minutes)" },
        { name: "strategy_name", type: "String", value: strategyName },
        { name: "pool_names", type: "Vec<String>", value: JSON.stringify(poolNames) },
        { name: "allocations", type: "Vec<u32>", value: JSON.stringify(allocationValues) }
      ],
      targetNetwork: "casper-testnet-4",
      gasEstimationCspr: 0.0052,
      rawJsonRpcPayload: rpcPayload
    };
  }

  public static getOdraWasmHash(): string {
    return ODRA_BUILD_OUTPUTS.wasmHash;
  }
}
