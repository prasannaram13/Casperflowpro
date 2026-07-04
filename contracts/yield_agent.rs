/**
 * @file yield_agent.rs
 * @package CasperFlow DeFi Yield Router Smart Contract (Odra Framework)
 * @license SPDX-License-Identifier: Apache-2.0
 */

use odra::prelude::*;
use odra::{Address, Var, List, Event};

/// Structure representing a registered DeFi liquidity pool on Casper Network
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct Pool {
    pub id: u8,
    pub name: String,
    pub apy: u64,
    pub risk: u8, // 0: Low, 1: Medium, 2: High
    pub tvl: U256,
}

/// Allocation breakdown for user strategies
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct Strategy {
    pub pool_id: u8,
    pub allocation_percent: u8,
}

/// Ledger tracking historical rebalances on-chain
#[derive(Clone, PartialEq, Debug, odra::OdraType)]
pub struct RebalanceRecord {
    pub timestamp: u64,
    pub old_strategy: Vec<Strategy>,
    pub new_strategy: Vec<Strategy>,
    pub tx_hash: String,
}

/// Smart contract events
#[derive(Event, Debug, PartialEq)]
pub struct RebalanceExecuted {
    pub timestamp: u64,
    pub old_strategy: Vec<Strategy>,
    pub new_strategy: Vec<Strategy>,
    pub tx_hash: String,
}

#[derive(Event, Debug, PartialEq)]
pub struct PoolUpdated {
    pub pool_id: u8,
    pub new_apy: u64,
}

#[odra::module]
pub struct YieldAgentContract {
    /// Address of the contract administrator (oracle/agent operator)
    owner: Var<Address>,
    /// Available Casper Network yield pools
    pools: List<Pool>,
    /// User's current deployed investment strategy allocation index
    current_strategy: List<Strategy>,
    /// Historic rebalance operations
    rebalance_history: List<RebalanceRecord>,
    /// Block timestamp of the last executed rebalance
    last_rebalance: Var<u64>,
    /// Cooling period interval for rebalances
    min_rebalance_interval: Var<u64>,
}

#[odra::module]
impl YieldAgentContract {
    /// Deploys the agent framework and sets up default parameters
    #[odra(init)]
    pub fn initialize(&mut self, initial_pools: Vec<Pool>) {
        let caller = odra::contract_env::caller();
        self.owner.set(caller);
        self.last_rebalance.set(0);
        self.min_rebalance_interval.set(3600); // 1 hour cooling cooldown default

        for pool in initial_pools {
            self.pools.push(pool);
        }
    }

    /// Oracle node calls this to update APYs on-chain
    pub fn update_pool_apy(&mut self, pool_id: u8, new_apy: u64) {
        let caller = odra::contract_env::caller();
        assert_eq!(caller, self.owner.get().unwrap(), "Only owner/oracle can update APYs");

        for i in 0..self.pools.len() {
            if let Some(mut pool) = self.pools.get(i) {
                if pool.id == pool_id {
                    pool.apy = new_apy;
                    self.pools.replace(i, pool);
                    
                    // Emit pool updated event on-chain
                    odra::contract_env::emit_event(PoolUpdated {
                        pool_id,
                        new_apy,
                    });
                    break;
                }
            }
        }
    }

    /// Executed by the autonomous agent with the user's signed transaction
    pub fn rebalance(&mut self, new_strategy: Vec<Strategy>) {
        let current_time = odra::contract_env::get_block_time();
        let last = self.last_rebalance.get().unwrap_or(0);
        let cooldown = self.min_rebalance_interval.get().unwrap_or(3600);
        
        assert!(
            current_time >= last + cooldown,
            "Rebalancing cooling cooldown is active"
        );

        let mut old_strategy = Vec::new();
        for i in 0..self.current_strategy.len() {
            if let Some(strat) = self.current_strategy.get(i) {
                old_strategy.push(strat);
            }
        }

        // Clear previous current strategy allocation
        self.current_strategy.clear();
        
        // Push new allocations
        for strat in &new_strategy {
            self.current_strategy.push(strat.clone());
        }

        self.last_rebalance.set(current_time);

        // Record history
        let tx_hash = "0x".to_owned() + &odra::contract_env::self_address().to_string();
        let record = RebalanceRecord {
            timestamp: current_time,
            old_strategy: old_strategy.clone(),
            new_strategy: new_strategy.clone(),
            tx_hash: tx_hash.clone(),
        };
        self.rebalance_history.push(record);

        // Emit rebalance event
        odra::contract_env::emit_event(RebalanceExecuted {
            timestamp: current_time,
            old_strategy,
            new_strategy,
            tx_hash,
        });
    }

    /// Returns the currently active portfolio strategy on-chain
    pub fn get_current_strategy(&self) -> Vec<Strategy> {
        let mut result = Vec::new();
        for i in 0..self.current_strategy.len() {
            if let Some(strat) = self.current_strategy.get(i) {
                result.push(strat);
            }
        }
        result
    }

    /// Returns the registry of all active pool states on Casper Network
    pub fn get_pool_data(&self) -> Vec<Pool> {
        let mut result = Vec::new();
        for i in 0..self.pools.len() {
            if let Some(pool) = self.pools.get(i) {
                result.push(pool);
            }
        }
        result
    }

    /// Returns full historical audits of ledger rebalances
    pub fn get_rebalance_history(&self) -> Vec<RebalanceRecord> {
        let mut result = Vec::new();
        for i in 0..self.rebalance_history.len() {
            if let Some(record) = self.rebalance_history.get(i) {
                result.push(record);
            }
        }
        result
    }
}
