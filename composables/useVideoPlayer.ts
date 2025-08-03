// Nuxt 3 auto-imports - computed 和 Ref 會自動引入
import type { Ref, ComputedRef } from 'vue';

interface TranscriptItem {
  id: string;
  start: number;
  end: number;
  text: string;
  isSelected: boolean;
}

export function useVideoPlayer(
  transcript: Ref<readonly TranscriptItem[]> | ComputedRef<readonly TranscriptItem[]>, 
  videoElement: Ref<HTMLVideoElement | null>
) {
  const videoStore = useVideoStore();
  const isTransitioning = ref(false);
  
  const highlightClips = computed(() => 
    transcript.value.filter(s => s.isSelected).sort((a, b) => a.start - b.start)
  );

  const playHighlights = () => {
    if (highlightClips.value.length === 0 || !videoElement.value) return;
    videoStore.setCurrentClipIndex(0);
    const firstClip = highlightClips.value[0];
    videoElement.value.currentTime = firstClip.start;
    videoElement.value.play();
  };

  const handleHighlightTimeUpdate = () => {
    const video = videoElement.value;
    if (!video || video.paused || isTransitioning.value) return;

    const currentClip = highlightClips.value[videoStore.currentClipIndex];
    if (!currentClip) return;
    
    // 在片段結束前 0.3 秒開始過渡
    const transitionTime = 0.3;
    const timeUntilEnd = currentClip.end - video.currentTime;
    
    if (timeUntilEnd <= transitionTime && timeUntilEnd > 0) {
      // 開始淡出效果（通過調整音量）
      video.volume = Math.max(0, timeUntilEnd / transitionTime);
    }
    
    if (video.currentTime >= currentClip.end) {
      if (videoStore.currentClipIndex < highlightClips.value.length - 1) {
        isTransitioning.value = true;
        
        // 平滑過渡到下一個片段
        videoStore.setCurrentClipIndex(videoStore.currentClipIndex + 1);
        const nextClip = highlightClips.value[videoStore.currentClipIndex];
        
        // 淡出當前片段
        video.volume = 0;
        
        // 跳轉到下一個片段
        video.currentTime = nextClip.start;
        
        // 淡入新片段
        setTimeout(() => {
          if (video) {
            // 漸進式增加音量
            let vol = 0;
            const fadeInInterval = setInterval(() => {
              vol += 0.1;
              if (vol >= 1) {
                video.volume = 1;
                clearInterval(fadeInInterval);
                isTransitioning.value = false;
              } else {
                video.volume = vol;
              }
            }, 30);
          }
        }, 50);
      } else {
        video.pause();
        video.volume = 1; // 恢復音量
        videoStore.setPlayingHighlights(false);
        videoStore.setPlaying(false);
      }
    }
  };
  
  return { playHighlights, handleHighlightTimeUpdate, highlightClips, isTransitioning };
}