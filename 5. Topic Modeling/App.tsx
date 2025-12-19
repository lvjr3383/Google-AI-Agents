
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import VisualizationCanvas from './components/VisualizationCanvas';
import { LabStage, ChatMessage } from './types';
import { getAgentExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<LabStage>(LabStage.DISTILLATION);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'agent',
      content: "Welcome to the Topic Modeling Hub. I've processed 20 reviews to uncover hidden themes. Let's explore the key topics together.",
      timestamp: new Date()
    }
  ]);

  const addMessage = useCallback((role: 'agent' | 'user', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  }, []);

  const handleNextStage = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    let nextStage: LabStage;
    let userMsg = "";

    switch(stage) {
      case LabStage.DISTILLATION:
        nextStage = LabStage.DICTIONARY;
        userMsg = "Isolate semantic markers.";
        break;
      case LabStage.DICTIONARY:
        nextStage = LabStage.ITERATION;
        userMsg = "Analyze vector space.";
        break;
      case LabStage.ITERATION:
        nextStage = LabStage.ATLAS;
        userMsg = "Map final themes.";
        break;
      default:
        nextStage = LabStage.DISTILLATION;
        userMsg = "Initialize new analysis.";
    }

    addMessage('user', userMsg);
    
    try {
      // Transition delay for better "thinking" feel
      await new Promise(r => setTimeout(r, 600));
      
      // Update stage immediately so visualization updates
      setStage(nextStage);
      
      // Fetch AI explanation with a race to prevent hanging indefinitely
      const timeoutPromise = new Promise<string>((resolve) => 
        setTimeout(() => resolve("Thematic patterns detected and ready for final mapping."), 8000)
      );
      
      const explanation = await Promise.race([
        getAgentExplanation(nextStage),
        timeoutPromise
      ]);
      
      addMessage('agent', explanation);
    } catch (error) {
      console.error("Transition Error:", error);
      addMessage('agent', "Analysis complete. Clusters have been identified in the shared coordinate system.");
    } finally {
      // CRITICAL: Always reset loading state
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStage(LabStage.DISTILLATION);
    setIsProcessing(false);
    setMessages([{
      role: 'agent',
      content: "System reset. I'm ready to analyze a fresh set of cross-domain data.",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      <div className="w-[30%] h-full border-r border-slate-100 flex flex-col glass relative z-20 shadow-lg">
        <Sidebar 
          messages={messages} 
          currentStage={stage} 
          onNext={handleNextStage} 
          onReset={handleReset}
          isProcessing={isProcessing}
        />
      </div>

      <div className="w-[70%] h-full relative overflow-hidden flex items-center justify-center p-8 bg-slate-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 pointer-events-none"></div>
        <VisualizationCanvas stage={stage} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default App;
