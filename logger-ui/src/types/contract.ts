import bytecode from './contract-bytecode'

export interface Donation {
  donor: string
  amount: bigint
  message: string
  timestamp: number
  txHash: string
}

export interface Campaign {
  creator: string
  totalRaised: bigint
  deadline: bigint
  ended: boolean
  isActive: boolean
  timeRemaining: bigint
  address: string
}

export const CONTRACT_ADDRESS = '0x50c89535b2059131600f8bbe0e73f8306d279019'
export const FACTORY_ADDRESS = '0x4a1BA24b6a42dE6742e35201188470B6Bf109017'
export const CONTRACT_BYTECODE = bytecode

export const CONTRACT_ABI = [
  {
    inputs: [{ name: '_durationDays', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error'
  },
  {
    inputs: [{ name: 'message', type: 'string' }],
    name: 'donate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'endCampaign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'timeRemaining',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'isActive',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'creator',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalRaised',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'deadline',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'ended',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'donor', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'message', type: 'string' }
    ],
    name: 'Donated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'totalRaised', type: 'uint256' }
    ],
    name: 'CampaignEnded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'FundsWithdrawn',
    type: 'event'
  }
] as const

export const FACTORY_ABI = [
  {
    inputs: [
      { name: '_durationDays', type: 'uint256' },
      { name: '_title', type: 'string' }
    ],
    name: 'createCampaign',
    outputs: [{ type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCampaignCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getCreatorCampaigns',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'campaigns',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: true, name: 'campaign', type: 'address' },
      { indexed: false, name: 'duration', type: 'uint256' },
      { indexed: false, name: 'title', type: 'string' }
    ],
    name: 'CampaignCreated',
    type: 'event'
  }
] as const

export const RSK_TESTNET = {
  chainId: '0x1f',
  chainName: 'Rootstock Testnet',
  rpcUrls: ['https://public-node.testnet.rsk.co'],
  blockExplorerUrls: ['https://explorer.testnet.rootstock.io'],
  nativeCurrency: {
    name: 'tRBTC',
    symbol: 'tRBTC',
    decimals: 18
  }
}
