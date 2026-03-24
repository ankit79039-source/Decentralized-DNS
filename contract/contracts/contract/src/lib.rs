#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short, Map, String};

#[contract]
pub struct DecentralizedDNS;

#[contractimpl]
impl DecentralizedDNS {

    // Register a domain -> address mapping
    pub fn register(env: Env, domain: String, address: String) {
        let mut storage: Map<String, String> = env.storage().instance().get(&symbol_short!("DNS")).unwrap_or(Map::new(&env));

        // Prevent overwriting existing domain
        if storage.contains_key(domain.clone()) {
            panic!("Domain already registered");
        }

        storage.set(domain, address);
        env.storage().instance().set(&symbol_short!("DNS"), &storage);
    }

    // Resolve domain -> address
    pub fn resolve(env: Env, domain: String) -> String {
        let storage: Map<String, String> = env.storage().instance().get(&symbol_short!("DNS")).unwrap_or(Map::new(&env));

        match storage.get(domain) {
            Some(addr) => addr,
            None => panic!("Domain not found"),
        }
    }

    // Update domain mapping
    pub fn update(env: Env, domain: String, new_address: String) {
        let mut storage: Map<String, String> = env.storage().instance().get(&symbol_short!("DNS")).unwrap_or(Map::new(&env));

        if !storage.contains_key(domain.clone()) {
            panic!("Domain not registered");
        }

        storage.set(domain, new_address);
        env.storage().instance().set(&symbol_short!("DNS"), &storage);
    }
}