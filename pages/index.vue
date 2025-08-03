<script setup lang="ts">
import type { AiProcessingResult } from '~/types';

// Nuxt 3 auto-imports - Pinia stores 和其他 composables
const transcriptStore = useTranscriptStore()
const videoStore = useVideoStore()
const appConfig = useAppConfig()

// 拖拽分隔器相关的响应式变量
const containerRef = useTemplateRef<HTMLDivElement>('containerRef')
const leftPanelRef = useTemplateRef<HTMLDivElement>('leftPanelRef')
const rightPanelRef = useTemplateRef<HTMLDivElement>('rightPanelRef')
const dividerRef = useTemplateRef<HTMLDivElement>('dividerRef')
const isDragging = ref(false)
const dividerPosition = ref(50) // 分隔器位置百分比 (0-100)
let animationFrameId: number | null = null // 動畫幀 ID

// 手機版影片參照
const videoRef = ref<HTMLVideoElement | null>(null)

// 手機版播放控制
const play = () => {
  if (!videoRef.value) return;
  
  // 如果有選擇的片段，播放 highlights
  if (transcriptStore.highlightClips.length > 0) {
    videoStore.setPlayingHighlights(true);
    videoStore.setPlaying(true);
    // 播放第一個 highlight
    const firstClip = transcriptStore.highlightClips[0];
    videoRef.value.currentTime = firstClip.start;
    videoRef.value.play();
  } else {
    // 沒有選擇片段，播放完整影片
    videoStore.setPlayingHighlights(false);
    videoStore.setPlaying(true);
    videoRef.value.play();
  }
};

const pause = () => {
  if (!videoRef.value) return;
  videoRef.value.pause();
  videoStore.setPlaying(false);
  videoStore.setPlayingHighlights(false);
};

const previous = () => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence || !videoRef.value) return;
  
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  if (currentIndex > 0) {
    const prevSentence = transcriptStore.sentences[currentIndex - 1];
    videoRef.value.currentTime = prevSentence.start;
  }
};

const next = () => {
  const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime);
  if (!currentSentence || !videoRef.value) return;
  
  const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id);
  if (currentIndex < transcriptStore.sentences.length - 1) {
    const nextSentence = transcriptStore.sentences[currentIndex + 1];
    videoRef.value.currentTime = nextSentence.start;
  }
};

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

// 監聽影片時間更新
watch(videoRef, (newVideo) => {
  if (newVideo) {
    newVideo.addEventListener('timeupdate', () => {
      if (videoRef.value) {
        videoStore.updateCurrentTime(videoRef.value.currentTime);
      }
    });
    
    newVideo.addEventListener('loadedmetadata', () => {
      if (videoRef.value) {
        videoStore.setDuration(videoRef.value.duration);
      }
    });
    
    newVideo.addEventListener('play', () => videoStore.setPlaying(true));
    newVideo.addEventListener('pause', () => videoStore.setPlaying(false));
    newVideo.addEventListener('ended', () => {
      videoStore.setPlaying(false);
      videoStore.setPlayingHighlights(false);
    });
  }
}, { immediate: true });

// 使用 Nuxt 3 的 useHead 設定 SEO
useHead({
  title: appConfig.title,
  meta: [
    { name: 'description', content: appConfig.description }
  ]
})

// 使用 useSeoMeta 提供更豐富的 SEO 資訊
useSeoMeta({
  title: appConfig.title,
  description: appConfig.description,
  ogTitle: appConfig.title,
  ogDescription: appConfig.description,
  twitterCard: 'summary_large_image'
})

// 拖拽开始
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  document.body.classList.add('dragging-cursor')
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// 拖拽过程中
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !containerRef.value) return
  
  // 取消之前的動畫幀
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  
  // 使用 requestAnimationFrame 優化性能
  animationFrameId = requestAnimationFrame(() => {
    if (!containerRef.value) return
    
    const containerRect = containerRef.value.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const newPosition = (mouseX / containerRect.width) * 100
    
    // 設置拖拽限制：左右面板最小寬度為 320px (考虑间距)
    const minWidthPercent = (320 / containerRect.width) * 100
    const minPosition = minWidthPercent
    const maxPosition = 100 - minWidthPercent
    
    // 限制分隔器位置
    dividerPosition.value = Math.max(minPosition, Math.min(maxPosition, newPosition))
    animationFrameId = null
  })
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.body.classList.remove('dragging-cursor')
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 清理動畫幀
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

