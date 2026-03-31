<script setup lang="ts">
 
import { ref, onMounted, watch, computed } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract, getPublicClient } from '@/composables/useContract'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { useToast } from '@/composables/useToast'
import type { Campaign } from '@/types/contract'
import ConnectButton from '@/components/ConnectButton.vue'
import CampaignStatus from '@/components/CampaignStatus.vue'
import CreateCampaignModal from '@/components/CreateCampaignModal.vue'
import CampaignList from '@/components/CampaignList.vue'

const emit = defineEmits<{
  (e: 'select-campaign', address: string): void
}>()

const { walletClient, account, isConnected, switchToRSKTestnet } = useWallet()
const { loading, error, getCampaignData, withdraw, endCampaign } = useContract()
const toast = useToast()

const campaign = ref<Campaign | null>(null)
const contractAddress = ref('')
const showCreateModal = ref(false)
const actionLoading = ref<string | null>(null)

const publicClientForRead = getPublicClient()

const { startPolling, stopPolling } = useAutoRefresh(async () => {
  if (!contractAddress.value) return
  await fetchCampaignData()
}, 15000)

async function fetchCampaignData() {
  if (!publicClientForRead || !contractAddress.value) return
  try {
    campaign.value = await getCampaignData(publicClientForRead, contractAddress.value)
  } catch (e) {
    console.error(e)
  }
}

async function handleWithdraw() {
  if (!walletClient.value || !account.value || !contractAddress.value) return false
  actionLoading.value = 'withdraw'
  try {
    const success = await withdraw(walletClient.value, account.value, contractAddress.value)
    if (success) {
      toast.success('Funds withdrawn successfully!')
      await fetchCampaignData()
    } else {
      toast.error('Failed to withdraw funds')
    }
    return success
  } finally {
    actionLoading.value = null
  }
}

async function handleEndCampaign() {
  if (!walletClient.value || !account.value || !contractAddress.value) return false
  actionLoading.value = 'end'
  try {
    const success = await endCampaign(walletClient.value, account.value, contractAddress.value)
    if (success) {
      toast.success('Campaign ended successfully!')
      await fetchCampaignData()
    } else {
      toast.error('Failed to end campaign')
    }
    return success
  } finally {
    actionLoading.value = null
  }
}

async function handleCreated(newAddress: string) {
  contractAddress.value = newAddress
  showCreateModal.value = false
  await fetchCampaignData()
  toast.success('Campaign created successfully!')
}

function handleAddressChange() {
  fetchCampaignData()
}

function handleSelectCampaign(address: string) {
  contractAddress.value = address
  fetchCampaignData()
  emit('select-campaign', address)
}

const isCampaignCreator = computed(() => {
  return campaign.value && account.value && campaign.value.creator.toLowerCase() === account.value.toLowerCase()
})

watch(isConnected, async (newValue) => {
  if (newValue) {
    await switchToRSKTestnet()
  }
})

watch(contractAddress, (newValue) => {
  if (newValue) {
    startPolling()
  } else {
    stopPolling()
  }
})

onMounted(async () => {
  if (contractAddress.value) {
    await fetchCampaignData()
    startPolling()
  }
})

watch(isConnected, async (newValue) => {
  if (newValue) {
    await switchToRSKTestnet()
  }
})

watch(contractAddress, (newValue) => {
  if (newValue) {
    startPolling()
  } else {
    stopPolling()
  }
})

onMounted(async () => {
  if (contractAddress.value) {
    await fetchCampaignData()
    startPolling()
  }
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-card shadow-sm border-b border-border">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-primary">DonationLogger</h1>
            <p class="text-sm text-muted-foreground">RSK Testnet</p>
          </div>
          <ConnectButton />
        </div>
        
        <!-- Contract Address Input -->
        <div class="flex gap-2 items-center">
          <label class="text-sm font-medium text-foreground">Selected Campaign:</label>
          <input
            v-model="contractAddress"
            @change="handleAddressChange"
            type="text"
            class="input-field flex-1 font-mono text-sm"
            placeholder="Select a campaign from the list above..."
            readonly
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading && !campaign" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800">
        <p class="text-red-600 dark:text-red-200">{{ error }}</p>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <!-- Campaign List -->
        <div>
          <CampaignList 
            @select-campaign="handleSelectCampaign" 
            @create-campaign="showCreateModal = true" 
          />
        </div>

        <!-- Campaign Status (when selected) -->
        <div v-if="campaign">
          <CampaignStatus :campaign="campaign" />

          <!-- Action Buttons for Creator -->
          <div v-if="isCampaignCreator" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card p-6">
              <h3 class="font-semibold mb-3">Creator Actions</h3>
              <div class="space-y-2">
                <button
                  v-if="!campaign.ended && campaign.isActive"
                  @click="handleEndCampaign"
                  :disabled="actionLoading === 'end'"
                  class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg v-if="actionLoading === 'end'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {{ actionLoading === 'end' ? 'Ending...' : 'End Campaign' }}
                </button>
                <button
                  v-if="!campaign.isActive && campaign.totalRaised > 0n"
                  @click="handleWithdraw"
                  :disabled="actionLoading === 'withdraw'"
                  class="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg v-if="actionLoading === 'withdraw'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {{ actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw Funds' }}
                </button>
                <p v-if="!campaign.isActive && campaign.totalRaised === 0n" class="text-sm text-gray-500">
                  No funds to withdraw
                </p>
                <p v-if="campaign.isActive" class="text-sm text-gray-500">
                  Campaign is still active - creator can withdraw after deadline
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 mt-12">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-sm text-gray-500">
          Built on Rootstock • Deploy your own campaign or interact with existing ones
        </p>
      </div>
    </footer>

    <!-- Create Campaign Modal -->
    <CreateCampaignModal 
      :open="showCreateModal" 
      @close="showCreateModal = false"
      @created="handleCreated" 
    />
  </div>
</template>
