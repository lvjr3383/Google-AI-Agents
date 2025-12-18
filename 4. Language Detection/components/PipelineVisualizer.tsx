
import React from 'react';
import { motion } from 'framer-motion';
import { PipelineStep, DetectionResult } from '../types';
import ClueHunt from './ClueHunt';
import LanguageMap from './LanguageMap';
import RacingBars from './RacingBars';
import Passport from './Passport';
import { ChevronRight, ChevronLeft, RefreshCcw } from 'lucide-react';

interface Props {
  step: PipelineStep;
  result: DetectionResult | null;
  inputText: string;
  eli5: boolean;
  confidenceThreshold: number;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

const PipelineVisualizer: React.FC<Props> = ({ step, result, inputText, eli5, confidenceThreshold, onNext, onPrev, onReset }) => {
  if (!result) return null;

  const renderContent = () => {
    switch (step) {
      case PipelineStep.CLUE_HUNT:
        return <ClueHunt text={inputText} clues={result.clues} />;
      case PipelineStep.NEIGHBORHOOD:
        return <LanguageMap family={result.family} language={result.language} />;
      case PipelineStep.TIE_BREAKER:
        return <RacingBars candidates={result.confusability} isGibberish={result.isGibberish} threshold={confidenceThreshold} />;
      case PipelineStep.PASSPORT:
        return <Passport result={result} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case PipelineStep.CLUE_HUNT: return "The Clue Hunt";
      case PipelineStep.NEIGHBORHOOD: return "The Neighborhood";
      case PipelineStep.TIE_BREAKER: return "The Tie-Breaker";
      case PipelineStep.PASSPORT: return "The Official Passport";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case PipelineStep.CLUE_HUNT: return "Scanning for unique fingerprints and patterns.";
      case PipelineStep.NEIGHBORHOOD: return "Plotting where these sounds live on the language map.";
      case PipelineStep.TIE_BREAKER: return "Comparing leading suspects side-by-side.";
      case PipelineStep.PASSPORT: return "The investigation is closed. Findings stamped.";
      default: return "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
          <p className="text-sm text-gray-500">{getStepDescription()}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onPrev}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          {step === PipelineStep.PASSPORT ? (
             <button 
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-bold"
              >
                <RefreshCcw size={18} />
                New Case
              </button>
          ) : (
            <button 
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-bold"
              >
                Continue
                <ChevronRight size={18} />
              </button>
          )}
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="bg-white min-h-[400px] p-10 rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default PipelineVisualizer;
