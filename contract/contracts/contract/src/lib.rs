#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, Address, Map};

#[contracttype]
#[derive(Clone)]
pub struct DomainRecord {
    pub owner: Address,
    pub ip: Symbol,
}

#[contract]
pub struct DecentralizedDNS;

#[contractimpl]
impl DecentralizedDNS {

    // Register a domain
    pub fn register(env: Env, domain: Symbol, owner: Address, ip: Symbol) {
        owner.require_auth();

        let mut storage: Map<Symbol, DomainRecord> =
            env.storage().instance().get(&Symbol::short("DNS")).unwrap_or(Map::new(&env));

        if storage.contains_key(domain.clone()) {
            panic!("Domain already registered");
        }

        let record = DomainRecord {
            owner: owner.clone(),
            ip,
        };

        storage.set(domain, record);
        env.storage().instance().set(&Symbol::short("DNS"), &storage);
    }

    // Resolve domain → IP
    pub fn resolve(env: Env, domain: Symbol) -> Symbol {
        let storage: Map<Symbol, DomainRecord> =
            env.storage().instance().get(&Symbol::short("DNS")).unwrap();

        let record = storage.get(domain).unwrap();
        record.ip
    }

    // Update domain IP
    pub fn update(env: Env, domain: Symbol, owner: Address, new_ip: Symbol) {
        owner.require_auth();

        let mut storage: Map<Symbol, DomainRecord> =
            env.storage().instance().get(&Symbol::short("DNS")).unwrap();

        let mut record = storage.get(domain.clone()).unwrap();

        if record.owner != owner {
            panic!("Not the owner");
        }

        record.ip = new_ip;
        storage.set(domain, record);

        env.storage().instance().set(&Symbol::short("DNS"), &storage);
    }
}