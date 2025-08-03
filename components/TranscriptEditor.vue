<script setup lang="ts">
const transcriptStore = useTranscriptStore();
const videoStore = useVideoStore();

// 存儲句子元素的引用
const sentenceRefs = ref<Map<string, HTMLElement>>(new Map());

const sentenceMap = computed(() => {
  const map = new Map<string, typeof transcriptStore.sentences[0]>();
  transcriptStore.sentences.forEach(sentence => {
    map.set(sentence.id, sentence);
  });
  return map;
});

// 設置句子元素引用
const setSentenceRef = (sentenceId: string, el: any) => {
  if (el) {
    sentenceRefs.value.set(sentenceId, el);
  } else {
    sentenceRefs.value.delete(sentenceId);
  }
};

// 處理時間點擊
const handleTimeClick = (time: number, sentenceId: string) => {
  videoStore.requestSeek(time);
  
  // 滾動到被點擊的句子
  const element = sentenceRefs.value.get(sentenceId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
};

// 處理句子選擇
const handleSentenceClick = (sentenceId: string) => {
  transcriptStore.toggleSentence(sentenceId);
};

// 判斷句子是否正在播放
const isPlaying = (sentence: typeof transcriptStore.sentences[0]): boolean => {
  return videoStore.currentTime >= sentence.start && videoStore.currentTime <= sentence.end;
};

// 當前播放的句子
const currentPlayingSentence = computed(() => {
  return transcriptStore.sentences.find(
    s => videoStore.currentTime >= s.start && videoStore.currentTime <= s.end
  );
});

// 監聽當前播放句子變化，自動滾動
watch(currentPlayingSentence, (newSentence, oldSentence) => {
  // 只在影片播放時自動滾動
  if (videoStore.isPlaying && newSentence && newSentence.id !== oldSentence?.id) {
    const element = sentenceRefs.value.get(newSentence.id);
    if (element) {
      // 平滑滾動到視野中央
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
});
</script>

<template>
  <div class="space-y-8">
    <!-- 遍歷各個段落 -->
    <div v-for="section in transcriptStore.sections" :key="section.title" class="space-y-4">
      <h3 class="text-xl font-bold text-primary mb-4 tracking-wide">{{ section.title }}</h3>
      
      <!-- 顯示該段落的句子 -->
      <div class="space-y-2">
        <template v-for="sentenceId in section.sentence_ids" :key="sentenceId">
          <div 
            v-if="sentenceMap.get(sentenceId)"
            :ref="(el) => setSentenceRef(sentenceId, el)"
            class="group cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-background-tertiary/30"
          :class="{
            'bg-primary/10 border-2 border-yellow-400 shadow-lg shadow-yellow-400/30': isPlaying(sentenceMap.get(sentenceId)!) && sentenceMap.get(sentenceId)!.isSelected,
            'bg-primary/10 border border-primary/50 shadow-glow': sentenceMap.get(sentenceId)!.isSelected && !isPlaying(sentenceMap.get(sentenceId)!),
            'bg-primary/5 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20': isPlaying(sentenceMap.get(sentenceId)!) && !sentenceMap.get(sentenceId)!.isSelected,
            'border border-transparent': !sentenceMap.get(sentenceId)!.isSelected && !isPlaying(sentenceMap.get(sentenceId)!)
          }"
          @click="handleSentenceClick(sentenceId)"
        >
          <div class="flex items-start gap-4">
            <!-- 時間戳記 -->
            <button
              class="flex-shrink-0 font-mono text-sm font-medium px-2 py-1 rounded transition-colors duration-200 min-w-[60px] text-center"
              :class="isPlaying(sentenceMap.get(sentenceId)!) 
                ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30' 
                : 'text-primary bg-primary/10 hover:bg-primary/20'"
              @click.stop="handleTimeClick(sentenceMap.get(sentenceId)!.start, sentenceId)"
            >
              {{ formatTime(sentenceMap.get(sentenceId)!.start) }}
            </button>
            
            <!-- 句子內容 -->
            <p class="flex-1 leading-relaxed text-text-primary group-hover:text-text-accent transition-colors duration-200">
              {{ sentenceMap.get(sentenceId)!.text }}
            </p>
          </div>
        </div>
        </template>
      </div>
    </div>
  </div>
</template>