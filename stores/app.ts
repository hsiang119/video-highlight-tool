import { defineStore, acceptHMRUpdate } from 'pinia'

// 使用 Pinia Composition API 建立應用程式 store
export const useAppStore = defineStore('app', () => {
  // 組合其他 stores
  const transcriptStore = useTranscriptStore()
  const videoStore = useVideoStore()
  
  // 本地狀態
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastSaveTime = ref<Date | null>(null)
  
  // Getters - 組合多個 stores 的資料
  const projectStatus = computed(() => {
    if (!videoStore.hasVideo) return 'no-video'
    if (transcriptStore.sentences.length === 0) return 'no-transcript'
    if (transcriptStore.selectedSentences.length === 0) return 'no-selection'
    return 'ready'
  })
  
  const exportData = computed(() => ({
    videoUrl: videoStore.videoUrl,
    transcript: transcriptStore.sentences,
    sections: transcriptStore.sections,
    highlights: transcriptStore.highlightClips.map(clip => ({
      id: clip.id,
      start: clip.start,
      end: clip.end,
      text: clip.text
    })),
    exportTime: new Date().toISOString()
  }))
  
  // Actions
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }
  
  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }
  
  async function saveProject() {
    try {
      setLoading(true)
      setError(null)
      
      // 模擬保存到 localStorage
      const projectData = {
        video: {
          url: videoStore.videoUrl,
          duration: videoStore.duration
        },
        transcript: transcriptStore.sentences,
        sections: transcriptStore.sections,
        savedAt: new Date().toISOString()
      }
      
      localStorage.setItem('video-highlight-project', JSON.stringify(projectData))
      lastSaveTime.value = new Date()
      
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (err) {
      setError('保存失敗')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }
  
  async function loadProject() {
    try {
      setLoading(true)
      setError(null)
      
      const savedData = localStorage.getItem('video-highlight-project')
      if (!savedData) {
        throw new Error('找不到已保存的專案')
      }
      
      const projectData = JSON.parse(savedData)
      
      // 恢復資料到各個 stores
      if (projectData.video?.url) {
        videoStore.setVideoUrl(projectData.video.url)
        videoStore.setDuration(projectData.video.duration || 0)
      }
      
      if (projectData.transcript) {
        const selectedIds = projectData.transcript
          .filter((s: any) => s.isSelected)
          .map((s: any) => s.id)
        
        transcriptStore.setSentences(
          projectData.transcript.map((s: any) => ({
            id: s.id,
            start: s.start,
            end: s.end,
            text: s.text
          })),
          selectedIds
        )
      }
      
      if (projectData.sections) {
        transcriptStore.setSections(projectData.sections)
      }
      
      lastSaveTime.value = projectData.savedAt ? new Date(projectData.savedAt) : null
      
      return true
    } catch (err) {
      setError('載入失敗')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }
  
  function resetProject() {
    videoStore.reset()
    transcriptStore.clearAll()
    lastSaveTime.value = null
    error.value = null
  }
  
  // 使用 watchEffect 來自動保存
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  
  watchEffect(() => {
    // 當有選擇變更時，延遲自動保存
    if (transcriptStore.selectedSentences.length > 0 && videoStore.hasVideo) {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        saveProject()
      }, 3000) // 3 秒後自動保存
    }
  })
  
  // Cleanup
  onScopeDispose(() => {
    if (saveTimer) clearTimeout(saveTimer)
  })
  
  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastSaveTime: readonly(lastSaveTime),
    
    // Getters
    projectStatus,
    exportData,
    
    // Actions
    setLoading,
    setError,
    saveProject,
    loadProject,
    resetProject
  }
})

// 啟用 HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}