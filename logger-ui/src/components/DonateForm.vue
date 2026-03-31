<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'donated'): void
  (e: 'submit-donate', amount: string, message: string): Promise<boolean>
}>()

const loading = ref(false)
const amount = ref('')
const message = ref('')

async function handleSubmit() {
  if (!amount.value) return
  
  loading.value = true
  const success = await emit('submit-donate', amount.value, message.value)
  loading.value = false
  
  if (success) {
    amount.value = ''
    message.value = ''
    emit('donated')
  }
}
</script>

<template>
  <div class="card p-6 animate-fade-in">
    <h2 class="text-xl font-bold mb-4 text-orange-600">Make a Donation</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Amount (tRBTC)</label>
        <input
          v-model="amount"
          type="number"
          step="0.000001"
          min="0.000001"
          placeholder="0.000007"
          class="input-field w-full"
          :disabled="loading"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Message (optional)</label>
        <textarea
          v-model="message"
          placeholder="Leave a message..."
          rows="3"
          class="input-field w-full"
          :disabled="loading"
        />
      </div>
      
      <button
        type="submit"
        :disabled="loading || !amount"
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ loading ? 'Processing...' : 'Donate' }}
      </button>
    </form>
  </div>
</template>
