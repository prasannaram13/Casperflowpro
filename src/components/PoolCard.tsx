import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Pool } from '../types';
import { ArrowUp, ArrowDown, Activity, Sparkles, Plus, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PoolCardProps {
  pool: Pool;
}

export const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  const { id, name, type, apy, risk, tvl, gradient, trend } = pool;
  const { isDeployed, isConnected, connect, deployAgent } = useApp();

  const handleInvestClick = () => {
    if (!isConnected) {
      connect();
      return;
    }
    // Simulate manual invest trigger
    const inputAmount = prompt(`Enter CSPR amount to invest into ${name} through the Yield Agent:`, '1000');
    if (inputAmount) {
      const amt = parseFloat(inputAmount);
      if (!isNaN(amt) && amt > 0) {
        deployAgent(amt);
      } else {
        alert('Invalid CSPR amount.');
      }
    }
  };

  const getRiskColor = (r: Pool['risk']) => {
    switch (r) {
      case 'Low': return 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20';
      case 'Medium': return 'text-[#FF9100] bg-[#FF9100]/10 border-[#FF9100]/20';
      case 'High': return 'text-[#FF007A] bg-[#FF007A]/10 border-[#FF007A]/20';
    }
  };

  return (
    <GlassCard className="group relative overflow-hidden p-5 flex flex-col justify-between h-56 border-white/35 hover:translate-y-[-4px] active:scale-98 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all cursor-pointer">
      {/* Decorative backing blur matching the pool's custom color gradient */}
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-tr ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
            {type} Pool
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRiskColor(risk)}`}>
            {risk} Risk
          </span>
        </div>

        <h3 className="text-base font-display font-bold text-[#1A1A2E] leading-tight group-hover:text-[#7B61FF] transition-colors">
          {name}
        </h3>
        
        {/* TVL */}
        <p className="text-[11px] text-secondary font-medium mt-0.5">
          TVL: ${(tvl / 1e6).toFixed(1)}M USD
        </p>
      </div>

      <div className="mt-4">
        {/* Yield Output */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display font-bold text-[#1A1A2E] tracking-tight">
            {apy}%
          </span>
          <span className="text-xs font-semibold text-[#1A1A2E]/60 uppercase tracking-widest">
            APY
          </span>
          
          {/* APY Trend indicator */}
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trend === 'up' ? 'text-[#00C853]' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' && <ArrowUp size={12} />}
            {trend === 'down' && <ArrowDown size={12} />}
            {trend === 'stable' && <span className="text-sm">~</span>}
          </span>
        </div>

        {/* Invest Action pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleInvestClick();
          }}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-[#1A1A2E] hover:bg-[#1A1A2E]/85 shadow-md active:scale-97 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>{isConnected ? 'Invest in Pool' : 'Connect to Invest'}</span>
        </button>
      </div>
    </GlassCard>
  );
};
