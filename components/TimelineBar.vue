<script setup lang="ts">
// Nuxt 3 auto-imports
const transcriptStore = useTranscriptStore();
const videoStore = useVideoStore();

interface TranscriptItem {
  id: string;
  start: number;
  end: number;
  text: string;
  isSelected: boolean;
}

const props = defineProps<{
  videoElement: HTMLVideoElement | null;
  transcript: readonly TranscriptItem[];
}>();

const timelineRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);

// 計算進度百分比
const progressPercentage = computed(() => {
  if (videoStore.duration === 0) return 0;
  return (videoStore.currentTime / videoStore.duration) * 100;
});

// formatTime 從 utils/time.ts 自動引入

// 計算被選中片段的位置和寬度
const highlightSegments = computed(() => {
  if (videoStore.duration === 0) return [];
  
  return transcriptStore.selectedSentences
    .map(sentence => ({
      left: (sentence.start / videoStore.duration) * 100,
      width: ((sentence.end - sentence.start) / videoStore.duration) * 100
    }));
});

// 處理時間軸點擊
const handleTimelineClick = (event: MouseEvent) => {
  if (!timelineRef.value || !props.videoElement) return;
  
  const rect = timelineRef.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * videoStore.duration;
  
  props.videoElement.currentTime = newTime;
};

// 處理拖曳開始
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  handleTimelineClick(event);
};

// 處理拖曳移動
const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    handleTimelineClick(event);
  }
};

// 處理拖曳結束
const handleMouseUp = () => {
  isDragging.value = false;
};

// 更新時間
const updateTime = () => {
  if (props.videoElement) {
    videoStore.updateCurrentTime(props.videoElement.currentTime);
    videoStore.setDuration(props.videoElement.duration || 0);
  }
};

// 監聽視頻事件
onMounted(() => {
  if (props.videoElement) {
    props.videoElement.addEventListener('timeupdate', updateTime);
    props.videoElement.addEventListener('loadedmetadata', updateTime);
    updateTime();
  }
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  if (props.videoElement) {
    props.videoElement.removeEventListener('timeupdate', updateTime);
    props.videoElement.removeEventListener('loadedmetadata', updateTime);
  }
  
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<template>
  <div class="w-full">
    <!-- 時間軸容器 -->
    <div 
      ref="timelineRef"
      class="relative w-full h-8 bg-dark-tertiary/50 rounded-full cursor-pointer overflow-hidden"
      @mousedown="handleMouseDown"
    >
      <!-- 當前播放進度 -->
      <div 
        class="absolute top-0 left-0 h-full bg-primary/40 transition-all duration-100 rounded-full"
        :style="{ width: `${progressPercentage}%` }"
      />
      
      <!-- Highlight 片段標記 -->
      <div 
        v-for="(segment, index) in highlightSegments"
        :key="index"
        class="timeline-clip absolute top-0 h-full opacity-80"
        :style="{
          left: `${segment.left}%`,
          width: `${segment.width}%`
        }"
      />
      
      <!-- 播放頭 -->
      <div 
        class="absolute top-0 w-1 h-full bg-primary rounded-full shadow-glow"
        :style="{ left: `${progressPercentage}%` }"
      />
    </div>
    
    <!-- 時間顯示 -->
    <div class="flex justify-between mt-3 text-sm font-mono text-text-accent">
      <span>{{ formatTime(videoStore.currentTime) }}</span>
      <span>{{ formatTime(videoStore.duration) }}</span>
    </div>
  </div>
</template>