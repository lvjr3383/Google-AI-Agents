
export interface TripData {
  destination: string;
  month: string;
  duration: string;
  interests: string;
}

export enum PipelineStep {
  SETUP = 0,
  RETRIEVAL = 1,
  PLANNING = 2,
  STYLE = 3,
  OUTPUT = 4
}

export interface FactData {
  flight: { airline: string; route: string };
  food: { name: string; address: string };
  attraction: { name: string; description: string };
  groundingUrls: string[];
}

export interface TimelineDay {
  dayNumber: number;
  morning: string;
  afternoon: string;
}

export type TimelineData = TimelineDay[];

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  hasButtons?: boolean;
}

export interface StyleConfig {
  vocabulary: number;
  excitement: number;
  fantasy: boolean;
}

export interface LearnMoreContent {
  question: string;
  answer: string;
}

export interface ProbabilityOption {
  word: string;
  probability: number;
  color: string;
}
