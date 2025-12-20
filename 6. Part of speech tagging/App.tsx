
import React, { useState, useCallback } from 'react';
import ChatPanel from './components/ChatPanel';
import Workspace from './components/Workspace';
import { analyzeText } from './geminiService';
import { Message, AnalysisResult, AnalysisStep } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello, I am Agent POS! I help you understand English grammar by breaking down sentences into their core components. I can identify parts of speech, find the root of your sentences, and visualize how your words work together. Ready to try? Just send me a sentence!' 
    }
  ]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | undefined>();
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('input');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setCurrentStep('input');
    setActiveAnalysis(undefined);

    try {
      const result = await analyzeText(text);
      setActiveAnalysis(result);
      
      if (!result.isInputValid) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.validationMessage || "I couldn't analyze that. Please try a standard English sentence between 10 and 60 tokens."
        }]);
        setIsLoading(false);
        return;
      }

      setCurrentStep('tokenize');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Step 1 · Tokenize: I've isolated the 'tokens' and their 'lemmas' (dictionary base forms). Check the table in the workspace to see the foundation!"
      }]);
    } catch (error) {
      console.error("Analysis failed:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try a different sentence!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProceed = useCallback(() => {
    if (!activeAnalysis) return;

    if (currentStep === 'tokenize') {
      setCurrentStep('tag');
      setMessages(prev => [...prev, 
        { role: 'user', content: "Proceed to Tagging", isStepAction: true },
        { 
          role: 'assistant', 
          content: `Step 2 · Tag: I've added Part of Speech roles and linked each word to its head. ${activeAnalysis.tagExplanations}`
        }
      ]);
    } else if (currentStep === 'tag') {
      setCurrentStep('aggregate');
      setMessages(prev => [...prev, 
        { role: 'user', content: "Visualize Counts", isStepAction: true },
        { 
          role: 'assistant', 
          content: "Step 3 · Aggregate: I've summarized the grammar distribution into a chart below. This highlights the most common word types in your sentence."
        }
      ]);
    } else if (currentStep === 'aggregate') {
      setCurrentStep('present');
      setMessages(prev => [...prev, 
        { role: 'user', content: "View Final Breakdown", isStepAction: true },
        { 
          role: 'assistant', 
          content: `Step 4 · Present: The final analysis is ready! I've color-coded the sentence role-by-role. ${activeAnalysis.markdownSummary} \n\nYou can start a new analysis by typing another sentence below!`
        }
      ]);
    }
  }, [currentStep, activeAnalysis]);

  const canProceed = !!activeAnalysis && activeAnalysis.isInputValid && currentStep !== 'present' && currentStep !== 'input';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <div className="w-1/3 min-w-[360px] h-full shadow-2xl z-20">
        <ChatPanel 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          onProceed={handleProceed}
          isLoading={isLoading} 
          currentStep={currentStep}
          canProceed={canProceed}
        />
      </div>

      <div className="flex-1 h-full overflow-hidden bg-white">
        <Workspace analysis={activeAnalysis} step={currentStep} />
      </div>
    </div>
  );
};

export default App;
