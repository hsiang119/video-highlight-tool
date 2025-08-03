<script setup lang="ts">
interface Segment {
  id: string;
  start: number;
  end: number;
  isSelected: boolean;
}

const props = defineProps<{
  currentTime: number;
  duration: number;
  segments: readonly Segment[];
}>();

const emit = defineEmits<{
  seek: [time: number];
}>();

// 計算進度百分比
const progressPercentage = computed(() => {
  if (props.duration === 0) return 0;
  return (props.currentTime / props.duration) * 100;
});

// 計算 highlight 片段的位置
const highlightSegments = computed(() => {
  if (props.duration === 0) return [];
  
  return props.segments
    .filter(s => s.isSelected)
    .map(segment => ({
      left: (segment.start / props.duration) * 100,
      width: ((segment.end - segment.start) / props.duration) * 100
    }));
});

// 處理點擊進度條
const handleClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * props.duration;
  
  emit('seek', newTime);
};

// 格式化時間
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="w-full bg-slate-800 rounded-lg p-4">
    <!-- 進度條容器 -->
    <div 
      class="relative w-full h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
      @click="handleClick"
    >
      <!-- 當前播放進度 -->
      <div 
        class="absolute top-0 left-0 h-full bg-slate-500 transition-all duration-100"
        :style="{ width: `${progressPercentage}%` }"
      />
      
      <!-- Highlight 片段標記 -->
      <div 
        v-for="(segment, index) in highlightSegments"
        :key="index"
        class="absolute top-0 h-full bg-blue-500 opacity-60"
        :style="{
          left: `${segment.left}%`,
          width: `${segment.width}%`
        }"
      />
      
      <!-- 播放頭 -->
      <div 
        class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-100"
        :style="{ left: `calc(${progressPercentage}% - 6px)` }"
      />
    </div>
    
    <!-- 時間顯示 -->
    <div class="flex justify-between mt-2 text-xs text-slate-400">
      <span>{{ formatTime(currentTime) }}</span>
      <span>{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>