onUnmounted(() => {
  if (isDragging.value) {
    stopDrag()
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})

// 由 VideoUploader 觸發
const handleProcessingComplete = (payload: { videoUrl: string; duration?: number } & AiProcessingResult) => {
  videoStore.setVideoUrl(payload.videoUrl);
  if (payload.duration) {
    videoStore.setDuration(payload.duration);
  }
  transcriptStore.setSentences(payload.fullTranscript, payload.suggestedHighlights);
  transcriptStore.setSections(payload.sections);
};
</script>

<template>
  <main class="h-screen bg-gradient-tech overflow-hidden" :class="{ 'select-none': isDragging }">
    <!-- 上傳介面 -->
    <div v-if="!videoStore.hasVideo" class="h-full flex items-center justify-center p-6">
      <div class="text-center">
        <div class="glass rounded-2xl p-8 md:p-16 max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {{ appConfig.title }}
          </h1>
          <p class="text-lg md:text-xl mb-8 text-text-secondary">
            {{ appConfig.description }}
          </p>
          <VideoUploader @processing-complete="handleProcessingComplete" />
        </div>
      </div>
    </div>
    
    <!-- 桌面版佈局 (md 以上) -->
    <div v-else class="h-full overflow-hidden">
      <!-- 桌面版：左右分割 -->
      <div class="hidden md:grid h-full grid-rows-[auto_1fr] gap-5 p-5 overflow-hidden">
        <!-- 主要內容區 - 左右分割視窗 -->
        <div 
          class="flex gap-0 overflow-hidden min-h-0" 
          ref="containerRef"
        >
          <!-- 左側：文字稿編輯區 -->
          <div 
            ref="leftPanelRef"
            class="glass rounded-2xl flex flex-col overflow-hidden"
            :style="{ width: dividerPosition + '%' }"
          >
            <h2 class="text-2xl font-bold p-6 border-b border-primary/20 text-text-primary shrink-0">
              Transcript
            </h2>
            <div class="flex-1 overflow-y-auto p-6">
              <TranscriptEditor />
            </div>
          </div>

          <!-- 可拖拽的分隔器 -->
          <div 
            ref="dividerRef"
            class="w-5 hover:bg-primary/40 cursor-col-resize flex items-center justify-center group transition-colors duration-200 relative select-none"
            :class="{ 'bg-primary/60': isDragging, 'bg-primary/20': !isDragging }"
            @mousedown="startDrag"
          >
            <div 
              class="w-1 h-8 rounded-full transition-all duration-200"
              :class="{ 'bg-primary': isDragging, 'bg-primary/60 group-hover:bg-primary/80': !isDragging }"
            ></div>
          </div>

          <!-- 右側：影片預覽區 -->
          <div 
            ref="rightPanelRef"
            class="glass rounded-2xl flex flex-col overflow-hidden flex-1"
          >
            <h2 class="text-2xl font-bold p-6 border-b border-primary/20 text-text-primary shrink-0">
              Preview
            </h2>
            <div class="flex-1 p-6 flex flex-col overflow-hidden">
              <VideoPreview />
            </div>
          </div>
        </div>
      </div>

      <!-- 手機版佈局 (小於 md) -->
      <div class="md:hidden h-full flex flex-col overflow-hidden bg-slate-950">
        <!-- 影片播放器 (固定在最上方) -->
        <div class="w-full bg-black shrink-0 relative">
          <div class="aspect-video">
            <video 
              ref="videoRef"
              :src="videoStore.videoUrl || ''"
              class="w-full h-full object-contain"
            >
              您的瀏覽器不支援 video 標籤。
            </video>
          </div>
          
          <!-- 字幕覆蓋層 -->
          <div 
            v-if="transcriptStore.getCurrentSubtitle(videoStore.currentTime)" 
            class="text-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 text-center text-xs font-bold text-white px-2 py-1 bg-black/70 rounded"
          >
            {{ transcriptStore.getCurrentSubtitle(videoStore.currentTime) }}
          </div>
        </div>
        
        <!-- Transcript 區域 (可滾動，考慮底部控制欄高度) -->
        <div class="flex-1 overflow-y-auto pb-32">
          <div class="p-4">
            <h2 class="text-lg font-bold text-white mb-4">Transcript</h2>
            <TranscriptEditor />
          </div>
        </div>
        
        <!-- 底部播放控制 (固定在底部) -->
        <div class="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
          <!-- 進度條 -->
          <div class="px-4 pt-2">
            <ProgressBar
              :current-time="videoStore.currentTime"
              :duration="videoStore.duration"
              :segments="transcriptStore.sentences"
              @seek="(time) => { if (videoRef) videoRef.currentTime = time }"
            />
          </div>
          
          <!-- 播放控制按鈕 -->
          <div class="px-4 pb-safe">
            <PlayerControls
              :is-playing="videoStore.isPlaying"
              :can-go-previous="canGoPrevious"
              :can-go-next="canGoNext"
              :current-time="videoStore.currentTime"
              :duration="videoStore.duration"
              @play="play"
              @pause="pause"
              @previous="previous"
              @next="next"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>