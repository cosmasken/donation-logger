<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'

const { account, isConnected, isConnecting, error, connect, disconnect, switchToRSKTestnet } = useWallet()

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

async function handleConnect() {
  if (isConnected.value) {
    disconnect()
  } else {
    const success = await connect()
    if (success) {
      await switchToRSKTestnet()
    }
  }
}
</script>

<template>
  <button
    @click="handleConnect"
    :disabled="isConnecting"
    class="btn-primary flex items-center gap-2"
  >
    <span v-if="isConnecting" class="animate-pulse">Connecting...</span>
    <span v-else-if="isConnected">
      {{ formatAddress(account!) }}
    </span>
    <span v-else>Connect Wallet</span>
  </button>
  
  <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
</template>
