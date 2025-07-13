export interface Sentence {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface Section {
  title: string;
  sentence_ids: string[];
}

export interface AiProcessingResult {
  fullTranscript: Sentence[];
  sections: Section[];
  suggestedHighlights: string[];
}