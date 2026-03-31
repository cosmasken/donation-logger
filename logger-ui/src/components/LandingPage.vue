<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import { useToast } from '@/composables/useToast'

const { connect, isConnecting } = useWallet()
const toast = useToast()

async function handleConnect() {
  const success = await connect()
  if (!success) {
    toast.error('Failed to connect wallet. Please install MetaMask.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-bitcoin-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bitcoin-grid opacity-30"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div class="text-center">
          <!-- Logo -->
          <div class="welcome-logo">
            <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transparent
            <span class="bg-gradient-to-r from-bitcoin-500 to-green-600 bg-clip-text text-transparent">
              Donation
            </span>
            <br />
            Campaigns on Rootstock
          </h1>

          <!-- Subtitle -->
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create and support donation campaigns with complete transparency on the blockchain. 
            Every donation is tracked, every campaign is verifiable.
          </p>

          <!-- CTA Button -->
          <button 
            @click="handleConnect"
            :disabled="isConnecting"
            class="btn-primary text-lg px-8 py-4 bitcoin-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isConnecting" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ isConnecting ? 'Connecting...' : 'Get Started' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Built on Rootstock for security, transparency, and trust
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="card text-center card-hover p-6">
            <div class="w-12 h-12 bg-gradient-to-br from-bitcoin-500 to-bitcoin-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Secure & Transparent
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              All donations are recorded on the blockchain, ensuring complete transparency and security.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="card text-center card-hover p-6">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Easy to Use
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Create campaigns in minutes and start receiving donations with just a few clicks.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="card text-center card-hover p-6">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Community Driven
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Connect with supporters and build a community around your cause or project.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- How it Works Section -->
    <div class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Simple steps to create and support campaigns
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-bitcoin-100 dark:bg-bitcoin-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-bitcoin-600 dark:text-bitcoin-400">1</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connect Wallet
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Connect your MetaMask or compatible wallet to get started.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Create Campaign
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Set up your campaign with a title, duration, and start collecting donations.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Share & Collect
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Share your campaign and watch donations come in transparently on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-300">
            Built on <span class="font-semibold text-bitcoin-500">Rootstock</span> • 
            Powered by transparency and trust
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
