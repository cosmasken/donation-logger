<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import type { Campaign, Donation } from '@/types/contract'
import { CONTRACT_ADDRESS } from '@/types/contract'
import ConnectButton from '@/components/ConnectButton.vue'
import CampaignStatus from '@/components/CampaignStatus.vue'
import DonateForm from '@/components/DonateForm.vue'
import DonationHistory from '@/components/DonationHistory.vue'
import DeployForm from '@/components/DeployForm.vue'

const { publicClient, walletClient, account, isConnected, switchToRSKTestnet } = useWallet()
const { loading, error, getCampaignData, getDonations, donate, withdraw, endCampaign, createCampaign } = useContract()

const campaign = ref<Campaign | null>(null)
const donations = ref<Donation[]>([])
const contractAddress = ref(CONTRACT_ADDRESS)
const showDeployForm = ref(false)

async function fetchCampaignData() {
  if (!publicClient.value || !contractAddress.value) return
  try {
    campaign.value = await getCampaignData(publicClient.value, contractAddress.value)
  } catch (e) {
    console.error(e)
  }
}

async function fetchDonations() {
  if (!publicClient.value || !contractAddress.value) return
  try {
    donations.value = await getDonations(publicClient.value, contractAddress.value)
  } catch (e) {
    console.error(e)
  }
}

async function handleDonated() {
  await fetchCampaignData()
  await fetchDonations()
}

async function handleDonate(amount: string, message: string) {
  if (!walletClient.value || !account.value || !contractAddress.value) return false
  return await donate(walletClient.value, account.value, contractAddress.value, message, amount)
}

async function handleWithdraw() {
  if (!walletClient.value || !account.value || !contractAddress.value) return false
  return await withdraw(walletClient.value, account.value, contractAddress.value)
}

async function handleEndCampaign() {
  if (!walletClient.value || !account.value || !contractAddress.value) return false
  return await endCampaign(walletClient.value, account.value, contractAddress.value)
}

async function handleCreated(newAddress: string) {
  contractAddress.value = newAddress
  showDeployForm.value = false
  await fetchCampaignData()
  await fetchDonations()
}

function handleAddressChange() {
  fetchCampaignData()
  fetchDonations()
}

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
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-orange-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-orange-600">DonationLogger</h1>
            <p class="text-sm text-gray-500">RSK Testnet</p>
          </div>
          <ConnectButton />
        </div>
        
        <!-- Contract Address Input -->
        <div class="flex gap-2 items-center">
          <label class="text-sm font-medium text-gray-700">Contract:</label>
          <input
            v-model="contractAddress"
            @change="handleAddressChange"
            type="text"
            class="input-field flex-1 font-mono text-sm"
            placeholder="0x..."
          />
          <button
            @click="showDeployForm = !showDeployForm"
            class="btn-primary text-sm"
          >
            {{ showDeployForm ? 'Close' : 'Create New' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Deploy Form -->
      <div v-if="showDeployForm" class="mb-6">
        <DeployForm @created="handleCreated" />
      </div>

      <!-- Loading State -->
      <div v-if="loading && !campaign" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-6 bg-red-50 border-red-200">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <!-- Campaign Status -->
        <CampaignStatus v-if="campaign" :campaign="campaign" />

        <!-- Action Buttons for Creator -->
        <div v-if="campaign && isConnected" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-6">
            <h3 class="font-semibold mb-3">Creator Actions</h3>
            <div class="space-y-2">
              <button
                v-if="!campaign.ended && !campaign.isActive"
                @click="handleEndCampaign"
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded font-semibold transition-colors"
              >
                End Campaign
              </button>
              <button
                v-if="!campaign.isActive && campaign.totalRaised > 0n"
                @click="handleWithdraw"
                class="btn-primary w-full"
              >
                Withdraw Funds
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

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Donate Form -->
          <DonateForm 
            v-if="isConnected && campaign?.isActive" 
            @donated="handleDonated" 
            @submit-donate="handleDonate" 
          />
          
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
