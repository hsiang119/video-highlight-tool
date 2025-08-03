// 使用 Nuxt 3 的 useAsyncData 來處理資料載入
import type { AiProcessingResult } from '~/types';

export const useVideoData = () => {
  const videoStore = useVideoStore()
  const transcriptStore = useTranscriptStore()
  
  // 使用 useAsyncData 處理影片資料
  const loadVideoData = async (videoId: string) => {
    const { data, pending, error, refresh } = await useAsyncData(
      `video-${videoId}`,
      () => $fetch<AiProcessingResult>(`/api/video/${videoId}`),
      {
        // Nuxt 3 options
        server: false, // 只在客戶端執行
        lazy: true,    // 延遲載入
        transform: (data) => {
          // 轉換資料並更新 stores
          transcriptStore.setSentences(data.fullTranscript, data.suggestedHighlights)
          transcriptStore.setSections(data.sections)
          return data
        }
      }
    )
    
    return { data, pending, error, refresh }
  }
  
  // 使用 refreshNuxtData 來刷新資料
  const refreshVideoData = async (videoId: string) => {
    await refreshNuxtData(`video-${videoId}`)
  }
  
  return {
    loadVideoData,
    refreshVideoData
  }
}