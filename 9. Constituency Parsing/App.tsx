
import React, { useState, useEffect } from 'react';
import { Step, ChatMessage, TreeNode, ParsedResponse } from './types';
import { GROUCHO_EXAMPLE } from './constants';
import { askArchitect, parseSentence } from './services/geminiService';
import ChatPanel from './components/ChatPanel';
import Workspace from './components/Workspace';

const parseTreeString = (str: string): TreeNode | null => {
  const tokens = str.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
  let i = 0;

  const parse = (): TreeNode | null => {
    if (tokens[i] !== '(') return null;
    i++; 
    const label = tokens[i++];
    const children: TreeNode[] = [];
    let word: string | undefined;

    while (i < tokens.length && tokens[i] !== ')') {
      if (tokens[i] === '(') {
        const child = parse();
        if (child) children.push(child);
      } else {
        word = tokens[i++];
      }
    }
    i++; 
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      label,
      children: children.length > 0 ? children : undefined,
      word
    };
  };

  return parse();
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INPUT);
  const [sentence, setSentence] = useState(GROUCHO_EXAMPLE);
  const [parseData, setParseData] = useState<ParsedResponse | null>(null);
  const [treeNode, setTreeNode] = useState<TreeNode | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setChatHistory([{
      id: 'init',
      sender: 'architect',
      text: "Welcome to the site! I'm your Syntax Architect. I turn raw sentences into structured blueprints. Enter any sentence, and let's start building!",
      bubbles: ["Build the default project", "How does this work?"]
    }]);
  }, []);

  const handleAction = async (action: string) => {
    const userMsgId = Date.now().toString();
    setChatHistory(prev => [...prev, { id: userMsgId, sender: 'user', text: action }]);
    setIsTyping(true);

    try {
      if (action === "Inspect" || action === "Build the default project" || action === "Start Inspection") {
        setCurrentStep(Step.BLUEPRINT);
        const data = await parseSentence(sentence);
        setParseData(data);
        if (data.linearized) {
          setTreeNode(parseTreeString(data.linearized));
        }
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: "Step 1: Identifying the Bricks. Every word has a job—is it a 'Thing', an 'Action', or a 'Pointer'? We sort them first so we know what we're building with.",
          bubbles: ["Test word fusion", "Why sort them?"]
        }]);
      } else if (action === "Why sort them?") {
        const resp = await askArchitect("Explain Part of Speech tagging as sorting bricks into bins like 'Action' or 'Object'. No jargon.");
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: resp,
          bubbles: ["Test word fusion"]
        }]);
      } else if (action === "Test word fusion") {
        setCurrentStep(Step.MATRIX);
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: "Step 2: The Fusion Grid. Here we see which words 'click' together to form bigger blocks. If two words don't fit, the grid stays empty. This is the foundation of the sentence.",
          bubbles: ["See the final pyramid", "What is fusion?"]
        }]);
      } else if (action === "What is fusion?") {
        const resp = await askArchitect("Explain word fusion (constituency) as words clicking together like LEGOs to form larger meaning. Simple.");
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: resp,
          bubbles: ["See the final pyramid"]
        }]);
      } else if (action === "See the final pyramid") {
        setCurrentStep(Step.ASSEMBLY);
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: "Step 3: The Finished Pyramid. This is the complete hierarchy. Notice how the 'Bricks' support 'Groups', and 'Groups' support the entire 'Sentence'.",
          bubbles: ["Generate the manual", "What is this hierarchy?"]
        }]);
      } else if (action === "Generate the manual") {
        setCurrentStep(Step.EXPORT);
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'architect',
          text: "Step 4: The Construction Manual. We've flattened the pyramid into a code that other computers can read. Your project is officially documented!",
          bubbles: ["New Construction Site"]
        }]);
      } else if (action === "New Construction Site") {
        setCurrentStep(Step.INPUT);
        setParseData(null);
        setTreeNode(null);
        setChatHistory([{
          id: Date.now().toString(),
          sender: 'architect',
          text: "New blueprints on the table. What are we building next?",
          bubbles: ["Inspect"]
        }]);
      } else {
        const resp = await askArchitect(action);
        setChatHistory(prev => [...prev, { id: Date.now().toString(), sender: 'architect', text: resp }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { id: 'err', sender: 'architect', text: "The foundation is unstable. Let's try a simpler sentence." }]);
    }
    setIsTyping(false);
  };

  const getStepLabel = () => {
    if (currentStep === Step.INPUT) return "Preparation";
    return `Step ${currentStep} of 4`;
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <div className="w-[35%] flex flex-col border-r border-slate-200 bg-white shadow-xl z-10">
        <header className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Syntax Architect</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getStepLabel()}</p>
            </div>
          </div>
        </header>
        <ChatPanel history={chatHistory} onBubbleClick={handleAction} isTyping={isTyping} />
      </div>
      <div className="w-[65%] h-full relative overflow-hidden bg-slate-100 flex flex-col">
        <Workspace 
          step={currentStep} 
          sentence={sentence} 
          setSentence={setSentence}
          parseData={parseData}
          treeNode={treeNode}
          onNext={() => handleAction("Inspect")}
        />
      </div>
    </div>
  );
};

export default App;
