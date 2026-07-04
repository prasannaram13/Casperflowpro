import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { AgentCore } from './AgentCore';
import { useApp } from '../context/AppContext';
import { Play, Pause, RefreshCw, Terminal, TrendingUp, Cpu, Coins, Flame } from 'lucide-react';

export const AgentHero = () => {
  const {
    status,
    strategy,
    setStrategy,
    isDeployed,
    tvl,
    dailyChange,
    gasSpent,
    deployAgent,
    stopAgent,
    forceScan,
    setLogsModalOpen,
  } = useApp();

  const [depositInput, setDepositInput] = useState<string>('2500');

  const handleDeployToggle = () => {
    if (isDeployed) {
      stopAgent();
    } else {
      const amt = parseFloat(depositInput);
      if (isNaN(amt) || amt <= 0) {
        alert("Please enter a valid positive CSPR amount.");
        return;
      }
      deployAgent(amt);
    }
  };

  const getStrategyDesc = () => {
    switch (strategy) {
      case 'CONSERVATIVE': return 'Rebalance only if APY gains exceed +5%. Prioritizes lending pools.';
      case 'BALANCED': return 'Rebalance when APY increases by +3%. Splices lending with blue-chip AMMs.';
      case 'AGGRESSIVE': return 'Rebalance on +1% opportunity. Yield farming, options and high risk vaults.';
    }
  };

  return (
    <GlassCard className="p-6 flex flex-col lg:flex-row items-center gap-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#7B61FF]/10 to-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Body */}
      <div className="flex-1 flex flex-col gap-4 w-full">
        {/* Status indicator row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-semibold text-[#1A1A2E] shadow-sm">
            <Cpu size={14} className="text-[#7B61FF]" />
            Agent Engine: {isDeployed ? 'ACTIVE' : 'IDLE'}
          </span>
          <span className="text-xs text-[#1A1A2E]/70 font-mono">
            {status === 'IDLE' ? 'Standing by • Auto-run every 60s' : 'Automated scan in progress...'}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-[#1A1A2E] leading-tight">
            Autonomous Yield Optimizer
          </h2>
          <p className="text-sm text-secondary font-medium mt-1">
            Rebalancing your portfolio across Casper Network's most lucrative, verified smart contracts.
          </p>
        </div>

        {/* Strategy Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
            <Flame size={12} className="text-[#FF007A]" /> Select Risk Matrix Strategy
          </label>
          <div className="flex gap-2">
            {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStrategy(mode)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  strategy === mode
                    ? 'bg-[#1A1A2E] text-white shadow-md scale-102 border border-transparent'
                    : 'bg-white/30 text-[#1A1A2E] border border-white/20 hover:bg-white/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="text-xs italic text-[#1A1A2E]/70">
            {getStrategyDesc()}
          </span>
        </div>

        {/* Action Controls & Input */}
        <div className="flex flex-wrap items-center gap-3 mt-3 border-t border-white/20 pt-4">
          {!isDeployed ? (
            <div className="flex items-center gap-2 bg-white/30 border border-white/40 p-1.5 rounded-full backdrop-blur-md max-w-sm w-full">
              <div className="flex items-center gap-1.5 pl-3 text-xs font-bold text-secondary">
                <Coins size={14} className="text-[#1A1A2E]" /> CSPR:
              </div>
              <input
                type="number"
                value={depositInput}
                onChange={(e) => setDepositInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-sans font-bold text-sm text-[#1A1A2E] px-2 w-20"
                placeholder="2500"
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              onClick={handleDeployToggle}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all cursor-pointer active:scale-98 ${
                isDeployed
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gradient-to-r from-[#7B61FF] to-[#00D4FF] text-white hover:opacity-90'
              }`}
            >
              {isDeployed ? <Pause size={14} /> : <Play size={14} />}
              <span>{isDeployed ? 'Emergency Pause' : 'Deploy Yield Agent'}</span>
            </button>

            {isDeployed && (
              <button
                onClick={forceScan}
                disabled={status !== 'IDLE'}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-white/40 border border-white/30 text-[#1A1A2E] hover:bg-white/60 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                title="Force APY Scanning cycle"
              >
                <RefreshCw size={14} className={status !== 'IDLE' ? 'animate-spin' : ''} />
                <span>Force Scan</span>
              </button>
            )}

            <button
              onClick={() => setLogsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-white/40 border border-white/30 text-[#1A1A2E] hover:bg-white/60 active:scale-98 transition-all cursor-pointer"
            >
              <Terminal size={14} />
              <span>Logs Console</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4 mt-1 bg-white/10 rounded-2xl p-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#1A1A2E]/60 block">Allocated TVL</span>
            <span className="text-lg font-bold font-display text-[#1A1A2E]">
              {isDeployed ? `${tvl.toLocaleString()} CSPR` : '0.00 CSPR'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#1A1A2E]/60 block flex items-center gap-1">
              <TrendingUp size={10} className="text-[#00C853]" /> Est. APY Yield
            </span>
            <span className="text-lg font-bold font-display text-[#00C853]">
              +{dailyChange.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#1A1A2E]/60 block">Gas Consumption</span>
            <span className="text-lg font-bold font-display text-[#7B61FF]">
              {gasSpent.toFixed(4)} CSPR
            </span>
          </div>
        </div>
      </div>

      {/* Orbital core graphics */}
      <div className="flex justify-center shrink-0 w-48 h-48 lg:border-l lg:border-white/20 lg:pl-6">
        <AgentCore />
      </div>
    </GlassCard>
  );
};
