# Rootstock Donation Platform Demo

## What We're Building
A decentralized donation platform built on Rootstock (RSK) testnet that allows users to create crowdfunding campaigns and receive tRBTC donations.

## Features
- **Create Campaigns** - Set title, duration (hours/days), and deploy to blockchain
- **Donate** - Send tRBTC with optional messages
- **Withdraw** - Campaign creators can withdraw funds after deadline
- **End Campaign** - Mark campaign as ended by creator

## Tech Stack
- **Frontend**: Vue.js + Tailwind CSS + dark mode
- **Smart Contracts**: Solidity (Hardhat)
- **Blockchain**: Rootstock Testnet (RSK)
- **Wallet**: MetaMask

## Demo Flow
1. Connect wallet (MetaMask) to RSK Testnet
2. View existing campaigns in Explorer
3. Create new campaign with title + duration
4. Donate tRBTC to a campaign
5. View campaign details and donation history

## Contract Addresses
- Factory: 0xdB0c827ebDce84f14092a01743DCa1E57E725437

## Key UX Features
- User-friendly error messages (instead of raw contract errors)
- Dark/light mode toggle
- Real-time countdown timers
- Loading states for all transactions

## Why Rootstock?
- Bitcoin-aligned smart contracts
- EVM-compatible
- Low gas fees on testnet