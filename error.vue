<script setup lang="ts">
// Nuxt 3 錯誤頁面
const props = defineProps<{
  error: {
    statusCode: number
    statusMessage: string
    message: string
  }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-tech">
    <div class="glass rounded-2xl p-8 max-w-md w-full text-center">
      <h1 class="text-6xl font-bold text-primary mb-4">{{ props.error.statusCode }}</h1>
      <h2 class="text-2xl font-semibold mb-2">{{ props.error.statusMessage }}</h2>
      <p class="text-text-secondary mb-6">{{ props.error.message }}</p>
      <button @click="handleError" class="btn btn-primary">
        返回首頁
      </button>
    </div>
  </div>
</template>