import type { Ref } from 'vue'

export const useMobilePlayer = (videoRef: Ref<HTMLVideoElement | null>) => {
  const transcriptStore = useTranscriptStore()
  const videoStore = useVideoStore()
  
  // 播放控制
  const play = () => {
    if (!videoRef.value) return
    
    // 如果有選擇的片段，播放 highlights
    if (transcriptStore.highlightClips.length > 0) {
      videoStore.setPlayingHighlights(true)
      videoStore.setPlaying(true)
      // 播放第一個 highlight
      const firstClip = transcriptStore.highlightClips[0]
      videoRef.value.currentTime = firstClip.start
      videoRef.value.play()
    } else {
      // 沒有選擇片段，播放完整影片
      videoStore.setPlayingHighlights(false)
      videoStore.setPlaying(true)
      videoRef.value.play()
    }
  }
  
  const pause = () => {
    if (!videoRef.value) return
    videoRef.value.pause()
    videoStore.setPlaying(false)
    videoStore.setPlayingHighlights(false)
  }
  
  const previous = () => {
    const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime)
    if (!currentSentence || !videoRef.value) return
    
    const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id)
    if (currentIndex > 0) {
      const prevSentence = transcriptStore.sentences[currentIndex - 1]
      videoRef.value.currentTime = prevSentence.start
    }
  }
  
  const next = () => {
    const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime)
    if (!currentSentence || !videoRef.value) return
    
    const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id)
    if (currentIndex < transcriptStore.sentences.length - 1) {
      const nextSentence = transcriptStore.sentences[currentIndex + 1]
      videoRef.value.currentTime = nextSentence.start
    }
  }
  
  // 計算屬性
  const canGoPrevious = computed(() => {
    const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime)
    if (!currentSentence) return false
    const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id)
    return currentIndex > 0
  })
  
  const canGoNext = computed(() => {
    const currentSentence = transcriptStore.getCurrentSentence(videoStore.currentTime)
    if (!currentSentence) return false
    const currentIndex = transcriptStore.sentences.findIndex(s => s.id === currentSentence.id)
    return currentIndex < transcriptStore.sentences.length - 1
  })
  
  // 處理 Highlight 時間更新
  const handleHighlightTimeUpdate = () => {
    const video = videoRef.value
    if (!video || !videoStore.isPlayingHighlights) return
    
    const currentClip = transcriptStore.highlightClips[videoStore.currentClipIndex]
    if (!currentClip) return
    
    if (video.currentTime >= currentClip.end) {
      if (videoStore.currentClipIndex < transcriptStore.highlightClips.length - 1) {
        // 播放下一個片段
        videoStore.setCurrentClipIndex(videoStore.currentClipIndex + 1)
        const nextClip = transcriptStore.highlightClips[videoStore.currentClipIndex]
        video.currentTime = nextClip.start
      } else {
        // 所有片段播放完畢
        pause()
      }
    }
  }
  
  // 設置影片事件監聽器
  const setupVideoListeners = () => {
    if (!videoRef.value) return
    
    videoRef.value.addEventListener('timeupdate', () => {
      if (videoRef.value) {
        videoStore.updateCurrentTime(videoRef.value.currentTime)
        handleHighlightTimeUpdate()
      }
    })
    
    videoRef.value.addEventListener('loadedmetadata', () => {
      if (videoRef.value) {
        videoStore.setDuration(videoRef.value.duration)
      }
    })
    
    videoRef.value.addEventListener('play', () => videoStore.setPlaying(true))
    videoRef.value.addEventListener('pause', () => videoStore.setPlaying(false))
    videoRef.value.addEventListener('ended', () => {
      videoStore.setPlaying(false)
      videoStore.setPlayingHighlights(false)
    })
  }
  
  // 清理事件監聽器
  const cleanupVideoListeners = () => {
    if (!videoRef.value) return
    
    // 注意：這裡我們不移除事件監聽器，因為 Vue 會自動處理
    // 如果需要手動清理，可以保存監聽器引用並在此處移除
  }
  
  // 監聽影片元素變化
  watch(videoRef, (newVideo, oldVideo) => {
    if (oldVideo) {
      cleanupVideoListeners()
    }
    if (newVideo) {
      setupVideoListeners()
    }
  })
  
  // 監聽 seekToTime 變化（來自 TranscriptEditor 的跳轉請求）
  watch(() => videoStore.seekToTime, (newTime) => {
    if (newTime !== null && videoRef.value) {
      videoRef.value.currentTime = newTime
    }
  })
  
  // 監聽影片 URL 變化
  watch(() => videoStore.videoUrl, (newUrl) => {
    if (newUrl && videoRef.value) {
      videoRef.value.src = newUrl
      videoRef.value.load()
    }
  })
  
  return {
    // 播放控制
    play,
    pause,
    previous,
    next,
    
    // 狀態
    canGoPrevious,
    canGoNext,
    
    // 設置方法
    setupVideoListeners,
    cleanupVideoListeners
  }
}