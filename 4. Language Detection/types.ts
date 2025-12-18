
export interface DetectionResult {
  language: string;
  confidence: number;
  clues: string[];
  family: string;
  confusability: { name: string; score: number }[];
  actionPacket: {
    isoCode: string;
    direction: 'LTR' | 'RTL';
    formattingRule: string;
    flag: string;
    actionDescription: string;
  };
  summary: string;
  isGibberish: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum PipelineStep {
  INPUT = 0,
  CLUE_HUNT = 1,
  NEIGHBORHOOD = 2,
  TIE_BREAKER = 3,
  PASSPORT = 4
}
