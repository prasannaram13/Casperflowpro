import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowRight, Zap, Ban, Check, HelpCircle } from 'lucide-react';

export const RebalanceProposalModal = () => {
  const {
    rebalanceProposal,
    isApprovalOpen,
    approveRebalance,
    rejectRebalance,
    strategy,
  } = useApp();

  if (!isApprovalOpen || !rebalanceProposal) return null;

  const { oldAlloc, newAlloc, expectedGain, gasCost } = rebalanceProposal;

  return (
    <div className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="backdrop-blur-[60px] bg-[rgba(255,255,255,0.85)] border border-[rgba(255,255,255,0.45)] w-full max-w-lg rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
        {/* Glowing gradient background header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00D4FF] via-[#7B61FF] to-[#FF007A]" />

        {/* Header Icon */}
        <div className="flex items-start gap-4 mb-5 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 border border-[#7B61FF]/30 flex items-center justify-center text-[#7B61FF] shrink-0">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold bg-[#7B61FF] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              {strategy} Mode Alert
            </span>
            <h2 className="text-xl font-display font-bold text-[#1A1A2E] mt-1.5">
              Rebalance Opportunity Detected!
            </h2>
            <p className="text-xs text-secondary/80 font-medium">
              Autonomous analyzer has compiled an optimized portfolio adjustment index.
            </p>
          </div>
        </div>

        {/* Allocations Comparison Grid */}
        <div className="bg-white/50 border border-white/60 rounded-2xl p-4 flex flex-col gap-3.5 mb-5 shadow-sm">
          <div className="grid grid-cols-11 text-[10px] uppercase font-bold text-secondary/70 tracking-wider">
            <div className="col-span-5">Casper DeFi Pool</div>
            <div className="col-span-3 text-center">Current</div>
            <div className="col-span-3 text-right">Proposed</div>
          </div>

          <div className="flex flex-col gap-2.5">
            {newAlloc.map((item, index) => {
              const oldVal = oldAlloc.find((o) => o.poolId === item.poolId)?.allocationPercent || 0;
              const newVal = item.allocationPercent;
              const hasChanged = oldVal !== newVal;

              return (
                <div key={item.poolId} className={`grid grid-cols-11 text-xs items-center ${hasChanged ? 'font-semibold text-[#1A1A2E]' : 'opacity-60 text-secondary'}`}>
                  <div className="col-span-5 truncate">{item.poolName.split('(')[0].trim()}</div>
                  <div className="col-span-3 text-center font-mono">{oldVal}%</div>
                  <div className="col-span-3 text-right font-mono flex items-center justify-end gap-1.5">
                    {hasChanged && <ArrowRight size={10} className="text-[#7B61FF]" />}
                    <span className={hasChanged ? 'text-[#7B61FF]' : ''}>{newVal}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic projections */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#00C853]/10 border border-[#00C853]/20 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-[#00C853] block uppercase tracking-wider">Estimated APY Surge</span>
            <span className="text-2xl font-bold font-display text-[#00C853]">+{expectedGain.toFixed(2)}%</span>
            <span className="text-[10px] text-secondary/80 block mt-0.5">Increases aggregate returns</span>
          </div>

          <div className="bg-[#1A1A2E]/5 border border-[#1A1A2E]/10 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-[#1A1A2E]/70 block uppercase tracking-wider">Gas Fee Cost</span>
            <span className="text-2xl font-bold font-display text-[#1A1A2E]">{gasCost.toFixed(4)} CSPR</span>
            <span className="text-[10px] text-secondary/80 block mt-0.5">Odra contract deployment</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex gap-3">
          <button
            onClick={rejectRebalance}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-white/60 border border-white/50 text-[#1A1A2E]/80 hover:bg-white hover:text-red-600 transition-all cursor-pointer shadow-sm"
          >
            <Ban size={15} />
            <span>Decline</span>
          </button>

          <button
            onClick={approveRebalance}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 text-white transition-all cursor-pointer shadow-md"
          >
            <Check size={15} />
            <span>Approve & Rebalance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
