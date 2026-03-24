#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short, Address, Map};

#[contract]
pub struct SportsBetting;

#[contractimpl]
impl SportsBetting {

    // Place a bet
    pub fn place_bet(env: Env, user: Address, match_id: Symbol, amount: i128) {
        user.require_auth();

        let key = (user.clone(), match_id.clone());
        let mut bets: Map<(Address, Symbol), i128> =
            env.storage().instance().get(&symbol_short!("BETS")).unwrap_or(Map::new(&env));

        bets.set(key, amount);

        env.storage().instance().set(&symbol_short!("BETS"), &bets);
    }

    // Get bet amount
    pub fn get_bet(env: Env, user: Address, match_id: Symbol) -> i128 {
        let bets: Map<(Address, Symbol), i128> =
            env.storage().instance().get(&symbol_short!("BETS")).unwrap_or(Map::new(&env));

        bets.get((user, match_id)).unwrap_or(0)
    }

    // Resolve match and distribute winnings (simplified)
    pub fn resolve_match(env: Env, match_id: Symbol, winner: Address) {
        let bets: Map<(Address, Symbol), i128> =
            env.storage().instance().get(&symbol_short!("BETS")).unwrap_or(Map::new(&env));

        // In real contract: logic for payout distribution
        // Here we just store winner for reference
        env.storage().instance().set(&match_id, &winner);
    }

    // Get winner of a match
    pub fn get_winner(env: Env, match_id: Symbol) -> Address {
        env.storage().instance().get(&match_id).unwrap()
    }
}