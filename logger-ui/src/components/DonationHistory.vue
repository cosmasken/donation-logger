<script setup lang="ts">
import type { Donation } from '@/types/contract'

defineProps<{
  donations: Donation[]
  loading: boolean
}>()

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

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}
</script>

<template>
  <div class="card p-6 animate-fade-in">
    <h2 class="text-xl font-bold mb-4 text-orange-600">Donation History</h2>
    
    <div v-if="loading" class="space-y-3">
      <div class="skeleton h-16 rounded"></div>
      <div class="skeleton h-16 rounded"></div>
      <div class="skeleton h-16 rounded"></div>
    </div>
    
    <div v-else-if="donations.length === 0" class="text-center py-8 text-gray-500">
      No donations yet. Be the first!
    </div>
    
    <div v-else class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
      <div
        v-for="(donation, index) in donations"
        :key="donation.txHash + index"
        class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 transition-colors"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium text-gray-900">
              {{ formatAddress(donation.donor) }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              {{ formatDate(donation.timestamp) }}
            </p>
            <p v-if="donation.message" class="text-sm text-gray-700 mt-2 italic">
              "{{ donation.message }}"
            </p>
          </div>
          <p class="text-lg font-bold text-orange-500">
            {{ formatAmount(donation.amount) }} tRBTC
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
