import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { LineChart, Coins, Settings, HelpCircle, Terminal, Bot, FileCode2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, setLogsModalOpen } = useApp();

  const menuItems = [
    { id: 'pools', icon: Coins, label: 'DeFi Pools' },
    { id: 'stats', icon: LineChart, label: 'Analytics' },
    { id: 'chat', icon: Bot, label: 'AI Agent' },
    { id: 'contract', icon: FileCode2, label: 'Smart Contract' },
  ];

  return (
    <GlassCard className="w-20 py-8 px-2 flex flex-col items-center justify-between h-full shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
      {/* Upper items */}
      <div className="flex flex-col gap-6 w-full items-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A2E] text-white shadow-[0_0_15px_rgba(123,97,255,0.45)] ring-1 ring-[#7B61FF]/30'
                    : 'text-[#1A1A2E]/70 hover:bg-[rgba(255,255,255,0.35)] hover:text-[#1A1A2E]'
                }`}
              >
                <Icon size={20} />
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-16 bg-[#1A1A2E] text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom utilities */}
      <div className="flex flex-col gap-5 items-center w-full">
        {/* Terminal logs toggle button */}
        <div className="relative group">
          <button 
            onClick={() => setLogsModalOpen(true)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#1A1A2E]/70 hover:bg-[rgba(255,255,255,0.35)] hover:text-[#1A1A2E] transition-all cursor-pointer"
            title="System Terminal Logs"
          >
            <Terminal size={20} />
          </button>
          <div className="absolute left-16 bg-[#1A1A2E] text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
            System logs
          </div>
        </div>

        <div className="relative group">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1A1A2E] text-white shadow-[0_0_15px_rgba(123,97,255,0.45)] ring-1 ring-[#7B61FF]/30'
                : 'text-[#1A1A2E]/70 hover:bg-[rgba(255,255,255,0.35)] hover:text-[#1A1A2E]'
            }`}
          >
            <Settings size={20} />
          </button>
          <div className="absolute left-16 bg-[#1A1A2E] text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
            Settings
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
