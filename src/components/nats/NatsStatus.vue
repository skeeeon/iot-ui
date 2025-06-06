<!-- src/components/nats/NatsStatus.vue -->
<template>
  <div class="nats-status p-2 rounded-lg theme-transition" :class="statusClass">
    <div class="flex items-center">
      <div class="w-2 h-2 rounded-full mr-2" :class="statusIndicatorClass"></div>
      <div class="text-sm font-medium">{{ statusText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import natsService from '../../services/nats/natsService';

// Status state
const connectionStatus = ref('disconnected');
const statusListener = ref(null);

// Setup status listener
onMounted(() => {
  statusListener.value = (status) => {
    connectionStatus.value = status;
  };
  natsService.onStatusChange(statusListener.value);
});

// Clean up on unmount
onUnmounted(() => {
  // Remove status listener when component is unmounted
  if (statusListener.value) {
    natsService.removeStatusListener(statusListener.value);
  }
});

// Computed properties for display with theme-aware classes
const statusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': 
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'connecting': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'error': 
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
});

const statusIndicatorClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-blue-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
});

const statusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return 'NATS: Connected';
    case 'connecting': return 'NATS: Connecting';
    case 'error': return 'NATS: Error';
    default: return 'NATS: Disconnected';
  }
});
</script>

<style scoped>
.nats-status {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>
