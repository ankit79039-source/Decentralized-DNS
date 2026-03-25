# Decentralized DNS

A decentralized domain name system built on Stellar Soroban smart contracts. Register, resolve, and manage domain names on-chain with full ownership control.

## About

Decentralized DNS enables you to register domain names as Soroban smart contract storage entries, resolve them to IP addresses, and update them at any time. All domain records are stored immutably on the Stellar blockchain, giving you true ownership of your web3 identity.

## Features

- **Register Domains** — Claim unique domain names bound to your Stellar wallet address
- **Resolve to IP** — Query any registered domain to retrieve its associated IP address
- **Update IPs** — Change the IP address of domains you own at any time
- **Full Ownership** — Only the domain owner can update or transfer their domain
- **Built on Stellar** — Leverages Soroban smart contracts for fast, low-cost transactions

## Deployed Contract

**Network:** Stellar Testnet

**Contract Address:** `CDAZK5IX2OQ2R5SVK65XMITFBRW4BLOLUIFZUNL636SP5KDX6XKLZQAU`

## How It Works

1. **Connect Wallet** — Use Freighter wallet to connect to the app
2. **Register a Domain** — Enter a domain name (e.g., `mysite`) and IP address (e.g., `192.168.1.1`)
3. **Resolve Domains** — Anyone can look up a domain to see its IP address
4. **Update** — Domain owners can update their IP address anytime

## Tech Stack

- **Smart Contract:** Rust + Soroban SDK v25
- **Frontend:** Next.js 16 + React
- **Styling:** Tailwind CSS
- **Wallet:** Freighter
- **Network:** Stellar Testnet

## Getting Started

### Prerequisites

- Node.js 18+
- Freighter browser extension installed

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Build for Production

```bash
bun run build
```

## Contract Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `register` | `domain: Symbol`, `owner: Address`, `ip: Symbol` | Register a new domain |
| `resolve` | `domain: Symbol` | Resolve domain to IP |
| `update` | `domain: Symbol`, `owner: Address`, `new_ip: Symbol` | Update domain IP |

## Project Structure

```
client/
├── app/
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   ├── Contract.tsx    # Main contract UI
│   └── Navbar.tsx      # Navigation bar
├── hooks/
│   └── contract.ts     # Contract interaction hooks
└── lib/
    └── utils.ts        # Utility functions
```

## License

MIT
