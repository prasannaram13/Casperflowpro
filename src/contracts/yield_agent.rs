use odra::prelude::*;
use odra::{Var, Mapping, Event};

/// Structure representing a DeFi pool on the Casper Network
#[derive(odra::Type, Clone, Debug)]
pub struct DefiPool {
    pub id: u8,
    pub name: String,
    pub apy: u32,       // Expressed as basis points (e.g., 1250 for 12.5% APY)
    pub risk_score: u8, // 0 = Low, 1 = Medium, 2 = High
    pub tvl: U512,      // Pool Total Value Locked in motes
}

/// Structure representing the current user portfolio strategy allocation
#[derive(odra::Type, Clone, Debug)]
pub struct StrategyAllocation {
    pub pool_id: u8,
    pub allocation_percent: u8, // e.g. 40 for 40%
}

/// Event emitted when a pool's APY is updated by an oracle
#[derive(Event, Debug, PartialEq)]
pub struct PoolApyUpdated {
    pub pool_id: u8,
    pub old_apy: u32,
    pub new_apy: u32,
}

/// Event emitted when an autonomous or manual rebalance completes
#[derive(Event, Debug, PartialEq)]
pub struct Rebalanced {
    pub strategy_mode: String,
    pub gas_spent: U512,
    pub total_allocated: U512,
}

/// Odra Smart Contract for Casper Network Yield Agent Routing
#[odra::module]
pub struct YieldAgent {
    /// Address of the contract owner/administrator
    owner: Var<Address>,
    /// System initialization state flag
    initialized: Var<bool>,
    /// List of registered yield optimization pools
    pools: Mapping<u8, DefiPool>,
    /// Array of pool IDs registered in the contract
    pool_ids: Var<Vec<u8>>,
    /// Active strategies allocation profiles
    allocations: Mapping<u8, u8>, // mapping from pool_id to allocation_percent
    /// Total Value Locked (TVL) managed by the agent
    total_managed_tvl: Var<U512>,
    /// User accounting state changed by deposit/withdraw contract calls.
    balances: Mapping<Address, U512>,
    last_pool_by_user: Mapping<Address, u8>,
}

#[odra::module]
impl YieldAgent {
    /// Initializes the smart contract state with an owner and default pool setups
    #[odra(init)]
    pub fn init(&mut self) {
        if self.initialized.get_or_default() {
            odra::contract_env::revert(odra::ExecutionError::User(101)); // Already Initialized
        }
        
        let caller = odra::contract_env::caller();
        self.owner.set(caller);
        self.initialized.set(true);
        self.total_managed_tvl.set(U512::zero());
        
        // Seed initial mock APY pools
        self.add_initial_pools();
    }

    /// Explicit initializer to establish target pools and clear state variables
    pub fn initialize(&mut self, initial_pools: Vec<DefiPool>) {
        self.assert_owner();
        
        // Register each pool on-chain
        let mut ids = Vec::new();
        for pool in initial_pools {
            self.pools.set(&pool.id, pool.clone());
            ids.push(pool.id);
        }
        self.pool_ids.set(ids);
    }

    /// Admin/Oracle entry point to update a specific pool's yield rate (APY) on-chain
    pub fn update_pool_apy(&mut self, pool_id: u8, new_apy: u32) {
        self.assert_owner();
        
        if let Some(mut pool) = self.pools.get(&pool_id) {
            let old_apy = pool.apy;
            pool.apy = new_apy;
            self.pools.set(&pool_id, pool);
            
            // Emit oracle update event
            self.env().emit_event(PoolApyUpdated {
                pool_id,
                old_apy,
                new_apy,
            });
        } else {
            odra::contract_env::revert(odra::ExecutionError::User(102)); // Pool Not Found
        }
    }

