<script setup lang="ts">
import { provideWallet } from '@/composables/useWallet'
import Dashboard from '@/components/Dashboard.vue'

// Provide wallet state globally so all components share the same connection state
provideWallet()
</script>

<template>
  <Dashboard />
</template>
