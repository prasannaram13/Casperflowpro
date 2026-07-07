import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { GlassCard } from './GlassCard';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Bot, 
  Sparkles, 
  Trash2, 
  Zap, 
  Play, 
  Square, 
  RefreshCw, 
  ShieldAlert, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export const AgentTerminal = () => {
  const {
    aiChatMessages,
    sendChatMessage,
    clearChatMessages,
    isAiThinking,
    status,
    strategy,
    setStrategy,
    isDeployed,
    isDeploying,
    deployStep,
    deployAgent,
    stopAgent,
    forceScan,
    tvl,
    dailyChange,
    gasSpent,
    isConnected,
    connect
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [depositAmount, setDepositAmount] = useState('1000');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat stream
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages, isAiThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await sendChatMessage(textToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendChatMessage(suggestion);
  };

  const sampleSuggestions = [
    "Identify the highest yield pools right now",
    "Compare Balanced vs Aggressive strategies",
    "Explain Casper Network staking mechanism",
    "How does the Odra smart contract optimize gas?"
  ];

  const getStatusColor = () => {
    switch (status) {
      case 'SCANNING': return 'bg-[#00D4FF] text-[#1A1A2E]';
      case 'ANALYZING': return 'bg-[#7B61FF] text-white';
      case 'DECIDING': return 'bg-[#FF007A] text-white';
      case 'REBALANCING': return 'bg-[#FF9100] text-[#1A1A2E] animate-pulse';
      case 'COMPLETE': return 'bg-[#00C853] text-[#1A1A2E]';
      default: return 'bg-[#1A1A2E] text-white/80 border border-white/20';
    }
  };

  return (
    <div id="agent-terminal-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
      {/* Left Chat Console: Col span 8 */}
      <div className="lg:col-span-8 flex flex-col h-[650px]">
        <GlassCard className="flex-1 p-6 flex flex-col justify-between overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          
          {/* Console Header */}
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-sans font-medium text-lg tracking-tight text-[#1A1A2E]">
                  CasperFlow AI Agent Terminal
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                    DeepSeek Autonomous Model Online
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={clearChatMessages}
              className="p-2 text-secondary hover:text-[#FF007A] hover:bg-[#FF007A]/10 rounded-xl transition-all cursor-pointer"
              title="Clear Terminal Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-sm mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {aiChatMessages.map((msg, i) => {
                const isModel = msg.role === 'model';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 items-start ${isModel ? 'justify-start' : 'justify-end'}`}
                  >
                    {isModel && (
                      <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7B61FF] to-[#00D4FF] text-white shrink-0 mt-1 shadow-md">
                        <Bot size={14} />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 relative shadow-sm ${
                      isModel 
                        ? 'bg-[#1A1A2E] text-white border border-white/5 font-mono' 
                        : 'bg-[#7B61FF] text-white rounded-tr-none'
                    }`}>
                      <div className="text-xs text-white/50 mb-1 flex justify-between items-center gap-6 font-mono">
                        <span>{isModel ? 'CASPERFLOW_AGENT' : 'USER'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {!isModel && (
                      <div className="p-2 rounded-xl bg-[#7B61FF] text-white shrink-0 mt-1 shadow-md">
                        <TerminalIcon size={14} />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isAiThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7B61FF] to-[#00D4FF] text-white shrink-0 mt-1 shadow-md">
                    <Bot size={14} className="animate-spin" />
                  </div>
                  <div className="bg-[#1A1A2E] text-white/80 rounded-2xl px-4 py-3 border border-white/5">
                    <div className="text-xs text-white/40 mb-1.5 font-mono">
                      <span>CASPERFLOW_AGENT_THINKING_PROMPT...</span>
                    </div>
                    <div className="flex gap-1 items-center py-1 px-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF007A] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions Bar */}
          {aiChatMessages.length <= 1 && !isAiThinking && (
            <div className="mb-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-secondary block mb-2 uppercase">
                Quick Command Queries:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left text-xs bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(26,26,46,0.5)] text-[#1A1A2E] hover:text-[#7B61FF] hover:bg-[#7B61FF]/5 p-2.5 rounded-xl border border-black/5 dark:border-white/5 transition-all text-ellipsis overflow-hidden whitespace-nowrap font-sans font-medium cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSend} className="flex gap-2 relative mt-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask agent to analyze pools, switch strategy, or explain yield calculations..."
              disabled={isAiThinking}
              className="flex-1 bg-[#1A1A2E] text-white border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#7B61FF] placeholder-white/30 font-mono"
            />
            <button
              type="submit"
              disabled={isAiThinking || !inputText.trim()}
              className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputText.trim() && !isAiThinking
                  ? 'bg-gradient-to-tr from-[#7B61FF] to-[#00D4FF] text-white shadow-lg shadow-[#7B61FF]/35 hover:scale-105'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </form>

        </GlassCard>
      </div>

      {/* Right Control Board: Col span 4 */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Agent Operational State */}
        <GlassCard className="p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/5 pb-3">
            <span className="font-sans font-medium text-sm text-[#1A1A2E]">Agent Engine Control</span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-widest font-extrabold ${
              isDeployed ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-[#FF007A]/15 text-[#FF007A]'
            }`}>
              {isDeployed ? 'Active' : 'Offline'}
            </span>
          </div>

          {/* Dynamic state engine display */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-secondary uppercase">
              Current Agent Activity:
            </span>
            <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.3)] dark:bg-[#1A1A2E]/50 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="relative">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7B61FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#7B61FF]"></span>
                </span>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-mono text-xs text-secondary font-bold uppercase">System State</span>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider ${getStatusColor()}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(255,255,255,0.3)] dark:bg-[#1A1A2E]/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-secondary block uppercase">Managed TVL</span>
              <span className="font-mono text-base font-extrabold text-[#1A1A2E] block mt-1">{tvl} CSPR</span>
            </div>
            <div className="bg-[rgba(255,255,255,0.3)] dark:bg-[#1A1A2E]/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-secondary block uppercase">Daily Change</span>
              <span className="font-mono text-base font-extrabold text-[#00C853] block mt-1">+{dailyChange}%</span>
            </div>
            <div className="col-span-2 bg-[rgba(255,255,255,0.3)] dark:bg-[#1A1A2E]/30 p-3 rounded-2xl border border-black/5 dark:border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-secondary block uppercase">Gas Optimizations</span>
                <span className="font-mono text-xs font-bold text-[#1A1A2E] mt-0.5 block">{gasSpent.toFixed(4)} CSPR Saved</span>
              </div>
              <Zap size={18} className="text-[#00D4FF]" />
            </div>
          </div>

          {/* Deploy / Control actions */}
           {isDeploying ? (
            <div className="space-y-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                <RefreshCw size={14} className="animate-spin text-[#7B61FF]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1A2E] dark:text-white">
                  Casper Testnet Deploying...
                </span>
              </div>
              
              {/* Steps progress */}
              <div className="space-y-2.5 text-xs">
                {/* COMPILE */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      deployStep === 'COMPILE' ? 'bg-[#7B61FF] text-white animate-pulse' :
                      (deployStep !== 'COMPILE' ? 'bg-emerald-500 text-white' : 'bg-black/10 dark:bg-white/10 text-secondary')
                    }`}>
                      {deployStep !== 'COMPILE' ? '✓' : '1'}
                    </div>
                    <span className={deployStep === 'COMPILE' ? 'font-semibold text-[#1A1A2E] dark:text-white' : 'text-secondary'}>
                      Compile Rust smart contract to Wasm
                    </span>
                  </div>
                  {deployStep === 'COMPILE' && <span className="text-[10px] font-mono text-[#7B61FF]">active</span>}
                </div>

                {/* SIGN */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      deployStep === 'SIGN' ? 'bg-[#7B61FF] text-white animate-pulse' :
                      (deployStep !== 'COMPILE' && deployStep !== 'SIGN' ? 'bg-emerald-500 text-white' : 'bg-black/10 dark:bg-white/10 text-secondary')
                    }`}>
                      {deployStep !== 'COMPILE' && deployStep !== 'SIGN' ? '✓' : '2'}
                    </div>
                    <span className={deployStep === 'SIGN' ? 'font-semibold text-[#1A1A2E] dark:text-white' : 'text-secondary'}>
                      Casper Wallet signature handshake
                    </span>
                  </div>
                  {deployStep === 'SIGN' && <span className="text-[10px] font-mono text-[#7B61FF]">awaiting signature...</span>}
                </div>

                {/* BROADCAST */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      deployStep === 'BROADCAST' ? 'bg-[#7B61FF] text-white animate-pulse' :
                      (deployStep === 'CONFIRM' || deployStep === 'SUCCESS' ? 'bg-emerald-500 text-white' : 'bg-black/10 dark:bg-white/10 text-secondary')
                    }`}>
                      {deployStep === 'CONFIRM' || deployStep === 'SUCCESS' ? '✓' : '3'}
                    </div>
                    <span className={deployStep === 'BROADCAST' ? 'font-semibold text-[#1A1A2E] dark:text-white' : 'text-secondary'}>
                      Broadcast deploy payload to node
                    </span>
                  </div>
                  {deployStep === 'BROADCAST' && <span className="text-[10px] font-mono text-emerald-500">sending...</span>}
                </div>

                {/* CONFIRM */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      deployStep === 'CONFIRM' ? 'bg-[#7B61FF] text-white animate-pulse' :
                      (deployStep === 'SUCCESS' ? 'bg-emerald-500 text-white' : 'bg-black/10 dark:bg-white/10 text-secondary')
                    }`}>
                      {deployStep === 'SUCCESS' ? '✓' : '4'}
                    </div>
                    <span className={deployStep === 'CONFIRM' ? 'font-semibold text-[#1A1A2E] dark:text-white' : 'text-secondary'}>
                      Await Casper Testnet confirmation
                    </span>
                  </div>
                  {deployStep === 'CONFIRM' && <span className="text-[10px] font-mono text-[#7B61FF] animate-bounce">pending block...</span>}
                </div>
              </div>
            </div>
          ) : !isDeployed ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold tracking-widest text-secondary uppercase">
                  Deployment Budget (CSPR):
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Budget CSPR"
                  className="bg-[rgba(255,255,255,0.5)] dark:bg-[#1A1A2E]/50 text-[#1A1A2E] dark:text-white border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7B61FF]"
                />
              </div>
              <button
                onClick={() => {
                  if (!isConnected) {
                    connect();
                  } else {
                    deployAgent(parseFloat(depositAmount) || 1000);
                  }
                }}
                className="w-full bg-[#7B61FF] hover:bg-[#684be3] text-white py-3 rounded-2xl font-sans font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7B61FF]/30 transition-all cursor-pointer"
              >
                <Play size={14} />
                <span>{isConnected ? 'Deploy Yield Agent' : 'Connect Wallet to Deploy'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={forceScan}
                className="bg-[#1A1A2E] hover:bg-[#2e2e4e] text-white py-3 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              >
                <RefreshCw size={12} className={status === 'SCANNING' ? 'animate-spin' : ''} />
                <span>Force Scan</span>
              </button>
              <button
                onClick={stopAgent}
                className="bg-[#FF007A]/10 hover:bg-[#FF007A]/20 text-[#FF007A] py-3 rounded-2xl font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Square size={11} fill="currentColor" />
                <span>Stop Agent</span>
              </button>
            </div>
          )}
        </GlassCard>

        {/* Strategy Preferences */}
        <GlassCard className="p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <span className="font-sans font-medium text-sm text-[#1A1A2E] border-b border-black/10 dark:border-white/5 pb-2 block">
            Agent Optimization Strategy
          </span>

          <div className="flex flex-col gap-2">
            {[
              { mode: 'CONSERVATIVE' as const, label: 'Conservative Strategy', desc: 'Focus on Low Risk Lending & Stablecoin vaults' },
              { mode: 'BALANCED' as const, label: 'Balanced Strategy', desc: 'Symmetrical RWA yield farming & active AMM exposure' },
              { mode: 'AGGRESSIVE' as const, label: 'Aggressive Strategy', desc: 'High risk yield vaults, Option pools & volatility curves' }
            ].map((opt) => {
              const isSel = strategy === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => setStrategy(opt.mode)}
                  className={`text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSel 
                      ? 'bg-gradient-to-tr from-[#7B61FF]/10 to-[#00D4FF]/10 border-[#7B61FF] text-[#1A1A2E]'
                      : 'bg-white/10 border-black/5 dark:border-white/5 text-[#1A1A2E]/80 hover:bg-[#7B61FF]/5'
                  }`}
                >
                  <div className={`mt-1.5 w-3 h-3 rounded-full flex items-center justify-center shrink-0 border ${
                    isSel ? 'border-[#7B61FF] bg-[#7B61FF]' : 'border-secondary'
                  }`}>
                    {isSel && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-xs block">{opt.label}</span>
                    <span className="text-[10px] text-secondary mt-0.5 block">{opt.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
