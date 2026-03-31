<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Campaign } from '@/types/contract'

const props = defineProps<{
  campaign: Campaign
  title?: string | null
}>()

const now = ref(Date.now())
let intervalId: ReturnType<typeof setInterval> | null = null

const timeRemaining = computed(() => {
  const campaignEndTime = Number(props.campaign.deadline) * 1000
  const remaining = Math.max(0, campaignEndTime - now.value)
  return Math.floor(remaining / 1000)
})

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Ended'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
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
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`
}

function copyAddress() {
  navigator.clipboard.writeText(props.campaign.address)
}
</script>

<template>
  <div class="card p-6 animate-fade-in">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-xl font-bold text-orange-600 dark:text-orange-400">{{ title || 'Campaign' }}</h2>
      <button
        @click="copyAddress"
        class="text-xs text-orange-500 hover:text-orange-600 underline dark:text-orange-400"
      >
        Copy Address
      </button>
    </div>
    
    <!-- Contract Address -->
    <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Address</p>
      <p class="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">{{ campaign.address }}</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Raised</p>
          <p class="text-2xl font-bold text-orange-500 dark:text-orange-400">
            {{ formatAmount(campaign.totalRaised) }} tRBTC
          </p>
        </div>
        
        <div v-if="campaign.isActive">
          <p class="text-sm text-gray-500 dark:text-gray-400">Time Remaining</p>
          <p class="text-lg font-semibold text-foreground">
            {{ formatCountdown(timeRemaining) }}
          </p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Creator</p>
          <p class="text-sm font-mono text-gray-700 dark:text-gray-300">
            {{ formatAddress(campaign.creator) }}
          </p>
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <span 
            :class="campaign.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            class="inline-block px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ campaign.isActive ? 'Active' : 'Ended' }}
          </span>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Ended</p>
          <p class="text-sm text-foreground">
            {{ campaign.ended ? 'Yes' : 'No' }}
          </p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
          <p class="text-sm font-mono text-foreground">
            {{ new Date(Number(campaign.deadline) * 1000).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
