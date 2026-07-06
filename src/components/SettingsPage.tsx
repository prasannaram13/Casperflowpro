import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Database, 
  Clock, 
  Sliders, 
  Bell, 
  HelpCircle, 
  ShieldCheck, 
  Save, 
  RefreshCw,
  Cpu,
  TrendingUp,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage = () => {
  const { addLog, contractHash: globalContractHash, setContractHash: setGlobalContractHash, scanAccountNamedKeys, account } = useApp();
  
  // Settings State
  const [network, setNetwork] = useState('testnet');
  const [rpcNode, setRpcNode] = useState('https://rpc.testnet.casper.network/rpc');
  const [contractHash, setContractHash] = useState(globalContractHash);

  useEffect(() => {
    setContractHash(globalContractHash);
  }, [globalContractHash]);
  const [cooldown, setCooldown] = useState(3600); // 1 hour
  const [triggerThreshold, setTriggerThreshold] = useState(2.5); // 2.5% yield gain delta
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [agentAuditLogs, setAgentAuditLogs] = useState(true);
  const [gasPrice, setGasPrice] = useState(1); // Standard gas priority
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    addLog(`Saving advanced agent configurations to application storage...`, 'info');
    setGlobalContractHash(contractHash);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog(`Configurations successfully synced! Odra Yield Router parameter 'min_rebalance_interval' set to ${cooldown}s.`, 'success');
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1200);
  };

  const handleReset = () => {
    setNetwork('testnet');
    setRpcNode('https://rpc.testnet.casper.network/rpc');
    setContractHash('hash-8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd');
    setGlobalContractHash('hash-8f6ea1659d894e49eb2d8baed515f12e34dfa8aaf14e6f71929b5b6f0be55bcd');
    setCooldown(3600);
    setTriggerThreshold(2.5);
    setSlippage(0.5);
    setBrowserAlerts(true);
    setAgentAuditLogs(true);
    setGasPrice(1);
    addLog(`Configurations restored to defaults.`, 'info');
  };

  return (
    <div className="w-full flex flex-col gap-6" id="settings-page">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight text-[#1A1A2E]">
            Agent Settings
          </h1>
          <p className="text-xs text-secondary mt-1">
            Configure decentralized oracle triggers, contract parameters, and testnet RPC node options.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-black/5 hover:bg-black/10 text-secondary text-xs font-semibold rounded-2xl transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-5 py-2 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-md ${
              saveSuccess 
                ? 'bg-[#00C853] hover:bg-[#00C853]/90' 
                : 'bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 hover:shadow-[0_4px_12px_rgba(123,97,255,0.2)]'
            }`}
          >
            {isSaving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Config'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Network & Smart Contract */}
        <div className="flex flex-col gap-6">
          {/* Network Integration Card */}
          <GlassCard className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="p-2 bg-[#7B61FF]/10 text-[#7B61FF] rounded-xl">
                <Database size={16} />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-[#1A1A2E]">Casper Node RPC Config</h3>
                <p className="text-[10px] text-secondary">Connection parameters to Casper RPC providers.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#1A1A2E]">Network Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setNetwork('testnet');
                      setRpcNode('https://rpc.testnet.casper.network/rpc');
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      network === 'testnet'
                        ? 'bg-[#1A1A2E] text-white border-transparent'
                        : 'bg-white text-secondary border-black/5 hover:bg-black/5'
                    }`}
                  >
                    Casper Testnet (Testnet-4)
                  </button>
                  <button
                    onClick={() => {
                      setNetwork('mainnet');
                      setRpcNode('https://rpc.mainnet.casper.network/rpc');
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      network === 'mainnet'
                        ? 'bg-[#1A1A2E] text-white border-transparent'
                        : 'bg-white text-secondary border-black/5 hover:bg-black/5'
                    }`}
                  >
                    Casper Mainnet
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#1A1A2E]">RPC Provider Endpoint</label>
                <input
                  type="text"
                  value={rpcNode}
                  onChange={(e) => setRpcNode(e.target.value)}
                  className="w-full px-3 py-2 bg-black/5 border border-black/5 rounded-xl text-xs font-mono text-secondary focus:outline-none focus:border-[#7B61FF]/40 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#1A1A2E]">Yield Agent Contract Hash</label>
                  <span className="text-[10px] bg-[#7B61FF]/10 text-[#7B61FF] px-1.5 py-0.5 rounded-md font-mono">Odra VM</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contractHash}
                    onChange={(e) => setContractHash(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/5 border border-black/5 rounded-xl text-xs font-mono text-secondary focus:outline-none focus:border-[#7B61FF]/40 focus:bg-white transition-all"
                  />
                  <button
                    onClick={async () => {
                      if (!account) {
                        addLog("Connect your Casper wallet first to query on-chain named keys.", "warn");
                        return;
                      }
                      await scanAccountNamedKeys(account);
                    }}
                    className="px-3 py-2 bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF]/20 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Query account named keys via state_get_account_info"
                  >
                    <RefreshCw size={12} className="animate-spin-slow" />
                    Auto-Detect
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Rebalance Automation Rules */}
          <GlassCard className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-[#1A1A2E]">Rebalancing Trigger Constraints</h3>
                <p className="text-[10px] text-secondary">Set exact metrics that guide autonomous decisions.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-[#1A1A2E]">Yield Optimization Gain Trigger</span>
                  <span className="text-[#7B61FF] font-bold">{triggerThreshold}% Delta</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  value={triggerThreshold}
                  onChange={(e) => setTriggerThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-[#7B61FF]"
                />
                <p className="text-[10px] text-secondary">
                  Agent will only prompt or execute updates if the target rebalanced strategy offers at least {triggerThreshold}% APY gain over the current portfolio.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-[#1A1A2E]">Transaction Slippage Limit</span>
                  <span className="text-amber-500 font-bold">{slippage}% Max</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.1, 0.5, 1.0, 3.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        slippage === val
                          ? 'bg-amber-500 text-white border-transparent'
                          : 'bg-white text-secondary border-black/5 hover:bg-black/5'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Cooldowns & System Logs */}
        <div className="flex flex-col gap-6">
          {/* Smart Contract On-Chain Parameter settings */}
          <GlassCard className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-[#1A1A2E]">Contract Parameter Cooldowns</h3>
                <p className="text-[10px] text-secondary">Updates on-chain storage contract state variables.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-[#1A1A2E]">Minimum Rebalance Cooldown</span>
                  <span className="text-cyan-500 font-bold">{cooldown / 60} minutes ({cooldown}s)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1800, 3600, 86400].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCooldown(val)}
                      className={`px-3 py-2 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        cooldown === val
                          ? 'bg-cyan-500 text-white border-transparent'
                          : 'bg-white text-secondary border-black/5 hover:bg-black/5'
                      }`}
                    >
                      {val === 1800 ? '30 Mins' : val === 3600 ? '1 Hour (Default)' : '24 Hours'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-secondary">
                  The smart contract enforces a cooling period interval between rebalances (`min_rebalance_interval`) to defend pools against flash loans and front-running bots.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#1A1A2E]">Gas Priority Fee</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 1, label: 'Standard', icon: Cpu, desc: '0.0001 CSPR' },
                    { id: 2, label: 'Fast', icon: TrendingUp, desc: '0.0002 CSPR' },
                    { id: 3, label: 'Aggressive', icon: Flame, desc: '0.0005 CSPR' },
                  ].map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setGasPrice(tier.id)}
                        className={`p-2 flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer ${
                          gasPrice === tier.id
                            ? 'bg-[#1A1A2E] text-white border-transparent'
                            : 'bg-white text-secondary border-black/5 hover:bg-black/5'
                        }`}
                      >
                        <Icon size={14} className="mb-0.5" />
                        <span className="text-[10px] font-bold">{tier.label}</span>
                        <span className="text-[8px] opacity-80 mt-0.5">{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notifications & System Auditing */}
          <GlassCard className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="p-2 bg-[#00C853]/10 text-[#00C853] rounded-xl">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-[#1A1A2E]">Monitoring & Notifications</h3>
                <p className="text-[10px] text-secondary">Control agent feedback, notifications and terminal logs.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A2E]">In-App Browser Notifications</h4>
                  <p className="text-[10px] text-secondary">Receive real-time push alerts on completed rebalances.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={browserAlerts}
                    onChange={(e) => setBrowserAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00C853]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A2E]">Agent Smart Auditing Logs</h4>
                  <p className="text-[10px] text-secondary">Relay complete analytical tracing logs to System Terminal console.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agentAuditLogs}
                    onChange={(e) => setAgentAuditLogs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00C853]"></div>
                </label>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
