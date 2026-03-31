<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract, getPublicClient } from '@/composables/useContract'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { useToast } from '@/composables/useToast'
import { FACTORY_ADDRESS } from '@/types/contract'
import type { Campaign, Donation } from '@/types/contract'
import ConnectButton from '@/components/ConnectButton.vue'
import CampaignStatus from '@/components/CampaignStatus.vue'
import DonateForm from '@/components/DonateForm.vue'
import DonationHistory from '@/components/DonationHistory.vue'

const props = defineProps<{
  address: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { walletClient, account, isConnected, switchToRSKTestnet } = useWallet()
const { loading, error, getCampaignData, getDonations, donate, withdraw, endCampaign, getCampaignTitleSingle } = useContract()
const toast = useToast()

const campaign = ref<Campaign | null>(null)
const campaignTitle = ref<string | null>(null)
const donations = ref<Donation[]>([])
const actionLoading = ref<string | null>(null)

const publicClientForRead = getPublicClient()

const { startPolling } = useAutoRefresh(async () => {
  if (!props.address) return
  await Promise.all([fetchCampaignData(), fetchDonations()])
}, 15000)

async function fetchCampaignData() {
  if (!publicClientForRead || !props.address) return
  try {
    campaign.value = await getCampaignData(publicClientForRead, props.address)
    campaignTitle.value = await getCampaignTitleSingle(publicClientForRead, FACTORY_ADDRESS, props.address)
  } catch (e) {
    console.error(e)
  }
}

async function fetchDonations() {
  if (!publicClientForRead || !props.address) return
  try {
    donations.value = await getDonations(publicClientForRead, props.address)
  } catch (e) {
    console.error(e)
  }
}

async function handleDonated() {
  await fetchCampaignData()
  await fetchDonations()
  toast.success('Donation made successfully!')
}

async function handleDonate(amount: string, message: string) {
  if (!walletClient.value || !account.value || !props.address) return false
  actionLoading.value = 'donate'
  try {
    const success = await donate(walletClient.value, account.value, props.address, message, amount)
    if (!success && error.value) {
      toast.error(error.value)
    }
    return success
  } finally {
    actionLoading.value = null
  }
}

async function handleWithdraw() {
  if (!walletClient.value || !account.value || !props.address) return false
  actionLoading.value = 'withdraw'
  try {
    const success = await withdraw(walletClient.value, account.value, props.address)
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
  if (!walletClient.value || !account.value || !props.address) return false
  actionLoading.value = 'end'
  try {
    const success = await endCampaign(walletClient.value, account.value, props.address)
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

const isCampaignCreator = computed(() => {
  return campaign.value && account.value && campaign.value.creator.toLowerCase() === account.value.toLowerCase()
})

const canEndCampaign = computed(() => {
  if (!campaign.value) return false
  return Date.now() >= Number(campaign.value.deadline) * 1000
})

const canWithdraw = computed(() => {
  if (!campaign.value) return false
  return !campaign.value.isActive && campaign.value.totalRaised > 0n
})

watch(isConnected, async (newValue) => {
  if (newValue) {
    await switchToRSKTestnet()
    await fetchCampaignData()
    await fetchDonations()
  }
})

onMounted(async () => {
  await fetchCampaignData()
  await fetchDonations()
  if (props.address) {
    startPolling()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-900 shadow-sm border-b border-orange-100 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-4">
            <button @click="emit('back')" class="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors dark:text-gray-300 dark:hover:text-orange-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 class="text-2xl font-bold text-orange-600 dark:text-orange-400">Campaign Details</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">RSK Testnet</p>
            </div>
          </div>
          <ConnectButton />
        </div>
        
        <!-- Campaign Address -->
        <div class="flex gap-2 items-center">
          <label class="text-sm font-medium text-gray-700">Campaign:</label>
          <input
            :value="address"
            type="text"
            class="input-field flex-1 font-mono text-sm"
            readonly
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading && !campaign" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-6 bg-red-50 border-red-200">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Campaign Details -->
      <div v-else class="space-y-6">
        <!-- Campaign Status -->
        <CampaignStatus v-if="campaign" :campaign="campaign" :title="campaignTitle" />

        <!-- Action Buttons for Creator -->
        <div v-if="campaign && isCampaignCreator" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-6">
            <h3 class="font-semibold mb-3">Creator Actions</h3>
            <div class="space-y-2">
              <button
                v-if="!campaign.ended && campaign.isActive"
                @click="handleEndCampaign"
                :disabled="actionLoading === 'end' || !canEndCampaign"
                class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg v-if="actionLoading === 'end'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ actionLoading === 'end' ? 'Ending...' : canEndCampaign ? 'End Campaign' : 'End Campaign (wait for deadline)' }}
              </button>
              <p v-if="!campaign.ended && campaign.isActive && !canEndCampaign" class="text-sm text-gray-500 dark:text-gray-400">
                Campaign is still active - you can end it after the deadline
              </p>
              <button
                v-if="canWithdraw"
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
              <p v-if="!campaign.isActive && campaign.totalRaised === 0n" class="text-sm text-gray-500 dark:text-gray-400">
                No funds to withdraw
              </p>
              <p v-if="campaign.isActive" class="text-sm text-gray-500 dark:text-gray-400">
                Campaign is still active - withdrawal available after deadline
              </p>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Donate Form -->
          <DonateForm 
            v-if="isConnected && campaign?.isActive" 
            @donated="handleDonated" 
            @submit-donate="handleDonate" 
          />
          
          <!-- Connect Wallet Prompt -->
          <div v-else-if="!isConnected && campaign?.isActive" class="card p-6 flex items-center justify-center min-h-[200px]">
            <div class="text-center">
              <p class="text-gray-600 mb-4">Connect your wallet to donate</p>
              <ConnectButton />
            </div>
          </div>
          
          <!-- Inactive Campaign Message -->
          <div v-else-if="campaign && !campaign.isActive" class="card p-6 flex items-center justify-center min-h-[200px]">
            <div class="text-center">
              <p class="text-gray-600">This campaign has ended</p>
              <p class="text-sm text-gray-500 mt-2">No more donations can be accepted</p>
            </div>
          </div>
          
          <!-- Donation History -->
          <DonationHistory :donations="donations" :loading="loading" />
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
  </div>
</template>