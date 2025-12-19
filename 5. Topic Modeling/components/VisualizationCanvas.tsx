
import React from 'react';
import { LabStage } from '../types';
import Preprocessing from './stages/Preprocessing';
import Vectorization from './stages/Vectorization';
import LDAIteration from './stages/LDAIteration';
import TopicAtlas from './stages/TopicAtlas';

interface VisualizationCanvasProps {
  stage: LabStage;
  isProcessing: boolean;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ stage, isProcessing }) => {
  return (
    <div className="w-full h-full glass rounded-3xl p-8 border border-slate-200 shadow-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] text-slate-400 font-mono-code uppercase tracking-widest z-50">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
        Analysis Active: {stage.replace('_', ' ')}
      </div>

      <div className="w-full h-full mt-4">
        {stage === LabStage.DISTILLATION && <Preprocessing />}
        {stage === LabStage.DICTIONARY && <Vectorization />}
        {stage === LabStage.ITERATION && <LDAIteration isProcessing={isProcessing} />}
        {stage === LabStage.ATLAS && <TopicAtlas />}
      </div>
    </div>
  );
};

export default VisualizationCanvas;
