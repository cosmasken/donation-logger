import { ref } from 'vue'
import { createPublicClient, custom, http, parseEther, type PublicClient, type WalletClient } from 'viem'
import { rootstockTestnet } from 'viem/chains'
import { CONTRACT_ABI, CONTRACT_BYTECODE, FACTORY_ABI } from '@/types/contract'
import type { Campaign, Donation } from '@/types/contract'

let sharedPublicClient: PublicClient | null = null

// Use custom RPC URL with API key from environment variable
const RSK_TESTNET_RPC_URL = import.meta.env.VITE_RSK_TESTNET_RPC_URL || 'https://public-node.testnet.rsk.co'

function getPublicClient() {
  if (!sharedPublicClient) {
    sharedPublicClient = createPublicClient({
      chain: rootstockTestnet,
      transport: http(RSK_TESTNET_RPC_URL)
    })
  }
  return sharedPublicClient
}

export function useContract() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getCampaignData(publicClient: PublicClient, address: string): Promise<Campaign> {
    loading.value = true
    error.value = null

    try {
      const addr = address as `0x${string}`
      const [creator, totalRaised, deadline, ended, isActive, timeRemaining] = await Promise.all([
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'creator' }),
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'totalRaised' }),
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'deadline' }),
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'ended' }),
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'isActive' }),
        publicClient.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'timeRemaining' })
      ])

      loading.value = false
      return {
        creator: creator as string,
        totalRaised: totalRaised as bigint,
        deadline: deadline as bigint,
        ended: ended as boolean,
        isActive: isActive as boolean,
        timeRemaining: timeRemaining as bigint,
        address
      }
    } catch (err: unknown) {
      console.error('getCampaignData error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch campaign data'
      loading.value = false
      throw err
    }
  }

  async function createCampaign(walletClient: WalletClient, account: `0x${string}`, factoryAddress: string, durationDays: number, title: string): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const hash = await walletClient.writeContract({
        chain: rootstockTestnet,
        address: factoryAddress as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createCampaign',
        args: [BigInt(durationDays), title],
        account
      })

      const client = getPublicClient()
      const receipt = await client.waitForTransactionReceipt({ hash })
      
      // Get campaign address from event logs
      const log = receipt.logs.find(log => log.topics[0] === '0x...' /* CampaignCreated event hash */)
      const campaignAddress = log?.topics[2] // campaign address is indexed

      loading.value = false
      return campaignAddress ? `0x${campaignAddress.slice(26)}` : null
    } catch (err: unknown) {
      console.error('Campaign creation error:', err)
      error.value = err instanceof Error ? err.message : 'Campaign creation failed'
      loading.value = false
      return null
    }
  }

  async function donate(walletClient: WalletClient, account: `0x${string}`, contractAddress: string, message: string, amount: string) {
    loading.value = true
    error.value = null

    try {
      const client = getPublicClient()
      const hash = await walletClient.writeContract({
        chain: rootstockTestnet,
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'donate',
        args: [message],
        account,
        value: parseEther(String(amount))
      })

      await client.waitForTransactionReceipt({ hash })
      loading.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Donation failed'
      loading.value = false
      return false
    }
  }

  async function getDonations(publicClient: PublicClient, contractAddress: string): Promise<Donation[]> {
    try {
      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock = latestBlock > 1500n ? latestBlock - 1500n : 0n
      
      const events = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Donated',
          inputs: [
            { type: 'address', name: 'donor', indexed: true },
            { type: 'uint256', name: 'amount', indexed: false },
            { type: 'string', name: 'message', indexed: false }
          ]
        },
        args: {},
        fromBlock,
        toBlock: 'latest'
      })

      return events.map(event => ({
        donor: event.args.donor as string,
        amount: event.args.amount as bigint,
        message: event.args.message as string,
        timestamp: Number(event.blockNumber),
        txHash: event.transactionHash
      }))
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch donations'
      return []
    }
  }

  async function withdraw(walletClient: WalletClient, account: `0x${string}`, contractAddress: string) {
    loading.value = true
    error.value = null

    try {
      const client = getPublicClient()
      const hash = await walletClient.writeContract({
        chain: rootstockTestnet,
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'withdraw',
        args: [],
        account
      })

      await client.waitForTransactionReceipt({ hash })
      loading.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Withdrawal failed'
      loading.value = false
      return false
    }
  }

  async function endCampaign(walletClient: WalletClient, account: `0x${string}`, contractAddress: string) {
    loading.value = true
    error.value = null

    try {
      const client = getPublicClient()
      const hash = await walletClient.writeContract({
        chain: rootstockTestnet,
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'endCampaign',
        args: [],
        account
      })

      await client.waitForTransactionReceipt({ hash })
      loading.value = false
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to end campaign'
      loading.value = false
      return false
    }
  }

  return {
    loading,
    error,
    getCampaignData,
    createCampaign,
    donate,
    getDonations,
    withdraw,
    endCampaign
  }
}
