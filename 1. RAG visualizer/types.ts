
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
