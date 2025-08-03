<script setup lang="ts">
// Nuxt 3 auto-imports - Vue APIs 和 stores 都會自動引入
const transcriptStore = useTranscriptStore();
const videoStore = useVideoStore();

const videoRef = ref<HTMLVideoElement | null>(null);
const playbackRate = ref(1); // 播放速度

// 使用 composable 處理影片播放邏輯
const { playHighlights: playHighlightsComposable, handleHighlightTimeUpdate, isTransitioning } = useVideoPlayer(
  computed(() => transcriptStore.sentences),
  videoRef
);

// 計算當前應顯示的字幕
const currentSubtitle = computed(() => transcriptStore.getCurrentSubtitle(videoStore.currentTime));

// 處理播放速度變更
const changePlaybackRate = (rate: number) => {
  playbackRate.value = rate;
  if (videoRef.value) {
    videoRef.value.playbackRate = rate;
  }
};

// 統一播放按鈕的邏輯
const play = () => {
  if (!videoRef.value) return;
  
  // 如果有選擇的片段，播放 highlights
  if (transcriptStore.highlightClips.length > 0) {
    videoStore.setPlayingHighlights(true);
    videoStore.setPlaying(true);
    playHighlightsComposable();
  } else {
    // 沒有選擇片段，播放完整影片
    videoStore.setPlayingHighlights(false);
    videoStore.setPlaying(true);
    videoRef.value.play();
  }
};

// 暂停播放
const pause = () => {
  if (!videoRef.value) return;
  videoRef.value.pause();
  videoStore.setPlaying(false);
  videoStore.setPlayingHighlights(false);
};

// 上一句
const previous = () => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence || !videoRef.value) return;
  
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  if (currentIndex > 0) {
    const prevSentence = transcriptStore.sentences[currentIndex - 1];
    videoRef.value.currentTime = prevSentence.start;
  }
};

// 下一句
const next = () => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence || !videoRef.value) return;
  
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  if (currentIndex < transcriptStore.sentences.length - 1) {
    const nextSentence = transcriptStore.sentences[currentIndex + 1];
    videoRef.value.currentTime = nextSentence.start;
  }
};

// 跳轉到指定時間
const seekTo = (time: number) => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = time;
};

// 計算是否可以上一句/下一句
const canGoPrevious = computed(() => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence) return false;
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  return currentIndex > 0;
});

const canGoNext = computed(() => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence) return false;
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  return currentIndex < transcriptStore.sentences.length - 1;
});

// 計算按鈕顯示文字
const playButtonText = computed(() => {
  const count = transcriptStore.highlightClips.length;
  if (count > 0) {
    return `播放 Highlights (${count})`;
  }
  return '播放';
});

// 計算是否正在播放
const isPlaying = computed(() => {
  return videoStore.isPlaying;
});

// 處理時間更新
const handleTimeUpdate = () => {
  if (!videoRef.value) return;
  
  const currentTime = videoRef.value.currentTime;
  videoStore.updateCurrentTime(currentTime);
  
  // 如果正在播放 highlights，使用 composable 處理
  if (videoStore.isPlayingHighlights) {
    handleHighlightTimeUpdate();
  }
};

// 監聽 seek 請求
watch(() => videoStore.seekToTime, (newTime) => {
  if (newTime !== null && videoRef.value) {
    videoRef.value.currentTime = newTime;
    // 當用戶點擊跳轉時，重置 highlight 播放狀態
    videoStore.setPlayingHighlights(false);
  }
});

// 監聽影片 URL
watch(() => videoStore.videoUrl, (newUrl) => {
  if (videoRef.value && newUrl) {
    videoRef.value.load();
  }
});

// formatTime 從 utils/time.ts 自動引入

onMounted(() => {
  if (videoRef.value) {
    // 設定初始播放速度
    videoRef.value.playbackRate = playbackRate.value;
    
    videoRef.value.addEventListener('timeupdate', handleTimeUpdate);
    // 監聽播放和暫停事件，確保按鈕狀態同步
    videoRef.value.addEventListener('play', () => videoStore.setPlaying(true));
    videoRef.value.addEventListener('pause', () => videoStore.setPlaying(false));
    videoRef.value.addEventListener('ended', () => {
      videoStore.setPlaying(false);
      videoStore.setPlayingHighlights(false);
    });
    // 監聽 loadedmetadata 事件來設定影片持續時間
    videoRef.value.addEventListener('loadedmetadata', () => {
      if (videoRef.value) {
        videoStore.setDuration(videoRef.value.duration);
        // 確保播放速度在影片載入後也被設定
        videoRef.value.playbackRate = playbackRate.value;
      }
    });
  }
});

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.removeEventListener('timeupdate', handleTimeUpdate);
    videoRef.value.removeEventListener('play', () => videoStore.setPlaying(true));
    videoRef.value.removeEventListener('pause', () => videoStore.setPlaying(false));
    videoRef.value.removeEventListener('ended', () => {
      videoStore.setPlaying(false);
      videoStore.setPlayingHighlights(false);
    });
    videoRef.value.removeEventListener('loadedmetadata', () => {
      if (videoRef.value) {
        videoStore.setDuration(videoRef.value.duration);
      }
    });
  }
});
</script>

<template>
  <!-- 只保留桌面版佈局 -->
  <div class="flex flex-col h-full gap-4 overflow-hidden">
    <!-- 影片播放器區域 -->
    <div class="flex-1 bg-black rounded-xl relative overflow-hidden min-h-0 aspect-video">
      <video 
        ref="videoRef"
        :src="videoStore.videoUrl || ''"
        class="w-full h-full object-contain"
      >
        您的瀏覽器不支援 video 標籤。
      </video>
      
      <!-- 過渡效果覆蓋層 -->
      <Transition name="fade">
        <div 
          v-if="isTransitioning" 
          class="absolute inset-0 bg-black/50 pointer-events-none transition-opacity duration-300"
        />
      </Transition>
      
      <!-- 字幕覆蓋層 -->
      <div 
        v-if="currentSubtitle" 
        class="text-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] absolute bottom-5 left-1/2 -translate-x-1/2 w-10/12 text-center text-sm font-bold text-white px-3 py-1 bg-black/70 rounded-lg z-10"
      >
        {{ currentSubtitle }}
      </div>
    </div>
    
    <!-- 控制面板 -->
    <div class="shrink-0 space-y-3">
      <!-- 播放控制按鈕 -->
      <PlayerControls
        :is-playing="isPlaying"
        :can-go-previous="canGoPrevious"
        :can-go-next="canGoNext"
        :current-time="videoStore.currentTime"
        :duration="videoStore.duration"
        :playback-rate="playbackRate"
        @play="play"
        @pause="pause"
        @previous="previous"
        @next="next"
        @change-speed="changePlaybackRate"
      />
      
      <!-- 進度條 -->
      <ProgressBar
        :current-time="videoStore.currentTime"
        :duration="videoStore.duration"
        :segments="transcriptStore.sentences"
        @seek="seekTo"
      />
    </div>
  </div>
</template>