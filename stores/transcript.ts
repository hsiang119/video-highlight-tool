import { defineStore, acceptHMRUpdate } from 'pinia'
import type { Sentence, Section } from '~/types'

export interface TranscriptSentence extends Sentence {
  isSelected: boolean
}

export const useTranscriptStore = defineStore('transcript', () => {
  // State
  const sentences = ref<TranscriptSentence[]>([])
  const sections = ref<Section[]>([])

  // Getters
  const selectedSentences = computed(() => 
    sentences.value.filter(s => s.isSelected)
  )
  
  const highlightClips = computed(() => 
    sentences.value
      .filter(s => s.isSelected)
      .sort((a, b) => a.start - b.start)
  )
  
  const getSentencesBySection = (sectionTitle: string) => {
    const section = sections.value.find(s => s.title === sectionTitle)
    if (!section) return []
    
    return sentences.value.filter(sentence => 
      section.sentence_ids.includes(sentence.id)
    )
  }
  
  const getCurrentSentence = (currentTime: number) => {
    return sentences.value.find(
      s => currentTime >= s.start && currentTime <= s.end
    )
  }
  
  const getCurrentSubtitle = (currentTime: number) => {
    const activeSentence = sentences.value.find(
      s => s.isSelected && currentTime >= s.start && currentTime <= s.end
    )
    return activeSentence ? activeSentence.text : ''
  }

  // Actions
  function setSentences(newSentences: Sentence[], suggestedHighlights: string[] = []) {
    const suggestedSet = new Set(suggestedHighlights)
    sentences.value = newSentences.map(sentence => ({
      ...sentence,
      isSelected: suggestedSet.has(sentence.id),
    }))
  }
  
  function setSections(newSections: Section[]) {
    sections.value = newSections
  }
  
  function toggleSentence(sentenceId: string) {
    const sentence = sentences.value.find(s => s.id === sentenceId)
    if (sentence) {
      sentence.isSelected = !sentence.isSelected
    }
  }
  
  function clearAll() {
    sentences.value = []
    sections.value = []
  }

  // Return everything we want to expose
  return {
    // State
    sentences: readonly(sentences),
    sections: readonly(sections),
    
    // Getters
    selectedSentences,
    highlightClips,
    getSentencesBySection,
    getCurrentSentence,
    getCurrentSubtitle,
    
    // Actions
    setSentences,
    setSections,
    toggleSentence,
    clearAll
  }
})

// 啟用 HMR (Hot Module Replacement)
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTranscriptStore, import.meta.hot))
}