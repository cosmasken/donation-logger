<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import { FACTORY_ADDRESS } from '@/types/contract'

const emit = defineEmits<{
  (e: 'created', address: string): void
}>()

const { walletClient, account } = useWallet()
const { loading, error, createCampaign } = useContract()

const durationDays = ref('30')
const title = ref('')

async function handleCreate() {
  if (!walletClient.value || !account.value || !FACTORY_ADDRESS) return

  try {
    const address = await createCampaign(
      walletClient.value, 
      account.value, 
      FACTORY_ADDRESS,
      Number(durationDays.value),
      title.value
    )
    if (address) {
      emit('created', address)
      durationDays.value = '30'
      title.value = ''
    }
  } catch (err) {
    console.error('Campaign creation error:', err)
  }
}
</script>

<template>
  <div class="card p-6 animate-fade-in border-2 border-orange-200">
    <h2 class="text-xl font-bold mb-4 text-orange-600">Create New Campaign</h2>

    <div v-if="!FACTORY_ADDRESS" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
      <p class="text-sm text-red-700">Factory contract not deployed yet</p>
    </div>

    <div v-else-if="!walletClient || !account" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-sm text-yellow-700">Please connect your wallet to create a campaign</p>
    </div>

    <form @submit.prevent="handleCreate" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Campaign Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Help fund my project..."
          class="input-field w-full"
          :disabled="loading || !walletClient || !account || !FACTORY_ADDRESS"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Duration (days)</label>
        <input
          v-model="durationDays"
          type="number"
          min="1"
          max="365"
          placeholder="30"
          class="input-field w-full"
          :disabled="loading || !walletClient || !account || !FACTORY_ADDRESS"
          required
        />
      </div>

      <button
        type="submit"
        :disabled="loading || !walletClient || !account || !FACTORY_ADDRESS || !title"
        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Creating...' : 'Create Campaign' }}
      </button>

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    </form>
  </div>
</template>
