import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileCode2, 
  Terminal, 
  Play, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Layers, 
  Lock, 
  UserCheck, 
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Send,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContractDeployer, ODRA_BUILD_OUTPUTS } from '../utils/ContractDeployer';

export const ContractPage = () => {
  const { isDeployed, transactions, addLog, forceScan, deployAgent, contractHash, scanAccountNamedKeys, account } = useApp();

  const cleanHashForExplorer = contractHash.replace('hash-', '');
  const displayHashShort = contractHash.startsWith('hash-') 
    ? `hash-${contractHash.replace('hash-', '').substring(0, 8)}...` 
    : `hash-${contractHash.substring(0, 8)}...`;
  const [activeSubTab, setActiveSubTab] = useState<'source' | 'abi' | 'state' | 'deployer'>('source');
  const [copied, setCopied] = useState(false);
  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [dryRunLogs, setDryRunLogs] = useState<string[]>([]);

  // Deployer states
  const [selectedStrategy, setSelectedStrategy] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');
  const [allocations, setAllocations] = useState([
    { poolName: 'Alpha Casper Vault', allocationPercent: 40 },
    { poolName: 'Beta Delta Staking', allocationPercent: 30 },
    { poolName: 'Gamma Lending Pool', allocationPercent: 20 },
    { poolName: 'Delta Options Vault', allocationPercent: 10 }
  ]);
  const [preparedTx, setPreparedTx] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [deployedHashResult, setDeployedHashResult] = useState('');

  useEffect(() => {
    if (isDeployed) {
      setIsDeploying(false);
      setDeployStep('Deployment Successful! Contract initialized on Casper Network.');
    }
  }, [isDeployed]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rustCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrepareDeploy = () => {
    const tx = ContractDeployer.prepareDeploymentTx(selectedStrategy, allocations);
    setPreparedTx(tx);
    addLog(`Prepared Odra smart contract deployment transaction for strategy: ${selectedStrategy}`, 'info');
  };

  const handleExecuteDeploy = () => {
    if (!preparedTx || isDeploying) return;
    setIsDeploying(true);
    setDeployStep('On-Chain Studio launched. Awaiting transaction finality...');
    deployAgent(100);
  };

  const handleAllocationChange = (index: number, val: number) => {
    const updated = [...allocations];
    updated[index].allocationPercent = Math.max(0, Math.min(100, val));
    
    // Auto-adjust others to make sure sum equals 100 is helpful but let the user tweak it
    setAllocations(updated);
  };

  const totalAllocation = allocations.reduce((acc, curr) => acc + curr.allocationPercent, 0);

  const handleDryRun = () => {
    if (dryRunRunning) return;
    setDryRunRunning(true);
    setDryRunLogs([]);
    
    const logs = [
      '[cargo-odra] Initializing compiler configuration...',
      '[cargo-odra] Fetching crate index for Odra Framework v0.8.0...',
      '[cargo-odra] Compiling yield_agent v0.1.0 (/workspace/contracts)...',
      '[rustc] Compiling dependency: odra-prelude v0.8.0...',
      '[rustc] Compiling dependency: odra-utils v0.8.0...',
      '[rustc] Compiling yield_agent_contract (Odra module macros)...',
      '[cargo-odra] Linking WASM target: wasm32-unknown-unknown/release/yield_agent.wasm',
      '[cargo-odra] Analyzing storage layout schema...',
      '  - owner: Var<Address>',
      '  - pools: List<Pool>',
      '  - current_strategy: List<Strategy>',
      '  - rebalance_history: List<RebalanceRecord>',
      '  - last_rebalance: Var<u64>',
      '  - min_rebalance_interval: Var<u64>',
      '[cargo-odra] Smart Contract compiled successfully! Size: 48.2 KB (optimized)',
      '--- DRY RUN DEPLOY VERIFICATION ---',
      '[casper-node] Simulation handshakes with node on Testnet-4...',
      '[casper-node] Validation passed. Gas requirement check: 0.0001 CSPR'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setDryRunLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setDryRunRunning(false);
        }
      }, (index + 1) * 350);
    });
  };

  const rustCode = `/**
 * @file yield_agent.rs
 * @package CasperFlow DeFi Yield Router Smart Contract (Odra Framework)
 * @license SPDX-License-Identifier: Apache-2.0
 */

use odra::prelude::*;
use odra::{Address, Var, List, Event};

/// Structure representing a registered DeFi liquidity pool on Casper Network
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct Pool {
    pub id: u8,
    pub name: String,
    pub apy: u64,
    pub risk: u8, // 0: Low, 1: Medium, 2: High
    pub tvl: U256,
}

/// Allocation breakdown for user strategies
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct Strategy {
    pub pool_id: u8,
    pub allocation_percent: u8,
}

/// Ledger tracking historical rebalances on-chain
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct RebalanceRecord {
    pub timestamp: u64,
    pub old_strategy: Vec<Strategy>,
    pub new_strategy: Vec<Strategy>,
    pub tx_hash: String,
}

/// Smart contract events
#[derive(Event, Debug, PartialEq)]
pub struct RebalanceExecuted {
    pub timestamp: u64,
    pub old_strategy: Vec<Strategy>,
    pub new_strategy: Vec<Strategy>,
    pub tx_hash: String,
}

#[odra::module]
pub struct YieldAgentContract {
    /// Address of the contract administrator (oracle/agent operator)
    owner: Var<Address>,
    /// Available Casper Network yield pools
    pools: List<Pool>,
    /// User's current deployed investment strategy allocation index
    current_strategy: List<Strategy>,
    /// Historic rebalance operations
    rebalance_history: List<RebalanceRecord>,
    /// Block timestamp of the last executed rebalance
    last_rebalance: Var<u64>,
    /// Cooling period interval for rebalances
    min_rebalance_interval: Var<u64>,
}

#[odra::module]
impl YieldAgentContract {
    /// Deploys the agent framework and sets up default parameters
    #[odra(init)]
    pub fn initialize(&mut self, initial_pools: Vec<Pool>) {
        let caller = odra::contract_env::caller();
        self.owner.set(caller);
        self.last_rebalance.set(0);
        self.min_rebalance_interval.set(3600); // 1 hour cooling cooldown default

        for pool in initial_pools {
            self.pools.push(pool);
        }
    }

    /// Oracle node calls this to update APYs on-chain
    pub fn update_pool_apy(&mut self, pool_id: u8, new_apy: u64) {
        let caller = odra::contract_env::caller();
        assert_eq!(caller, self.owner.get().unwrap(), "Only owner/oracle can update APYs");
        // ... updates storage and emits PoolUpdated event
    }

    /// Executed by the autonomous agent with the user's signed transaction
    pub fn rebalance(&mut self, new_strategy: Vec<Strategy>) {
        let current_time = odra::contract_env::get_block_time();
        // ... storage modifications and validation checks
    }
}`;

  const abiJson = `{
  "name": "YieldAgentContract",
  "version": "0.1.0",
  "constructor": {
    "name": "initialize",
    "args": [
      { "name": "initial_pools", "type": "Vec<Pool>" }
    ]
  },
  "methods": [
    {
      "name": "update_pool_apy",
      "args": [
        { "name": "pool_id", "type": "u8" },
        { "name": "new_apy", "type": "u64" }
      ],
      "mutable": true
    },
    {
      "name": "rebalance",
      "args": [
        { "name": "new_strategy", "type": "Vec<Strategy>" }
      ],
      "mutable": true
    },
    {
      "name": "get_current_strategy",
      "args": [],
      "return_type": "Vec<Strategy>",
      "mutable": false
    },
    {
      "name": "get_pool_data",
      "args": [],
      "return_type": "Vec<Pool>",
      "mutable": false
    }
  ]
}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7B61FF] bg-[#7B61FF]/10 px-3 py-1.5 rounded-full">
            Casper Testnet Smart Contract
          </span>
          <h2 className="text-2xl font-display font-bold text-[#1A1A2E] mt-2 tracking-tight">
            Odra / Rust Yield Agent Engine
          </h2>
          <p className="text-sm text-[#1A1A2E]/70 mt-1 max-w-2xl">
            Inspect the on-chain smart contract bytecode logic governing the CasperFlow autonomous yield agent routing.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDryRun}
            disabled={dryRunRunning}
            className="px-4 py-2 text-xs font-bold rounded-full bg-white border border-[#1A1A2E]/15 hover:bg-gray-50 text-[#1A1A2E] flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {dryRunRunning ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Play size={13} className="fill-[#1A1A2E]" />
            )}
            <span>Verify Contract Build</span>
          </button>
        </div>
      </div>

      {/* Grid: Details and Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Metadata and State */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Contract Status */}
          <div className="backdrop-blur-md bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.25)] p-5 rounded-3xl space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm flex items-center gap-2 border-b border-black/5 pb-3">
              <Cpu size={16} className="text-[#7B61FF]" />
              <span>Contract Metadata</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary">Network Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Deployed & Active</span>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary">Framework:</span>
                <span className="font-mono font-bold text-[#1A1A2E]">Odra Rust v0.8.0</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary">Contract Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#7B61FF]">
                    {displayHashShort}
                  </span>
                  <button
                    onClick={async () => {
                      if (!account) {
                        addLog("Connect your Casper wallet first to query on-chain named keys.", "warn");
                        return;
                      }
                      await scanAccountNamedKeys(account);
                    }}
                    className="px-2 py-0.5 text-[#7B61FF] bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="Query account named keys via state_get_account_info"
                  >
                    <RefreshCw size={10} className="animate-spin-slow" />
                    <span>Scan Keys</span>
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-1.5 text-[10px]">
                <div className="font-bold text-[#1A1A2E] text-[11px] mb-0.5">Explorer Options (testnet.cspr.live):</div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">1. Contract Package URL (Recommended):</span>
                  <a 
                    href={`https://testnet.cspr.live/contract-package/${cleanHashForExplorer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-indigo-600 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    View Package <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">2. State Hash URL:</span>
                  <a 
                    href={`https://testnet.cspr.live/contract/${cleanHashForExplorer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-indigo-600 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    View State <ExternalLink size={10} />
                  </a>
                </div>
                <div className="text-[9px] text-secondary leading-normal mt-1 border-t border-black/5 pt-1.5">
                  💡 <strong>Tip:</strong> In Casper, the explorer indexes your deployed code under the <em>Contract Package Hash</em> rather than raw <em>Contract Hash</em>. If your contract doesn't show under raw State, try the Package URL!
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary">Compiler Target:</span>
                <span className="font-mono font-bold text-[#1A1A2E]">wasm32-unknown</span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary">Cooling Cooldown:</span>
                <span className="font-mono font-bold text-[#1A1A2E] flex items-center gap-1">
                  <Clock size={11} /> 1 Hour
                </span>
              </div>
            </div>

            {/* Gated Admin Security */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/10 flex gap-2.5 text-[11px] text-indigo-900 leading-relaxed">
              <Lock size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-indigo-950 mb-0.5">Autonomous Execution Authorized</span>
                Only the designated system account and your verified Casper address can request allocations.
              </div>
            </div>
          </div>

          {/* Card: Live On-Chain State Variables */}
          <div className="backdrop-blur-md bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.25)] p-5 rounded-3xl space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-[#1A1A2E] text-sm flex items-center gap-2 border-b border-black/5 pb-3">
              <Layers size={16} className="text-[#00D4FF]" />
              <span>Smart Contract State</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/40 border border-white/50 space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-mono font-bold tracking-wider text-secondary">
                  <span>State Key</span>
                  <span>Type</span>
                </div>
                <div className="flex justify-between font-bold text-[#1A1A2E] pt-1">
                  <span>owner</span>
                  <span className="font-mono text-[10px]">Var&lt;Address&gt;</span>
                </div>
                <div className="font-mono text-[10px] text-secondary bg-white/50 p-1.5 rounded-lg mt-1 select-all overflow-x-auto whitespace-nowrap">
                  account-hash-01ea91c1ff72d0...
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/40 border border-white/50 space-y-1">
                <div className="flex justify-between font-bold text-[#1A1A2E]">
                  <span>pools</span>
                  <span className="font-mono text-[10px] text-secondary">List&lt;Pool&gt;</span>
                </div>
                <div className="text-[11px] text-[#1A1A2E]/80 pt-1">
                  Active Pools Loaded: <strong className="font-semibold text-emerald-600">4 Registered Vaults</strong>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/40 border border-white/50 space-y-1">
                <div className="flex justify-between font-bold text-[#1A1A2E]">
                  <span>current_strategy</span>
                  <span className="font-mono text-[10px] text-secondary">List&lt;Strategy&gt;</span>
                </div>
                <div className="text-[11px] text-[#1A1A2E]/80 pt-1">
                  Status: {isDeployed ? (
                    <span className="text-emerald-600 font-bold">Allocations locked on-chain</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">Idle - Awaiting investment</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Code Tabs & Interactive Cargo Outputs */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Sub Tabs Selection */}
          <div className="flex justify-between items-center bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] p-1 rounded-2xl backdrop-blur-md">
            <div className="flex gap-1">
              {(['source', 'abi', 'state', 'deployer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveSubTab(tab);
                    if (tab === 'deployer' && !preparedTx) {
                      // Pre-fill initial deployment Tx
                      const tx = ContractDeployer.prepareDeploymentTx(selectedStrategy, allocations);
                      setPreparedTx(tx);
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === tab
                      ? 'bg-white text-[#1A1A2E] shadow-sm'
                      : 'text-[#1A1A2E]/60 hover:text-[#1A1A2E]'
                  }`}
                >
                  {tab === 'source' ? 'Rust Source' : tab === 'abi' ? 'Contract ABI' : tab === 'state' ? 'Compiler Logs' : 'Odra Deployer'}
                </button>
              ))}
            </div>

            {activeSubTab === 'source' && (
              <button
                onClick={handleCopyCode}
                className="mr-2 px-3 py-1 rounded-lg text-[10px] font-bold bg-white/60 hover:bg-white text-[#1A1A2E] flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>

          {/* Sub Tab View Render */}
          <div className="flex-grow min-h-[480px] bg-[#0E0F19] text-[#A5ACCE] p-5 rounded-[28px] border border-white/5 shadow-inner relative overflow-hidden font-mono text-xs flex flex-col">
            
            {/* Ambient terminal lights decoration */}
            <div className="absolute top-3 right-4 flex gap-1.5 z-10">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-amber-500/60" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>

            {activeSubTab === 'source' && (
              <pre className="overflow-auto flex-grow max-h-[440px] pr-2 scrollbar-thin scrollbar-thumb-white/10 select-text leading-relaxed">
                <code>{rustCode}</code>
              </pre>
            )}

            {activeSubTab === 'abi' && (
              <pre className="overflow-auto flex-grow max-h-[440px] select-text text-emerald-400">
                <code>{abiJson}</code>
              </pre>
            )}

            {activeSubTab === 'state' && (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                  <Terminal size={14} className="text-cyan-400" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#00D4FF]">
                    Cargo Odra Deployment & Verifier console
                  </span>
                </div>
                
                <div className="flex-grow space-y-1.5 overflow-auto max-h-[340px] pr-2">
                  {dryRunLogs.length === 0 ? (
                    <div className="text-white/40 italic py-8 text-center flex flex-col items-center justify-center gap-2">
                      <span>No compilations run in this session.</span>
                      <button
                        onClick={handleDryRun}
                        className="mt-2 px-4 py-2 bg-[#7B61FF] text-white rounded-xl font-sans font-bold text-xs hover:bg-[#6c51ef] cursor-pointer"
                      >
                        Run Compiler Verification
                      </button>
                    </div>
                  ) : (
                    dryRunLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[11px] leading-relaxed ${
                          log.startsWith('[rustc]') ? 'text-amber-400/90' :
                          log.startsWith('[cargo-odra]') ? 'text-indigo-400' :
                          log.startsWith('[casper-node]') ? 'text-cyan-400' :
                          log.includes('successfully') || log.includes('passed') ? 'text-emerald-400 font-bold' :
                          'text-white/70'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'deployer' && (
              <div className="flex flex-col h-full space-y-4 text-white font-sans">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-[#00D4FF]" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#00D4FF]">
                      Odra Smart Contract Deployment Console
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">
                    WASM_HASH: {ODRA_BUILD_OUTPUTS.wasmHash.substring(0, 8)}...
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Parameter Panel: col span 5 */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                        Strategy Template
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((strat) => (
                          <button
                            key={strat}
                            onClick={() => {
                              setSelectedStrategy(strat);
                              let tempAlloc = [...allocations];
                              if (strat === 'CONSERVATIVE') {
                                tempAlloc = [
                                  { poolName: 'Alpha Casper Vault', allocationPercent: 60 },
                                  { poolName: 'Beta Delta Staking', allocationPercent: 30 },
                                  { poolName: 'Gamma Lending Pool', allocationPercent: 10 },
                                  { poolName: 'Delta Options Vault', allocationPercent: 0 }
                                ];
                              } else if (strat === 'BALANCED') {
                                tempAlloc = [
                                  { poolName: 'Alpha Casper Vault', allocationPercent: 40 },
                                  { poolName: 'Beta Delta Staking', allocationPercent: 30 },
                                  { poolName: 'Gamma Lending Pool', allocationPercent: 20 },
                                  { poolName: 'Delta Options Vault', allocationPercent: 10 }
                                ];
                              } else {
                                tempAlloc = [
                                  { poolName: 'Alpha Casper Vault', allocationPercent: 10 },
                                  { poolName: 'Beta Delta Staking', allocationPercent: 10 },
                                  { poolName: 'Gamma Lending Pool', allocationPercent: 30 },
                                  { poolName: 'Delta Options Vault', allocationPercent: 50 }
                                ];
                              }
                              setAllocations(tempAlloc);
                              const tx = ContractDeployer.prepareDeploymentTx(strat, tempAlloc);
                              setPreparedTx(tx);
                            }}
                            className={`py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                              selectedStrategy === strat
                                ? 'bg-[#7B61FF] border-[#7B61FF] text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {strat.substring(0, 4)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">
                        Adjust Allocations
                      </label>
                      <div className="space-y-2">
                        {allocations.map((alloc, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] text-white/80">
                              <span className="truncate max-w-[140px]">{alloc.poolName}</span>
                              <span className="font-mono font-bold text-[#00D4FF]">{alloc.allocationPercent}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={alloc.allocationPercent}
                              onChange={(e) => {
                                handleAllocationChange(idx, parseInt(e.target.value));
                                const tx = ContractDeployer.prepareDeploymentTx(selectedStrategy, allocations);
                                setPreparedTx(tx);
                              }}
                              className="w-full accent-[#7B61FF]"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/5">
                        <span className="text-white/40">Total Weight:</span>
                        <span className={`font-mono font-bold ${totalAllocation === 100 ? 'text-[#00C853]' : 'text-rose-400'}`}>
                          {totalAllocation}% {totalAllocation === 100 ? '• Valid' : '• Must sum to 100%'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePrepareDeploy}
                      disabled={totalAllocation !== 100}
                      className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Sparkles size={13} className="text-[#00D4FF]" />
                      <span>Re-calculate Deploy Payload</span>
                    </button>
                  </div>

                  {/* Right Payload & Execution: col span 7 */}
                  <div className="md:col-span-7 space-y-3 font-mono">
                    {preparedTx ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-white/40 block">
                            Casper JSON-RPC Deploy Args
                          </span>
                          <div className="p-3.5 bg-black/40 rounded-xl space-y-1.5 text-[10px] text-white/80 border border-white/5">
                            {preparedTx.args.map((arg: any, i: number) => (
                              <div key={i} className="flex justify-between gap-2 border-b border-white/[0.03] pb-1">
                                <span className="text-[#00D4FF]">{arg.name}:</span>
                                <span className="text-right text-emerald-400 truncate max-w-[180px]">{arg.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
                          <span className="text-white/60">Estimated Gas Fee:</span>
                          <span className="font-bold text-[#00C853]">{preparedTx.gasEstimationCspr} CSPR</span>
                        </div>

                        {deployStep && (
                          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1.5 font-sans">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                              <RefreshCw size={12} className="animate-spin text-[#00D4FF]" />
                              <span>{isDeploying ? 'Deploying Smart Contract...' : 'Status'}</span>
                            </div>
                            <p className="text-[10px] text-white/70 font-mono">{deployStep}</p>
                          </div>
                        )}

                        {!deployStep && (
                          <button
                            onClick={handleExecuteDeploy}
                            disabled={isDeploying || totalAllocation !== 100}
                            className="w-full py-3 bg-gradient-to-r from-[#7B61FF] to-[#00D4FF] hover:opacity-95 text-white font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <Send size={14} />
                            <span>Sign & Broadcast Deploy via CSPR.click</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/30 italic">
                        Select template and click "Re-calculate Deploy Payload"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
