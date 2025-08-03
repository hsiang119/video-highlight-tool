<script setup lang="ts">
// Props
const props = defineProps<{
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentTime: number;
  duration: number;
}>();

// Emits
const emit = defineEmits<{
  play: [];
  pause: [];
  previous: [];
  next: [];
}>();

// 格式化時間
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="flex items-center justify-between gap-4 bg-slate-800 rounded-lg px-4 py-2">
    <!-- 控制按鈕組 -->
    <div class="flex items-center gap-2">
      <!-- 上一句按鈕 -->
      <button 
        @click="$emit('previous')"
        :disabled="!canGoPrevious"
        class="p-1 grid place-content-center rounded-lg transition-colors"
        :class="canGoPrevious 
          ? 'hover:bg-slate-700 text-white' 
          : 'text-slate-500 cursor-not-allowed'"
      >
        <Icon name="mdi:skip-previous" class="w-5 h-5" />
      </button>
      
      <!-- 播放/暫停按鈕 -->
      <button 
        @click="isPlaying ? $emit('pause') : $emit('play')"
        class="p-1 grid place-content-center bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"
      >
        <Icon v-if="!isPlaying" name="mdi:play" class="w-5 h-5" />
        <Icon v-else name="mdi:pause" class="w-5 h-5" />
      </button>
      
      <!-- 下一句按鈕 -->
      <button 
        @click="$emit('next')"
        :disabled="!canGoNext"
        class="p-1 grid place-content-center rounded-lg transition-colors"
        :class="canGoNext 
          ? 'hover:bg-slate-700 text-white' 
          : 'text-slate-500 cursor-not-allowed'"
      >
        <Icon name="mdi:skip-next" class="w-5 h-5" />
      </button>
    </div>
    
    <!-- 時間顯示 -->
    <div class="text-white text-sm font-mono">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </div>
  </div>
</template>