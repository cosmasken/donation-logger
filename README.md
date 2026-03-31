# Donation Logger

A transparent on-chain donation system built on Rootstock (RSK) with intentional design choices for security and simplicity.

## Contract Addresses

The donation logger contracts are deployed and verified on RSK Testnet:

### Campaign Factory
- **Address**: `0xdB0c827ebDce84f14092a01743DCa1E57E725437`
- **Blockscout**: https://rootstock-testnet.blockscout.com/address/0xdB0c827ebDce84f14092a01743DCa1E57E725437
- **RSK Explorer**: https://explorer.testnet.rootstock.io/address/0xdB0c827ebDce84f14092a01743DCa1E57E725437

### Example Campaign
- **Address**: `0xedF3A7A4f00232bb2BB1A40b5122D906b9543a62`
- **Blockscout**: https://rootstock-testnet.blockscout.com/address/0xedF3A7A4f00232bb2BB1A40b5122D906b9543a62
- **RSK Explorer**: https://explorer.testnet.rootstock.io/address/0xedF3A7A4f00232bb2BB1A40b5122D906b9543a62

## Features

- **Factory Pattern**: Create multiple independent donation campaigns
- **Flexible Duration**: Campaigns can run from 1 hour to 365 days
- **Campaign Management**: Each campaign has its own contract with time-based deadlines
- Donate to campaigns with optional messages
- Automatic withdrawal access after deadline (no manual finalization required)
- View campaign details (creator, total raised, status)
- Transparent on-chain donation tracking

## Intentional Design Decisions

### Security & Safety
- **Automatic withdrawal after deadline**: Creator can withdraw funds immediately when `block.timestamp >= deadline` without requiring separate `endCampaign()` call, preventing fund-locking scenarios
- **ReentrancyGuard**: Applied conservatively to all state-changing functions for maximum safety
- **Checks-effects-interactions pattern**: Implemented throughout for secure fund transfers
- **Immutable variables**: `creator` and `deadline` are immutable for gas optimization and security

### User Experience
- **No fallback/receive function**: Direct ETH transfers are intentionally rejected to ensure all donations go through `donate()` function with proper event logging
- **Single withdrawal model**: Creator withdraws all funds at once, resetting `totalRaised` to zero for clear state management
- **Permissionless campaign finalization**: Anyone can call `endCampaign()` to help finalize stuck campaigns (community-friendly design)

### Limitations (By Design)
- **No emergency withdrawal mechanism**: Simple contract design prioritizes transparency over complex recovery mechanisms
- **No partial withdrawals**: Maintains simple state management and clear fund flow
- **Message gas costs**: Large donation messages increase gas costs - frontend should warn users
- **Block timestamp dependency**: Uses `block.timestamp` for deadlines (standard practice, minimal manipulation risk)

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

## Testing

### Hardhat Tests (Recommended)
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/DonationLogger.test.ts
```

### Foundry Tests
```bash
# Run Foundry tests
forge test
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

## Deployment

```bash
# Deploy to RSK Testnet
npx hardhat run scripts/deploy.ts --network rootstockTestnet

# Verify contract
npx hardhat verify --network rootstockTestnet <CONTRACT_ADDRESS> <DURATION_DAYS>
```

## Contract ABI

```javascript
[
  "constructor(uint256 _durationSeconds)",
  "function donate(string calldata message) external payable",
  "function withdraw() external",
  "function endCampaign() external",
  "function timeRemaining() external view returns (uint256)",
  "function isActive() external view returns (bool)",
  "function creator() external view returns (address)",
  "function totalRaised() external view returns (uint256)",
  "function deadline() external view returns (uint256)",
  "function ended() external view returns (bool)",
  "event Donated(address indexed donor, uint256 amount, string message)",
  "event CampaignEnded(uint256 totalRaised)",
  "event FundsWithdrawn(address indexed creator, uint256 amount)"
]
```

### Duration
- **Minimum**: 1 hour (3600 seconds)
- **Maximum**: 365 days
- **Unit**: Seconds (can specify hours or days when creating)

## Security Considerations

This contract has been designed with the following security principles:

1. **No fund-locking**: Automatic withdrawal after deadline prevents stuck funds
2. **Access control**: Only creator can withdraw funds
3. **Reentrancy protection**: Guards against reentrancy attacks
4. **Transparent operations**: All actions logged via events
5. **Simple state management**: Minimal complexity reduces attack surface

**Note**: This is a simple donation system. For production use with large amounts, consider additional features like multi-signature wallets, governance mechanisms, or emergency pause functionality.
