<script setup lang="ts">
// Props
const props = defineProps<{
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentTime: number;
  duration: number;
  playbackRate?: number;
}>();

// Emits
const emit = defineEmits<{
  play: [];
  pause: [];
  previous: [];
  next: [];
  changeSpeed: [speed: number];
}>();

// 播放速度選項
const speedOptions = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

// 當前播放速度
const currentSpeed = computed(() => props.playbackRate || 1);

// 取得當前速度的標籤
const currentSpeedLabel = computed(() => {
  const option = speedOptions.find(opt => opt.value === currentSpeed.value);
  return option ? option.label : '1.0x';
});

// Dropdown 的 ref
const dropdownRef = ref<HTMLDetailsElement | null>(null);

// 處理速度變更
const handleSpeedChange = (speed: number) => {
  emit('changeSpeed', speed);
  // 關閉 dropdown
  if (dropdownRef.value) {
    dropdownRef.value.removeAttribute('open');
  }
};

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
    
    <!-- 速度控制和時間顯示 -->
    <div class="flex items-center gap-4">
      <!-- 播放速度選擇器 -->
      <details ref="dropdownRef" class="dropdown dropdown-top dropdown-end">
        <summary class="btn btn-xs btn-ghost text-white hover:bg-slate-700 gap-1">
          <Icon name="mdi:speedometer" class="w-4 h-4" />
          <span>{{ currentSpeedLabel }}</span>
        </summary>
        <ul class="dropdown-content menu p-1 shadow bg-slate-700 rounded-box w-28 mb-2 z-50">
          <li v-for="option in speedOptions" :key="option.value">
            <button 
              @click="handleSpeedChange(option.value)"
              :class="{ 'active bg-primary': currentSpeed === option.value }"
              class="text-white text-sm py-1 hover:bg-slate-500 w-full text-left"
            >
              {{ option.label }}
            </button>
          </li>
        </ul>
      </details>
      
      <!-- 時間顯示 -->
      <div class="text-white text-sm font-mono">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>