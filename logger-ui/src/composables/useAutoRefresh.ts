import { ref, onUnmounted } from 'vue'

export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs = 10000) {
  const isPolling = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    if (intervalId) return
    isPolling.value = true
    intervalId = setInterval(fetchFn, intervalMs)
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isPolling.value = false
  }

  async function refresh() {
    await fetchFn()
  }

  onUnmounted(() => {
    stopPolling()
  })

  return {
    isPolling,
    startPolling,
    stopPolling,
    refresh
  }
}