import React, { useState } from 'react';
import { ConnectButton } from './ConnectButton';
import { Bell, Sparkles, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  onSearchChange: (val: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSearchChange,
}) => {
  const { status, isDeployed, balance, isConnected } = useApp();

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 backdrop-blur-md bg-[rgba(255,255,255,0.18)] rounded-[24px] border border-[rgba(255,255,255,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-[#7B61FF] rounded-xl blur-md opacity-40 animate-pulse" />
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B61FF] flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-[#1A1A2E] tracking-tight flex items-center gap-2">
            CasperFlow
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-mono text-secondary">
            Autonomous DeFi Agent
          </p>
        </div>
      </div>

      <div className="flex-grow hidden md:block" />

      {/* Interactive Controls & Wallet */}
      <div className="flex items-center gap-3">
        {/* Balance indicator */}
        {isConnected && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] text-xs font-mono text-[#1A1A2E] shadow-sm">
            <Database size={13} className="text-[#7B61FF]" />
            <span className="font-bold">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-secondary opacity-75">CSPR</span>
          </div>
        )}

        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${isDeployed ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="opacity-80">Agent: {status}</span>
        </div>

        {/* Notification pill */}
        <button className="relative p-2.5 rounded-full bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.25)] transition-all cursor-pointer">
          <Bell size={16} className="text-[#1A1A2E]" />
          {isDeployed && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00D4FF] animate-ping" />
          )}
        </button>

        {/* Connect Button */}
        <ConnectButton />
      </div>
    </header>
  );
};
