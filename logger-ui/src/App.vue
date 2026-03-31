<script setup lang="ts">
import { ref, computed } from 'vue'
import { provideWallet, useWallet } from '@/composables/useWallet'
import Dashboard from '@/components/Dashboard.vue'
import CampaignDetails from '@/components/CampaignDetails.vue'
import LandingPage from '@/components/LandingPage.vue'
import ToastContainer from '@/components/ToastContainer.vue'

provideWallet()

const { isConnected } = useWallet()

const currentView = ref<'landing' | 'dashboard' | 'campaign'>('landing')
const selectedCampaignAddress = ref('')

function goToDashboard() {
  currentView.value = 'dashboard'
  selectedCampaignAddress.value = ''
}

function goToCampaignDetails(address: string) {
  selectedCampaignAddress.value = address
  currentView.value = 'campaign'
}

const computedView = computed(() => {
  if (!isConnected.value) return 'landing'
  if (currentView.value === 'landing') return 'dashboard'
  return currentView.value
})
</script>

<template>
  <div id="app">
    <LandingPage v-if="computedView === 'landing'" />
    <Dashboard 
      v-else-if="computedView === 'dashboard'" 
      @select-campaign="goToCampaignDetails" 
    />
    <CampaignDetails 
      v-else-if="computedView === 'campaign'" 
      :address="selectedCampaignAddress"
      @back="goToDashboard"
    />
    <ToastContainer />
  </div>
</template>
