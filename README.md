# Donation Logger

A transparent on-chain donation system built on Rootstock (RSK).

## Contract Addresses

The donation logger contract is deployed and verified on RSK Testnet:

- **Blockscout**: https://rootstock-testnet.blockscout.com/address/0x4812d38cD175B32fF57Bb3B3C5525828dc7eBDa9
- **RSK Explorer**: https://explorer.testnet.rootstock.io/address/0x4812d38cd175b32ff57bb3b3c5525828dc7ebda9

**Contract Address**: `0x4812d38cD175B32fF57Bb3B3C5525828dc7eBDa9`

## Features

- Create donation campaigns
- Donate to campaigns with messages
- View campaign details (creator, total raised, status)
- Withdraw funds from campaigns

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd donation-frontend && npm install
```

### Configure Environment

Create a `.env` file with your private key:

```
PRIVATE_KEY=your_private_key_here
```

## Running the Frontend

```bash
cd donation-frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Network Configuration

This project uses **RSK Testnet**:

- Chain ID: 31 (0x1f)
- RPC URL: https://public-node.testnet.rsk.co
- Block Explorer: https://explorer.testnet.rootstock.io

Get testnet RBTC from the faucet: https://faucet.testnet.rootstock.io/

## Hardhat Commands

```bash
# Run tests
npx hardhat test

# Deploy to RSK Testnet
npx hardhat run scripts/deploy.ts --network rootstockTestnet

# Verify contract
npx hardhat verify --network rootstockTestnet <CONTRACT_ADDRESS>
```

## Contract ABI

```javascript
[
  "function createCampaign(string calldata name) external returns (uint256)",
  "function donate(uint256 campaignId, string calldata message) external payable",
  "function withdraw(uint256 campaignId) external",
  "function getCampaign(uint256 campaignId) external view returns (address creator, uint256 totalRaised, bool active, string memory name)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string name)",
  "event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount, string message)"
]
```
