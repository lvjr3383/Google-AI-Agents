
import React, { useState } from 'react';
import { PipelineStep, ChatMessage, FlavorType } from './types';
import ChatPanel from './components/ChatPanel';
import WorkspacePanel from './components/WorkspacePanel';
import { getGeminiResponse, askQuestion } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PipelineStep>(PipelineStep.INITIALIZATION);
  const [inputText, setInputText] = useState('');
  const [flavor, setFlavor] = useState<FlavorType>('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentStepData, setCurrentStepData] = useState<any>(null);

  const startDistillation = async (text: string, selectedFlavor: FlavorType) => {
    setInputText(text);
    setFlavor(selectedFlavor);
    setIsLoading(true);
    
    try {
      const response = await getGeminiResponse(1, text, selectedFlavor);
      const msg: ChatMessage = {
        role: 'assistant',
        content: response.chat_explanation,
        isPipelineStep: true
      };
      setHistory([msg]);
      setCurrentStepData(response);
      setCurrentStep(PipelineStep.SCOPE_CONTEXT);
    } catch (error) {
      console.error("Error during Step 1:", error);
      alert("Failed to initialize distillation.");
      setCurrentStep(PipelineStep.INITIALIZATION);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === PipelineStep.ESSENCE) return;

    const nextStepVal = (currentStep + 1) as PipelineStep;
    setIsLoading(true);
    
    try {
      const response = await getGeminiResponse(nextStepVal, inputText, flavor);
      const msg: ChatMessage = {
        role: 'assistant',
        content: response.chat_explanation,
        isPipelineStep: true
      };
      setHistory(prev => [...prev, msg]);
      setCurrentStepData(response);
      setCurrentStep(nextStepVal);
    } catch (error) {
      console.error(`Error during Step ${nextStepVal}:`, error);
      alert(`Pipeline error at Step ${nextStepVal}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (q: string) => {
    // Add user question to chat
    setHistory(prev => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);

    try {
      const answer = await askQuestion(q, currentStep, currentStepData);
      setHistory(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error("Error asking question:", error);
      setHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't process that question right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 overflow-hidden font-sans">
      <ChatPanel 
        history={history}
        isLoading={isLoading}
        onNext={handleNextStep}
        onAsk={handleAskQuestion}
        showNext={currentStep !== PipelineStep.INITIALIZATION && currentStep !== PipelineStep.ESSENCE}
        isInitial={currentStep === PipelineStep.INITIALIZATION}
        onStart={startDistillation}
        currentStep={currentStep}
      />
      
      <WorkspacePanel 
        currentStep={currentStep}
        data={currentStepData}
        inputText={inputText}
      />
    </div>
  );
};

export default App;
