import React from 'react';
import { RebalanceRecord } from '../types';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, CheckCircle, ExternalLink } from 'lucide-react';

interface TxRowProps {
  tx: RebalanceRecord;
}

export const TxRow: React.FC<TxRowProps> = ({ tx }) => {
  const { hash, timestamp, type, amount, gain } = tx;

  const getIcon = () => {
    switch (type) {
      case 'Deposit':
        return <ArrowDownLeft className="text-[#00C853]" size={16} />;
      case 'Withdraw':
        return <ArrowUpRight className="text-red-500" size={16} />;
      case 'Rebalance':
        return <RefreshCcw className="text-[#7B61FF]" size={14} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'Deposit': return 'text-[#00C853]';
      case 'Withdraw': return 'text-red-600';
      case 'Rebalance': return 'text-[#7B61FF]';
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-white/40 rounded-2xl transition-all border border-transparent hover:border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/50 border border-white/40 flex items-center justify-center shadow-sm">
          {getIcon()}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${getTypeColor()}`}>
              {type}
            </span>
            {gain && (
              <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] px-2 py-0.5 rounded-full font-mono">
                {gain} Yield
              </span>
            )}
          </div>
          <a
            href={`https://testnet.cspr.live/deploy/${hash.replace('deploy-', '').replace('hash-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-secondary/70 font-mono hover:underline hover:text-[#7B61FF]"
          >
            {hash.replace('deploy-', '').replace('hash-', '').substring(0, 8)}...{hash.replace('deploy-', '').replace('hash-', '').substring(hash.replace('deploy-', '').replace('hash-', '').length - 8)}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div>
          <span className="text-sm font-bold text-[#1A1A2E] block">
            {amount}
          </span>
          <span className="text-[10px] text-secondary font-medium block">
            {timestamp}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 pl-2">
          <CheckCircle size={14} className="text-[#00C853]" />
          <a 
            href={`https://testnet.cspr.live/deploy/${hash.replace('deploy-', '').replace('hash-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary/50 hover:text-[#1A1A2E] transition-all cursor-pointer"
            title="View on Casper Block Explorer"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
