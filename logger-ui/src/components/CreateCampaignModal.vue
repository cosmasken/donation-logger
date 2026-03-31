<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import { FACTORY_ADDRESS } from '@/types/contract'
import Modal from './Modal.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', address: string): void
}>()

const { walletClient, account } = useWallet()
const { loading, error, createCampaign } = useContract()

const title = ref('')
const durationDays = ref(30)
const success = ref(false)
const createdAddress = ref('')

async function handleCreate() {
  if (!walletClient.value || !account.value || !FACTORY_ADDRESS || !title.value) return

  try {
    const address = await createCampaign(
      walletClient.value, 
      account.value, 
      FACTORY_ADDRESS,
      durationDays.value,
      title.value
    )
    
    if (address) {
      success.value = true
      createdAddress.value = address
      // Auto close success modal after 3 seconds
      setTimeout(() => {
        handleClose()
        emit('created', address)
      }, 3000)
    }
  } catch (err) {
    console.error('Campaign creation error:', err)
  }
}

function handleClose() {
  emit('close')
  // Reset all state
  title.value = ''
  durationDays.value = 30
  success.value = false
  createdAddress.value = ''
}

function copyAddress() {
  navigator.clipboard.writeText(createdAddress.value)
}
</script>

<template>
  <Modal :open="open" :title="success ? 'Campaign Created!' : 'Create New Campaign'" @close="handleClose">
    <!-- Success State -->
    <div v-if="success" class="text-center space-y-4">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Campaign Created Successfully!</h3>
        <p class="text-sm text-gray-600 mb-4">Your campaign "{{ title }}" has been deployed.</p>
        
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Contract Address:</p>
          <div class="flex items-center gap-2">
            <code class="text-sm font-mono text-gray-800 flex-1">{{ createdAddress }}</code>
            <button @click="copyAddress" class="text-orange-500 hover:text-orange-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <p class="text-xs text-gray-500">This modal will close automatically in a few seconds...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center space-y-4">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Campaign Creation Failed</h3>
        <p class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ error }}</p>
      </div>
      
      <div class="flex gap-3">
        <button @click="handleClose" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Close
        </button>
        <button @click="error = null" class="flex-1 btn-primary">
          Try Again
        </button>
      </div>
    </div>

    <!-- Form State -->
    <div v-else>
      <div v-if="!FACTORY_ADDRESS" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
        <p class="text-sm text-red-700">Factory contract not deployed yet</p>
      </div>

      <div v-else-if="!walletClient || !account" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm text-yellow-700">Please connect your wallet to create a campaign</p>
      </div>

      <form v-else @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">Campaign Title</label>
          <input
            v-model="title"
            type="text"
            placeholder="Help fund my project..."
            class="input-field"
            :disabled="loading"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">Duration (days)</label>
          <input
            v-model="durationDays"
            type="number"
            min="1"
            max="365"
            class="input-field"
            :disabled="loading"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Campaign will run for this many days (max 365)</p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !title"
            class="btn-primary flex-1"
          >
            {{ loading ? 'Creating...' : 'Create Campaign' }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>
