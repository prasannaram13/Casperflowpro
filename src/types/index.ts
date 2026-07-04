export type AgentStatus = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'DECIDING' | 'REBALANCING' | 'COMPLETE';
export type StrategyMode = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export interface Pool {
  id: string;
  name: string;
  type: 'Lending' | 'AMM' | 'RWA' | 'Options' | 'Stablecoin';
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  tvl: number;
  gradient: string;
  trend: 'up' | 'down' | 'stable';
  isPaused?: boolean;
  isFull?: boolean;
  userAllocation?: number; // USD amount invested
  isAgentManaged?: boolean;
  agentAllocationPercent?: number; // Agent target allocation percent
  createdDaysAgo?: number; // for sorting
}

export interface StrategyAllocation {
  poolId: string;
  poolName: string;
  allocationPercent: number;
  apy: number;
}

export interface RebalanceRecord {
  id: string;
  hash: string;
  timestamp: string;
  type: 'Rebalance' | 'Deposit' | 'Withdraw' | 'Deploy';
  amount: string;
  status: 'Success' | 'Pending' | 'Failed';
  gain?: string;
}

export interface SystemLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface AppToast {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'success' | 'info' | 'warn';
  duration?: number;
  cost?: string;
  timestamp: string;
  purpose?: string;
}

export interface ActiveTxToProduce {
  type: 'Deposit' | 'Withdraw' | 'Rebalance' | 'Deploy';
  amount?: string;
  poolName?: string;
  poolId?: string;
  allocations?: { poolName: string; allocationPercent: number }[];
  strategyName?: string;
  onConfirm: (txHash: string) => void;
}

