<script setup lang="ts">
import type { AiProcessingResult } from '~/types'

// Pinia stores
const transcriptStore = useTranscriptStore()
const videoStore = useVideoStore()

// 手機版影片參照
const mobileVideoRef = ref<HTMLVideoElement | null>(null)

// 手機版播放控制
const { play, pause, previous, next, canGoPrevious, canGoNext } = useMobilePlayer(mobileVideoRef)

// Seek 方法
const seek = (time: number) => {
  if (mobileVideoRef.value) {
    mobileVideoRef.value.currentTime = time
  } else {
    // 如果手機版影片不存在，使用 store 的 requestSeek
    videoStore.requestSeek(time)
  }
}

// 處理播放速度變更
const handleChangeSpeed = (speed: number) => {
  videoStore.setPlaybackRate(speed)
  if (mobileVideoRef.value) {
    mobileVideoRef.value.playbackRate = speed
  }
}

// 監聽播放速率變化
watch(() => videoStore.playbackRate, (newRate) => {
  if (mobileVideoRef.value) {
    mobileVideoRef.value.playbackRate = newRate
  }
})

// 處理影片上傳完成
const handleProcessingComplete = (payload: { videoUrl: string; duration?: number } & AiProcessingResult) => {
  // 設定影片資訊
  videoStore.setVideoUrl(payload.videoUrl)
  if (payload.duration) {
    videoStore.setDuration(payload.duration)
  }
  
  // 設定文字稿和章節
  transcriptStore.setSentences(payload.fullTranscript, payload.suggestedHighlights)
  transcriptStore.setSections(payload.sections)
}

// SEO Meta
useHead({
  title: '影片 Highlight 工具',
  meta: [
    { name: 'description', content: 'AI 驅動的智慧影片剪輯工具' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>

<template>
  <main class="h-screen bg-gradient-tech overflow-hidden">
    <!-- 影片未上傳時顯示上傳元件 -->
    <div v-if="!videoStore.hasVideo" class="h-full flex items-center justify-center p-6">
      <div class="text-center">
        <div class="glass rounded-2xl p-8 md:p-16 max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            影片 Highlight 工具
          </h1>
          <p class="text-lg md:text-xl mb-8 text-text-secondary">
            AI 驅動的智慧影片剪輯工具
          </p>
          <VideoUploader @processing-complete="handleProcessingComplete" />
        </div>
      </div>
    </div>
    
    <!-- 影片已上傳後的編輯介面 -->
    <div v-else class="h-full overflow-hidden">
      <!-- 桌面版佈局 -->
      <div class="hidden md:flex gap-5 p-5 h-full">
        <!-- 左側：文字稿編輯區 -->
        <div class="w-2/5 glass rounded-2xl flex flex-col overflow-hidden">
          <h2 class="text-2xl font-bold p-6 border-b border-primary/20 text-text-primary shrink-0">
            Transcript
          </h2>
          <div class="flex-1 overflow-y-auto p-6">
            <TranscriptEditor />
          </div>
        </div>
        
        <!-- 右側：影片預覽區 -->
        <div class="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
          <h2 class="text-2xl font-bold p-6 border-b border-primary/20 text-text-primary shrink-0">
            Preview
          </h2>
          <div class="flex-1 p-6 flex flex-col overflow-hidden">
            <VideoPreview />
          </div>
        </div>
      </div>
      
      <!-- 手機版佈局 -->
      <div class="md:hidden h-full flex flex-col bg-black">
        <!-- 影片播放器 (固定在最上方) -->
        <div class="w-full bg-black shrink-0">
          <div class="aspect-video relative">
            <!-- 手機版影片播放器 -->
            <video 
              ref="mobileVideoRef"
              :src="videoStore.videoUrl || ''"
              class="w-full h-full object-contain"
              :playbackRate="videoStore.playbackRate"
            >
              您的瀏覽器不支援 video 標籤。
            </video>
            
            <!-- 字幕覆蓋層 -->
            <div 
              v-if="transcriptStore.getCurrentSubtitle(videoStore.currentTime)" 
              class="absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 text-center text-xs font-bold text-white px-2 py-1 bg-black/70 rounded"
            >
              {{ transcriptStore.getCurrentSubtitle(videoStore.currentTime) }}
            </div>
          </div>
        </div>
        
        <!-- Transcript 區域 (可滾動，考慮底部控制欄高度) -->
        <div class="flex-1 overflow-y-auto bg-slate-950 pb-32">
          <div class="p-4">
            <h2 class="text-lg font-bold text-white mb-4">Transcript</h2>
            <TranscriptEditor />
          </div>
        </div>
        
        <!-- 底部固定控制欄 -->
        <div class="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
          <!-- 進度條 -->
          <div class="p-4">
            <ProgressBar 
              :current-time="videoStore.currentTime"
              :duration="videoStore.duration"
              :segments="transcriptStore.sentences"
              @seek="seek"
            />
          </div>
          
          <!-- 播放控制按鈕 -->
          <div class="pb-4 px-4 pb-safe">
            <PlayerControls 
              :is-playing="videoStore.isPlaying"
              :can-go-previous="canGoPrevious"
              :can-go-next="canGoNext"
              :current-time="videoStore.currentTime"
              :duration="videoStore.duration"
              :playback-rate="videoStore.playbackRate"
              @play="play"
              @pause="pause"
              @previous="previous"
              @next="next"
              @change-speed="handleChangeSpeed"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>