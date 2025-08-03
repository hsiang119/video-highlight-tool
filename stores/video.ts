import { defineStore, acceptHMRUpdate } from 'pinia'

export const useVideoStore = defineStore('video', () => {
  // State
  const videoUrl = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(false)
  const isPlayingHighlights = ref(false)
  const currentClipIndex = ref(0)
  const seekToTime = ref<number | null>(null)
  const playbackRate = ref(1)

  // Getters
  const hasVideo = computed(() => !!videoUrl.value)
  
  const playbackProgress = computed(() => 
    duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  )

  // Actions
  function setVideoUrl(url: string) {
    videoUrl.value = url
  }
  
  function updateCurrentTime(time: number) {
    currentTime.value = time
  }
  
  function setDuration(newDuration: number) {
    duration.value = newDuration
  }
  
  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }
  
  function setPlayingHighlights(playing: boolean) {
    isPlayingHighlights.value = playing
  }
  
  function setCurrentClipIndex(index: number) {
    currentClipIndex.value = index
  }
  
  function requestSeek(time: number) {
    seekToTime.value = time
    // Clear seekToTime after a short delay
    setTimeout(() => {
      seekToTime.value = null
    }, 50)
  }
  
  function setPlaybackRate(rate: number) {
    playbackRate.value = rate
  }
  
  function reset() {
    videoUrl.value = null
    currentTime.value = 0
    duration.value = 0
    isPlaying.value = false
    isPlayingHighlights.value = false
    currentClipIndex.value = 0
    seekToTime.value = null
    playbackRate.value = 1
  }

  // Return everything we want to expose
  return {
    // State
    videoUrl: readonly(videoUrl),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    isPlaying: readonly(isPlaying),
    isPlayingHighlights: readonly(isPlayingHighlights),
    currentClipIndex: readonly(currentClipIndex),
    seekToTime: readonly(seekToTime),
    playbackRate: readonly(playbackRate),
    
    // Getters
    hasVideo,
    playbackProgress,
    
    // Actions
    setVideoUrl,
    updateCurrentTime,
    setDuration,
    setPlaying,
    setPlayingHighlights,
    setCurrentClipIndex,
    requestSeek,
    setPlaybackRate,
    reset
  }
})

// 啟用 HMR (Hot Module Replacement)
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVideoStore, import.meta.hot))
}