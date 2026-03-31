<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@/composables/useWallet'

const { account, isConnected, isConnecting, error, connect, disconnect, switchToRSKTestnet } = useWallet()
const showDropdown = ref(false)

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

async function handleConnect() {
  if (isConnected.value) {
    showDropdown.value = !showDropdown.value
  } else {
    const success = await connect()
    if (success) {
      await switchToRSKTestnet()
    }
  }
}

function copyAddress() {
  if (account.value) {
    navigator.clipboard.writeText(account.value)
    showDropdown.value = false
  }
}

function handleDisconnect() {
  disconnect()
  showDropdown.value = false
}

function closeDropdown() {
  showDropdown.value = false
}
</script>

<template>
  <div class="relative">
    <button
      @click="handleConnect"
      :disabled="isConnecting"
      class="btn-primary flex items-center gap-2"
    >
      <span v-if="isConnecting" class="animate-pulse">Connecting...</span>
      <span v-else-if="isConnected" class="flex items-center gap-2">
        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
        {{ formatAddress(account!) }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
      <span v-else>Connect Wallet</span>
    </button>
    
    <!-- Dropdown -->
    <div
      v-if="isConnected && showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <button
        @click="copyAddress"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy Address
      </button>
      <button
        @click="handleDisconnect"
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Disconnect
      </button>
    </div>
    
    <!-- Click outside to close -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
  
  <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
</template>