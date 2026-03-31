<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import { FACTORY_ADDRESS } from '@/types/contract'
import Modal from './Modal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', address: string): void
}>()

watch(() => props.open, (newVal) => {
  if (newVal) {
    error.value = null
    success.value = false
  }
})

const { walletClient, account } = useWallet()
const { loading: contractLoading, error, createCampaign } = useContract()

const title = ref('')
const durationValue = ref(24)
const durationUnit = ref<'hours' | 'days'>('hours')
const success = ref(false)
const createdAddress = ref('')
const isSubmitting = ref(false)

const isLoading = computed(() => isSubmitting.value || contractLoading.value)

const minDuration = computed(() => {
  return durationUnit.value === 'hours' ? 1 : 1
})

const maxDuration = computed(() => {
  return durationUnit.value === 'hours' ? 24 * 365 : 365
})

async function handleCreate() {
  if (!walletClient.value || !account.value || !FACTORY_ADDRESS || !title.value) return

  const durationSeconds = durationUnit.value === 'hours' 
    ? Number(durationValue.value) * 3600 
    : Number(durationValue.value) * 86400

  isSubmitting.value = true
  try {
    const address = await createCampaign(
      walletClient.value, 
      account.value, 
      FACTORY_ADDRESS,
      durationSeconds,
      title.value
    )
    
    if (address) {
      success.value = true
      createdAddress.value = address
      emit('created', address)
    }
  } catch (err: unknown) {
    console.error('Campaign creation error:', err)
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  emit('close')
  title.value = ''
  durationValue.value = 24
  durationUnit.value = 'hours'
  success.value = false
  createdAddress.value = ''
  error.value = null
}

function copyAddress() {
  navigator.clipboard.writeText(createdAddress.value)
}
</script>

<template>
  <Modal :open="open" :title="success ? 'Campaign Created!' : 'Create New Campaign'" @close="handleClose">
    <!-- Success State -->
    <div v-if="success" class="text-center space-y-4">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Campaign Created Successfully!</h3>
        <p class="text-sm text-muted-foreground mb-4">Your campaign "{{ title }}" has been deployed.</p>
        
        <div class="bg-muted p-3 rounded-lg">
          <p class="text-xs text-muted-foreground mb-1">Contract Address:</p>
          <div class="flex items-center gap-2">
            <code class="text-sm font-mono text-foreground flex-1">{{ createdAddress }}</code>
            <button @click="copyAddress" class="text-primary hover:text-primary/80">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <p class="text-xs text-muted-foreground">This modal will close automatically in a few seconds...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center space-y-4">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Campaign Creation Failed</h3>
        <p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg">
          {{ error === 'Transaction was rejected' ? 'You rejected the transaction. Please try again.' : error }}
        </p>
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
      <div v-if="!FACTORY_ADDRESS" class="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded">
        <p class="text-sm text-red-600 dark:text-red-400">Factory contract not deployed yet</p>
      </div>

      <div v-else-if="!walletClient || !account" class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded">
        <p class="text-sm text-yellow-700 dark:text-yellow-400">Please connect your wallet to create a campaign</p>
      </div>

      <form v-else @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-foreground">Campaign Title</label>
          <input
            v-model="title"
            type="text"
            placeholder="Help fund my project..."
            class="input-field"
            :disabled="isLoading"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 text-foreground">Duration</label>
          <div class="flex gap-2 items-center">
            <input
              v-model="durationValue"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :min="minDuration"
              :max="maxDuration"
              class="input-field w-24 text-center"
              :disabled="isLoading"
              required
            />
            <select
              v-model="durationUnit"
              class="input-field w-16 text-center"
              :disabled="isLoading"
            >
              <option value="hours">Hrs</option>
              <option value="days">Days</option>
            </select>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Min: 1 hour, Max: 365 days
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <div class="flex items-center gap-3">
            <svg class="animate-spin w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span class="text-muted-foreground">Creating campaign...</span>
          </div>
        </div>

        <div v-else class="flex gap-3 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || !title"
            class="btn-primary flex-1"
          >
            {{ isLoading ? 'Creating...' : 'Create Campaign' }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>
