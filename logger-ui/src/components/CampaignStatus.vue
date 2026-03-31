<script setup lang="ts">
import type { Campaign } from '@/types/contract'

const props = defineProps<{
  campaign: Campaign
}>()

function formatTimeRemaining(seconds: bigint): string {
  const days = Number(seconds) / 86400
  if (days >= 1) {
    return `${days.toFixed(1)} days`
  }
  const hours = Number(seconds) / 3600
  if (hours >= 1) {
    return `${hours.toFixed(1)} hours`
  }
  const minutes = Number(seconds) / 60
  return `${minutes.toFixed(0)} minutes`
}

function formatAmount(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4)
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
      <h2 class="text-xl font-bold text-orange-600">Campaign Status</h2>
      <button
        @click="copyAddress"
        class="text-xs text-orange-500 hover:text-orange-600 underline"
      >
        Copy Address
      </button>
    </div>
    
    <!-- Contract Address -->
    <div class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-xs text-gray-500 mb-1">Contract Address</p>
      <p class="font-mono text-sm text-gray-700 break-all">{{ campaign.address }}</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-500">Total Raised</p>
          <p class="text-2xl font-bold text-orange-500">
            {{ formatAmount(campaign.totalRaised) }} tRBTC
          </p>
        </div>
        
        <div v-if="campaign.isActive">
          <p class="text-sm text-gray-500">Time Remaining</p>
          <p class="text-lg font-semibold">
            {{ formatTimeRemaining(campaign.timeRemaining) }}
          </p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500">Creator</p>
          <p class="text-sm font-mono text-gray-700">
            {{ formatAddress(campaign.creator) }}
          </p>
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-500">Status</p>
          <span 
            :class="campaign.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'"
            class="inline-block px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ campaign.isActive ? 'Active' : 'Ended' }}
          </span>
        </div>
        
        <div>
          <p class="text-sm text-gray-500">Ended</p>
          <p class="text-sm">
            {{ campaign.ended ? 'Yes' : 'No' }}
          </p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500">Deadline</p>
          <p class="text-sm font-mono">
            {{ new Date(Number(campaign.deadline) * 1000).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
