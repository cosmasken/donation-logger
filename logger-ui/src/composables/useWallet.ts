import { ref, computed, provide, inject, type Ref } from 'vue'
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from 'viem'
import { rootstockTestnet } from 'viem/chains'

const WALLET_KEY = Symbol('wallet')

interface WalletState {
  publicClient: Ref<PublicClient | null>
  walletClient: Ref<WalletClient | null>
  account: Ref<`0x${string}` | null>
  chainId: Ref<number | null>
  isConnecting: Ref<boolean>
  error: Ref<string | null>
  isConnected: Ref<boolean>
  connect: () => Promise<boolean>
  disconnect: () => void
  switchToRSKTestnet: () => Promise<boolean>
}

let globalWalletState: WalletState | null = null

// Use custom RPC URL with API key from environment variable
const RSK_TESTNET_RPC_URL = import.meta.env.VITE_RSK_TESTNET_RPC_URL || 'https://public-node.testnet.rsk.co'

function createWalletState(): WalletState {
  const publicClient = ref<PublicClient | null>(null)
  const walletClient = ref<WalletClient | null>(null)
  const account = ref<`0x${string}` | null>(null)
  const chainId = ref<number | null>(null)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  const isConnected = computed(() => !!account.value)

  async function connect() {
    if (!window.ethereum) {
      error.value = 'Please install MetaMask to use this feature'
      return false
    }

    isConnecting.value = true
    error.value = null

    try {
      const client = createWalletClient({
        chain: rootstockTestnet,
        transport: custom(window.ethereum)
      })

      const addresses = await client.requestAddresses()
      if (!addresses[0]) {
        error.value = 'No accounts found'
        isConnecting.value = false
        return false
      }
      account.value = addresses[0]

      const chain = await client.getChainId()
      chainId.value = chain

      publicClient.value = createPublicClient({
        chain: rootstockTestnet,
        transport: http(RSK_TESTNET_RPC_URL)
      })

      walletClient.value = client

      isConnecting.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to connect wallet'
      isConnecting.value = false
      return false
    }
  }

  async function disconnect() {
    publicClient.value = null
    walletClient.value = null
    account.value = null
    chainId.value = null
    error.value = null
  }

  async function switchToRSKTestnet() {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1f' }],
      })
      return true
    } catch (switchError: unknown) {
      if ((switchError as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1f',
              chainName: 'Rootstock Testnet',
              rpcUrls: [RSK_TESTNET_RPC_URL],
              blockExplorerUrls: ['https://explorer.testnet.rootstock.io'],
              nativeCurrency: {
                name: 'tRBTC',
                symbol: 'tRBTC',
                decimals: 18
              }
            }],
          })
          return true
        } catch {
          error.value = 'Failed to add Rootstock Testnet'
          return false
        }
      }
      error.value = 'Failed to switch network'
      return false
    }
  }

  return {
    publicClient,
    walletClient,
    account,
    chainId,
    isConnecting,
    error,
    isConnected,
    connect,
    disconnect,
    switchToRSKTestnet
  }
}

export function provideWallet() {
  if (!globalWalletState) {
    globalWalletState = createWalletState()
  }
  provide(WALLET_KEY, globalWalletState)
  return globalWalletState
}

export function useWallet(): WalletState {
  if (!globalWalletState) {
    globalWalletState = createWalletState()
  }
  const wallet = inject(WALLET_KEY, globalWalletState)
  return wallet
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}
