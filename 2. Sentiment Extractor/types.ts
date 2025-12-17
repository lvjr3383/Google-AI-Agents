export enum SentimentLabel {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
}

export interface WordImpact {
  word: string;
  impactScore: number; // 0 to 100
  reason: string;
}

export interface VectorPoint {
  x: number;
  y: number;
  label: string;
  isCurrent: boolean;
}

export interface SentimentAnalysis {
  signal: {
    label: SentimentLabel;
    confidenceScore: number; // 0.0 to 1.0
    metaphor: string;
  };
  mechanics: {
    tokens: string[];
    tokenIds: number[];
    subwords: string[];
    vectorSpaceDescription: string;
    // Simulated vector coordinates for visualization
    vectorCoordinates: VectorPoint[]; 
  };
  why: {
    highImpactWords: WordImpact[];
    nuanceExplanation: string;
    // New: Tracks the sentiment score (-10 to 10) accumulation token by token
    sentimentArc: number[]; 
  };
  lesson: {
    title: string;
    content: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export enum AnalysisStep {
  IDLE = 0,
  TOKENIZATION = 1,
  VECTOR_SPACE = 2,
  EXPLAINABILITY = 3,
  FINAL_SIGNAL = 4
}