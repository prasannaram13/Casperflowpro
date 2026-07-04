import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Terminal,
  Cpu
} from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none"
      id="toast-notifications-container"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isPayment = toast.type === 'payment';
          
          // Style & Icon determinations
          let accentColor = 'border-blue-500/30 shadow-blue-500/5';
          let icon = <Info size={16} className="text-[#00D4FF]" />;
          
          if (toast.type === 'success') {
            accentColor = 'border-emerald-500/30 shadow-emerald-500/5';
            icon = <CheckCircle size={16} className="text-[#00C853]" />;
          } else if (toast.type === 'warn') {
            accentColor = 'border-amber-500/30 shadow-amber-500/5';
            icon = <AlertCircle size={16} className="text-[#FF9100]" />;
          } else if (isPayment) {
            accentColor = 'border-[#00C853]/40 shadow-[#00C853]/10';
            icon = <Coins size={16} className="text-[#00C853]" />;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto relative overflow-hidden w-full bg-[#131325]/95 backdrop-blur-md border ${accentColor} rounded-2xl shadow-2xl p-4 flex flex-col gap-2.5 text-white/95`}
            >
              {/* Outer top border lighting effect */}
              <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${isPayment ? 'from-emerald-500/50 via-emerald-400/20 to-transparent' : 'from-blue-500/50 via-blue-400/10 to-transparent'}`} />

              {/* Main Content Layout */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5 items-start">
                  {/* Glowing Icon Wrapper */}
                  <div className={`p-2 rounded-xl shrink-0 ${isPayment ? 'bg-emerald-500/10' : 'bg-white/5'} flex items-center justify-center`}>
                    {icon}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold font-sans tracking-wide text-white flex items-center gap-1.5">
                      {toast.title}
                      {isPayment && (
                        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                          x402 Proof
                        </span>
                      )}
                    </span>
                    <p className="text-[11px] text-white/70 font-sans mt-0.5 leading-relaxed">
                      {toast.message}
                    </p>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* x402 Micropayment specific structural breakdown block */}
              {isPayment && (
                <div className="bg-black/25 border border-white/5 rounded-xl p-2.5 space-y-1.5 font-mono text-[10px] text-white/85">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 flex items-center gap-1">
                      <Terminal size={10} /> Cost CSPR:
                    </span>
                    <span className="font-bold text-emerald-400">-{toast.cost || '0.002 CSPR'}</span>
                  </div>
                  {toast.purpose && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-white/40 shrink-0">Purpose:</span>
                      <span className="text-right text-white/90 font-sans text-[9px] leading-tight">
                        {toast.purpose}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[9px] text-white/30 border-t border-white/5 pt-1.5 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Cpu size={8} /> Protocol Standard
                    </span>
                    <span>{toast.timestamp || new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              )}

              {/* Animated Timeline / Progress Bar at bottom */}
              <motion.div 
                className={`absolute bottom-0 left-0 right-0 h-1 ${isPayment ? 'bg-emerald-500/30' : 'bg-blue-500/30'}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
