import React from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export const LogsConsoleModal = () => {
  const { logs, logsModalOpen, setLogsModalOpen, clearLogs } = useApp();

  if (!logsModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1A2E]/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="backdrop-blur-[60px] bg-[#1A1A2E]/95 border border-white/10 w-full max-w-2xl rounded-2xl p-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-[#00D4FF]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white font-mono">
              CasperFlow Agent Console
            </h2>
          </div>
          <button 
            onClick={() => setLogsModalOpen(false)}
            className="text-white/60 hover:text-white transition-all cursor-pointer p-1 rounded-lg hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Console Box */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 h-72 overflow-y-auto font-mono text-xs flex flex-col gap-2.5 scrollbar-thin text-white/95">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[#00D4FF]/70 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={
                log.type === 'success' ? 'text-[#00C853]' :
                log.type === 'warn' ? 'text-yellow-400' :
                log.type === 'error' ? 'text-red-400' :
                'text-white/80'
              }>
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-white/40">
              No system signals in buffer
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <ShieldCheck size={12} className="text-[#00C853]" />
            <span>Connection: Casper Testnet Gateway</span>
          </div>

          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear Buffer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
