import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgentCore = () => {
  const { status } = useApp();

  // Color mappings depending on the agent status
  const getStatusColor = () => {
    switch (status) {
      case 'SCANNING': return 'from-[#00D4FF] to-[#7B61FF]';
      case 'ANALYZING': return 'from-[#7B61FF] to-[#FF007A]';
      case 'DECIDING': return 'from-[#FF007A] to-[#FF9100]';
      case 'REBALANCING': return 'from-[#FF9100] to-[#00D4FF] animate-spin';
      case 'COMPLETE': return 'from-[#00C853] to-[#00D4FF]';
      default: return 'from-[#7B61FF] to-[#00D4FF]';
    }
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center select-none">
      {/* Glow aura */}
      <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${getStatusColor()} opacity-25 blur-2xl transition-all duration-1000`} />

      {/* Outer Orbit (Rotate 20s) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-44 h-44 border border-white/20 rounded-full flex items-center justify-center"
      >
        {/* Orbital particles (dots) on circular path */}
        <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]" />
        <div className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-[#FF007A] shadow-[0_0_10px_#FF007A]" />
        <div className="absolute right-12 top-10 w-1.5 h-1.5 rounded-full bg-white/60" />
      </motion.div>

      {/* Middle Orbit (Rotate 8s) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-32 h-32 border border-white/30 rounded-full flex items-center justify-center"
      >
        <div className="absolute left-0 w-2 h-2 rounded-full bg-[#7B61FF] shadow-[0_0_8px_#7B61FF]" />
        <div className="absolute right-0 w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]" />
      </motion.div>

      {/* Inner Core (Pulse 2s) */}
      <motion.div
        animate={{
          scale: status === 'REBALANCING' ? [1, 1.1, 0.9, 1.1, 1] : [1, 1.12, 1],
          boxShadow: status === 'SCANNING' 
            ? '0 0 30px rgba(0,212,255,0.6)' 
            : '0 0 24px rgba(123,97,255,0.4)'
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-tr ${getStatusColor()} flex items-center justify-center p-[2px] transition-all duration-700 shadow-xl`}
      >
        <div className="w-full h-full rounded-full bg-[#1A1A2E]/90 flex flex-col items-center justify-center text-white relative overflow-hidden">
          {/* Internal core visual effects */}
          {status === 'SCANNING' && (
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-full h-0.5 bg-[#00D4FF]/50" 
            />
          )}
          {status === 'REBALANCING' ? (
            <Activity size={24} className="text-[#FF9100] animate-pulse" />
          ) : (
            <Sparkles size={22} className="text-[#00D4FF]" />
          )}
          <span className="text-[9px] font-mono tracking-widest text-center uppercase opacity-80 mt-1">
            {status}
          </span>
        </div>
      </motion.div>

      {/* Outer floating orbiting micro-particles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full"
      >
        <div className="absolute top-4 left-10 w-1 h-1 rounded-full bg-[#00D4FF]/40" />
        <div className="absolute bottom-6 right-12 w-1.5 h-1.5 rounded-full bg-[#7B61FF]/40" />
      </motion.div>
    </div>
  );
};
