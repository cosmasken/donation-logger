import { ref } from 'vue'
import { createPublicClient, http, parseEther, type PublicClient, type WalletClient } from 'viem'
import { rootstockTestnet } from 'viem/chains'
import { CONTRACT_ABI, FACTORY_ABI } from '@/types/contract'
import type { Campaign, Donation } from '@/types/contract'

let sharedPublicClient: PublicClient | null = null

// Use custom RPC URL with API key from environment variable
const RSK_TESTNET_RPC_URL = import.meta.env.VITE_RSK_TESTNET_RPC_URL || 'https://public-node.testnet.rsk.co'

export function getPublicClient() {
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

  async function getCampaignTitles(publicClient: PublicClient, factoryAddress: string, campaignAddresses: string[]): Promise<Map<string, string>> {
    const titleMap = new Map<string, string>()
    
    if (campaignAddresses.length === 0) return titleMap

    try {
      const latestBlock = await publicClient.getBlockNumber()
      const maxRange = 1000n
      const fromBlock = latestBlock > maxRange ? latestBlock - maxRange : 0n

      const events = await publicClient.getLogs({
        address: factoryAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'CampaignCreated',
          inputs: [
            { type: 'address', name: 'creator', indexed: true },
            { type: 'address', name: 'campaign', indexed: true },
            { type: 'uint256', name: 'duration', indexed: false },
            { type: 'string', name: 'title', indexed: false }
          ]
        },
        args: {},
        fromBlock,
        toBlock: latestBlock
      })

      for (const event of events) {
        const campaignAddr = event.args.campaign as string
        if (campaignAddresses.includes(campaignAddr.toLowerCase())) {
          titleMap.set(campaignAddr.toLowerCase(), event.args.title as string)
        }
      }
    } catch (err) {
      console.error('getCampaignTitles error:', err)
    }

    return titleMap
  }

  async function getCampaignTitleSingle(publicClient: PublicClient, factoryAddress: string, campaignAddress: string): Promise<string | null> {
    try {
      const latestBlock = await publicClient.getBlockNumber()
      const maxRange = 1000n
      const fromBlock = latestBlock > maxRange ? latestBlock - maxRange : 0n

      const events = await publicClient.getLogs({
        address: factoryAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'CampaignCreated',
          inputs: [
            { type: 'address', name: 'creator', indexed: true },
            { type: 'address', name: 'campaign', indexed: true },
            { type: 'uint256', name: 'duration', indexed: false },
            { type: 'string', name: 'title', indexed: false }
          ]
        },
        args: {
          campaign: campaignAddress as `0x${string}`
        },
        fromBlock,
        toBlock: latestBlock
      })

      if (events.length > 0) {
        return events[0].args.title as string
      }
      return null
    } catch (err) {
      console.error('getCampaignTitleSingle error:', err)
      return null
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
      
      const log = receipt.logs.find(log => log.topics[0] === '0x...')
      const campaignAddress = log?.topics[2]

      loading.value = false
      return campaignAddress ? `0x${campaignAddress.slice(26)}` : null
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Campaign creation failed'
      if (errorMessage.includes('User denied') || errorMessage.includes('rejected')) {
        error.value = 'Transaction rejected'
      } else {
        console.error('Campaign creation error:', err)
        error.value = errorMessage
      }
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
      const errorMessage = err instanceof Error ? err.message : 'Donation failed'
      if (errorMessage.includes('User denied') || errorMessage.includes('rejected')) {
        error.value = 'Transaction rejected'
      } else {
        console.error('Donation error:', err)
        error.value = errorMessage
      }
      loading.value = false
      return false
    }
  }

  async function getDonations(publicClient: PublicClient, contractAddress: string): Promise<Donation[]> {
    try {
      const latestBlock = await publicClient.getBlockNumber()
      const maxRange = 1000n
      const fromBlock = latestBlock > maxRange ? latestBlock - maxRange : 0n
      
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
        toBlock: latestBlock
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
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed'
      if (errorMessage.includes('User denied') || errorMessage.includes('rejected')) {
        error.value = 'Transaction rejected'
      } else {
        console.error('Withdrawal error:', err)
        error.value = errorMessage
      }
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to end campaign'
      if (errorMessage.includes('User denied') || errorMessage.includes('rejected')) {
        error.value = 'Transaction rejected'
      } else {
        console.error('End campaign error:', err)
        error.value = errorMessage
      }
      loading.value = false
      return false
    }
  }

  async function getAllCampaigns(publicClient: PublicClient, factoryAddress: string): Promise<string[]> {
    try {
      const campaignCount = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getCampaignCount'
      }) as bigint

      const campaigns: string[] = []
      for (let i = 0; i < Number(campaignCount); i++) {
        const campaignAddress = await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: 'campaigns',
          args: [BigInt(i)]
        }) as string
        campaigns.push(campaignAddress)
      }

      return campaigns
    } catch (err: unknown) {
      console.error('getAllCampaigns error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch campaigns'
      return []
    }
  }

  return {
    loading,
    error,
    getCampaignData,
    getCampaignTitles,
    getCampaignTitleSingle,
    createCampaign,
    donate,
    getDonations,
    withdraw,
    endCampaign,
    getAllCampaigns
  }
}
