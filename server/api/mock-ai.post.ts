import { defineEventHandler } from 'h3';
import type { Sentence, Section, AiProcessingResult } from '~/types';

// --- 基於圖片內容的靜態 Mock Data ---

const MOCK_TRANSCRIPT: Sentence[] = [
  { id: 's1', start: 0, end: 4, text: 'Welcome to our product demonstration.' },
  { id: 's2', start: 5, end: 10, text: "Today, we'll be showcasing our latest innovation." },
  { id: 's3', start: 15, end: 19, text: 'Our product has three main features.' },
  { id: 's4', start: 20, end: 24, text: "First, it's incredibly easy to use." },
  { id: 's5', start: 25, end: 29, text: "Second, it's highly efficient." },
  { id: 's6', start: 30, end: 34, text: "And third, it's cost-effective." },
  { id: 's7', start: 40, end: 44, text: 'Let me show you how it works.' },
  { id: 's8', start: 45, end: 49, text: 'Simply press this button to start.' },
  { id: 's9', start: 50, end: 54, text: 'The interface is intuitive and user-friendly.' },
  { id: 's10', start: 60, end: 64, text: 'In conclusion, our product is a game-changer.' },
  { id: 's11', start: 65, end: 69, text: "We're excited to bring this to market." },
  { id: 's12', start: 70, end: 74, text: 'Thank you for your attention.' },
];

const MOCK_SECTIONS: Section[] = [
    {
        title: 'Introduction',
        sentence_ids: ['s1', 's2']
    },
    {
        title: 'Key Features',
        sentence_ids: ['s3', 's4', 's5', 's6']
    },
    {
        title: 'Demonstration',
        sentence_ids: ['s7', 's8', 's9']
    },
    {
        title: 'Conclusion',
        sentence_ids: ['s10', 's11', 's12']
    }
];

// 不預設選中任何句子
const MOCK_SUGGESTED_HIGHLIGHTS: string[] = [];


export default defineEventHandler(async (event): Promise<AiProcessingResult> => {
  // 模擬非同步處理延遲
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    fullTranscript: MOCK_TRANSCRIPT,
    sections: MOCK_SECTIONS,
    suggestedHighlights: MOCK_SUGGESTED_HIGHLIGHTS,
  };
});