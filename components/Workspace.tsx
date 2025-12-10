
import React from 'react';
import { Chunk, ChunkingSettings, RagResult, LlmModel } from '../types';
import ChunkingCard from './ChunkingCard';
import EmbeddingCard from './EmbeddingCard';
import ResultsCard from './ResultsCard';

interface Props {
  text: string;
  chunks: Chunk[];
  chunkSettings: ChunkingSettings;
  onChunkSettingsChange: (s: ChunkingSettings) => void;
  onChunkText: () => void;
  result: RagResult;
  questionEmbedding?: number[];
  topK: number;
  onTopKChange: (k: number) => void;
  selectedModel: LlmModel;
  onModelChange: (model: LlmModel) => void;
  llmEnabled: boolean;
  onLlmToggle: () => void;
  isProcessing: boolean;
}

const Workspace: React.FC<Props> = ({
  text,
  chunks,
  chunkSettings,
  onChunkSettingsChange,
  onChunkText,
  result,
  questionEmbedding,
  topK,
  onTopKChange,
  selectedModel,
  onModelChange,
  llmEnabled,
  onLlmToggle,
  isProcessing
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-slate-50">
      
      {/* 1. Chunking View */}
      <div className="h-[400px] min-h-[400px]">
        <ChunkingCard
            text={text}
            chunks={chunks}
            settings={chunkSettings}
            onSettingsChange={onChunkSettingsChange}
            onProcess={onChunkText}
            isProcessing={isProcessing}
        />
      </div>

      {/* 2. Embeddings View */}
      <div className="h-[400px] min-h-[400px]">
         <EmbeddingCard 
            chunks={chunks} 
            question={result.question}
            questionEmbedding={questionEmbedding}
            isProcessing={isProcessing}
         />
      </div>

      {/* 3. Results View */}
      <div className="h-[400px] min-h-[400px]">
        <ResultsCard
            result={result}
            topK={topK}
            onTopKChange={onTopKChange}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            llmEnabled={llmEnabled}
            onLlmToggle={onLlmToggle}
        />
      </div>
      
      <div className="h-10"></div> {/* Spacer */}
    </div>
  );
};

export default Workspace;