    /// Records a user's deposit allocation in contract storage.
    /// The amount is expressed in motes and is intentionally explicit in the
    /// runtime arguments so the signed deploy is auditable by the frontend.
    pub fn deposit(&mut self, amount: U512, pool_id: u8) {
        if amount == U512::zero() {
            odra::contract_env::revert(odra::ExecutionError::User(104));
        }
        if self.pools.get(&pool_id).is_none() {
            odra::contract_env::revert(odra::ExecutionError::User(102));
        }
        let caller = odra::contract_env::caller();
        let current = self.balances.get_or_default(&caller);
        self.balances.set(&caller, current + amount);
        self.last_pool_by_user.set(&caller, pool_id);
        let total = self.total_managed_tvl.get_or_default();
        self.total_managed_tvl.set(total + amount);
    }

    /// Reduces the caller's recorded position in contract storage.
    pub fn withdraw(&mut self, amount: U512, pool_id: u8) {
        if amount == U512::zero() {
            odra::contract_env::revert(odra::ExecutionError::User(105));
        }
        let caller = odra::contract_env::caller();
        let current = self.balances.get_or_default(&caller);
        if current < amount {
            odra::contract_env::revert(odra::ExecutionError::User(106));
        }
        self.balances.set(&caller, current - amount);
        self.last_pool_by_user.set(&caller, pool_id);
        let total = self.total_managed_tvl.get_or_default();
        self.total_managed_tvl.set(total - amount);
    }

    pub fn get_user_balance(&self, user: Address) -> U512 {
        self.balances.get_or_default(&user)
    }

    /// Entry point to update the allocation distribution across pools, optimizing yield
    pub fn rebalance(&mut self, strategy_mode: String, target_allocations: Vec<StrategyAllocation>) {
        self.assert_owner();
        
        let mut total_percent: u16 = 0;
        for alloc in &target_allocations {
            total_percent += alloc.allocation_percent as u16;
            
            // Ensure pool actually exists
            if self.pools.get(&alloc.pool_id).is_none() {
                odra::contract_env::revert(odra::ExecutionError::User(102)); // Pool Not Found
            }
        }
        
        // Allocation percentages must sum up to exactly 100%
        if total_percent != 100 {
            odra::contract_env::revert(odra::ExecutionError::User(103)); // Invalid Allocation Sum
        }
        
        // Persist new allocation rules
        for alloc in target_allocations {
            self.allocations.set(&alloc.pool_id, alloc.allocation_percent);
        }
        
        // Emit rebalance logging event
        self.env().emit_event(Rebalanced {
            strategy_mode,
            gas_spent: U512::from(100_000_000u64), // Approximate execution gas in motes
            total_allocated: self.total_managed_tvl.get_or_default(),
        });
    }

    /// Read-only method to fetch registered pool details
    pub fn get_pool(&self, pool_id: u8) -> Option<DefiPool> {
        self.pools.get(&pool_id)
    }

    /// Read-only method to fetch allocation percentage for a given pool
    pub fn get_allocation(&self, pool_id: u8) -> u8 {
        self.allocations.get_or_default(&pool_id)
    }

    /// Helper asserting that caller is the administrative authority
    fn assert_owner(&self) {
        let caller = odra::contract_env::caller();
        let owner = self.owner.get_or_default();
        if caller != owner {
            odra::contract_env::revert(odra::ExecutionError::User(100)); // Authorization Failed
        }
    }

    /// Private seeding function to insert standard Casper DeFi optimization pools
    fn add_initial_pools(&mut self) {
        let p1 = DefiPool {
            id: 1,
            name: String::from("CasperSwap CSPR-USDC"),
            apy: 1250, // 12.5%
            risk_score: 0,
            tvl: U512::from(12_000_000_000_000u64),
        };
        let p2 = DefiPool {
            id: 2,
            name: String::from("WiseSwap Lending CSPR"),
            apy: 840, // 8.4%
            risk_score: 0,
            tvl: U512::from(900_000_000_000u64),
        };
        
        self.pools.set(&1, p1);
        self.pools.set(&2, p2);
        self.pool_ids.set(vec![1, 2]);
    }
}
