<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useContract, getPublicClient } from '@/composables/useContract'
import { FACTORY_ADDRESS } from '@/types/contract'
import type { Campaign } from '@/types/contract'

const emit = defineEmits<{
  (e: 'select-campaign', address: string): void
  (e: 'create-campaign'): void
}>()

const { getAllCampaigns, getCampaignData, getCampaignTitles } = useContract()

const publicClientForRead = getPublicClient()

const campaigns = ref<(Campaign & { address: string })[]>([])
const loadingCampaigns = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'ended'>('all')

const now = ref(Date.now())
let intervalId: ReturnType<typeof setInterval> | null = null

const filteredCampaigns = computed(() => {
  let result = campaigns.value
  
  if (statusFilter.value === 'active') {
    result = result.filter(c => c.isActive && !c.ended)
  } else if (statusFilter.value === 'ended') {
    result = result.filter(c => !c.isActive || c.ended)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(campaign => 
      campaign.address.toLowerCase().includes(query) ||
      campaign.creator.toLowerCase().includes(query)
    )
  }
  
  return result
})

const statusCounts = computed(() => ({
  all: campaigns.value.length,
  active: campaigns.value.filter(c => c.isActive && !c.ended).length,
  ended: campaigns.value.filter(c => !c.isActive || c.ended).length
}))

function getCountdown(deadline: bigint): number {
  const deadlineMs = Number(deadline) * 1000
  return Math.max(0, Math.floor((deadlineMs - now.value) / 1000))
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Ended'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  if (minutes > 0) return `${minutes}m ${secs}s left`
  return `${secs}s left`
}

async function fetchAllCampaigns() {
  if (!publicClientForRead || !FACTORY_ADDRESS) return
  
  loadingCampaigns.value = true
  try {
    const addresses = await getAllCampaigns(publicClientForRead, FACTORY_ADDRESS)
    
    const titleMap = await getCampaignTitles(publicClientForRead, FACTORY_ADDRESS, addresses)
    
    const campaignPromises = addresses.map(async (address) => {
      try {
        const campaignData = await getCampaignData(publicClientForRead, address)
        return { 
          ...campaignData,
          title: titleMap.get(address.toLowerCase()) || `Campaign ${address.slice(0, 8)}...`
        }
      } catch (err) {
        console.error(`Failed to fetch campaign ${address}:`, err)
        return null
      }
    })
    
    const results = await Promise.all(campaignPromises)
    campaigns.value = results.filter(Boolean) as (Campaign & { address: string; title: string })[]
  } catch (err) {
    console.error('Failed to fetch campaigns:', err)
  } finally {
    loadingCampaigns.value = false
  }
}

function formatAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18
  if (eth === 0) return '0'
  if (eth < 0.000001) return eth.toFixed(8)
  if (eth < 0.0001) return eth.toFixed(6)
  if (eth < 1) return eth.toFixed(4)
  return eth.toFixed(2)
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

onMounted(() => {
  fetchAllCampaigns()
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Search -->
    <div class="card p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-primary mb-2">Campaign Explorer</h1>
        <p class="text-muted-foreground">Discover and support donation campaigns on Rootstock</p>
      </div>
      <div class="flex gap-2">
        <button @click="fetchAllCampaigns" :disabled="loadingCampaigns" class="btn-secondary disabled:opacity-50">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button @click="emit('create-campaign')" class="btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create
        </button>
      </div>
    </div>
      
      <!-- Search and Filter Row -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Bar -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by address or creator..."
            class="search-input pl-10 w-full"
          />
        </div>
        
        <!-- Status Filter -->
        <div class="flex gap-2">
          <button
            v-for="status in ['all', 'active', 'ended'] as const"
            :key="status"
            @click="statusFilter = status"
            :class="statusFilter === status 
              ? 'bg-primary text-black' 
              : 'bg-muted text-foreground hover:bg-muted/80'"
            class="px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize"
          >
            {{ status === 'all' ? 'All' : status }} ({{ statusCounts[status] }})
          </button>
        </div>
      </div>
    </div>

    <!-- Campaign Grid -->
    <div v-if="loadingCampaigns" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="campaign-card">
        <div class="skeleton h-6 w-3/4 mb-3"></div>
        <div class="skeleton h-4 w-1/2 mb-4"></div>
        <div class="skeleton h-8 w-full mb-3"></div>
        <div class="skeleton h-4 w-2/3"></div>
      </div>
    </div>
    
    <div v-else-if="filteredCampaigns.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 bg-bitcoin-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-bitcoin-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ searchQuery ? 'No campaigns found' : 'No campaigns yet' }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a campaign!' }}
      </p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="campaign in filteredCampaigns"
        :key="campaign.address"
        @click="emit('select-campaign', campaign.address)"
        class="campaign-card bitcoin-border hover:shadow-lg transition-all cursor-pointer"
      >
        <!-- Campaign Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-foreground truncate">{{ campaign.title }}</h3>
            <p class="text-xs text-muted-foreground font-mono">{{ formatAddress(campaign.address) }}</p>
          </div>
          <span 
            :class="campaign.isActive && !campaign.ended 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'"
            class="px-2 py-1 rounded-full text-xs font-medium border"
          >
            {{ campaign.isActive && !campaign.ended ? 'Active' : 'Ended' }}
          </span>
        </div>

        <!-- Progress Section -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">Raised</span>
            <span class="text-xs text-muted-foreground">{{ formatCountdown(getCountdown(campaign.deadline)) }}</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: Math.min(Number(campaign.totalRaised) / 1e16, 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Amount and Creator -->
        <div class="flex justify-between items-end pt-2 border-t border-gray-100">
          <div>
            <p class="text-lg font-bold text-orange-600">
              {{ formatAmount(campaign.totalRaised) }} <span class="text-xs font-normal text-gray-500">tRBTC</span>
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground">by {{ formatAddress(campaign.creator) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
