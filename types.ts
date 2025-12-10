
export interface Chunk {
  id: string;
  text: string;
  startWordIndex: number;
  endWordIndex: number;
  embedding?: number[];
  similarity?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'action-card';
  timestamp: number;
}

export interface ChunkingSettings {
  chunkSize: number;
  overlap: number;
}

export interface RagResult {
  question: string;
  preRagAnswer: string;
  ragAnswer: string;
  retrievedChunks: Chunk[];
  promptUsed: {
    preRag: string;
    rag: string;
  };
  tokenCounts?: {
    preRag: number;
    rag: number;
    context: number; // Granular count for context chunks only
  };
  loading: boolean;
  error?: string;
}

export enum RagStatus {
  IDLE = 'IDLE',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  RETRIEVING = 'RETRIEVING',
  GENERATING = 'GENERATING',
}

export interface LlmModel {
  id: string;
  name: string;
  contextLimit: number;
  isSimulated?: boolean;
}

export const AVAILABLE_MODELS: LlmModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextLimit: 1000000 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextLimit: 1000000 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextLimit: 2000000 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Sim)', contextLimit: 16385, isSimulated: true },
  { id: 'gpt-4o', name: 'GPT-4o (Sim)', contextLimit: 128000, isSimulated: true },
  { id: 'llama-3-8b', name: 'Llama 3 8B (Sim)', contextLimit: 8192, isSimulated: true },
];
