
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TripData, PipelineStep, FactData, TimelineData, ChatMessage, StyleConfig, LearnMoreContent, ProbabilityOption } from './types';
import { getTripFacts, createTimeline, generateJournal, recommendMonth, extractMonth, generateSpeech } from './services/geminiService';
import LessonCard from './components/LessonCard';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const getInitialTrip = (): TripData => ({ destination: '', month: '', duration: '', interests: '' });
  const getInitialMessages = (): ChatMessage[] => [
    { role: 'bot', text: "Welcome to the Text Lab! I'm Agent Texty. I don't just 'write' stories—I calculate them. Let's build a travel narrative together. Where are we heading first?" }
  ];

  const [currentStep, setCurrentStep] = useState<PipelineStep>(PipelineStep.SETUP);
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages());
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeLearnMore, setActiveLearnMore] = useState<LearnMoreContent | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [highlightedFact, setHighlightedFact] = useState<string | null>(null);
  
  const [tripData, setTripData] = useState<TripData>(getInitialTrip());
  const [facts, setFacts] = useState<FactData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [style, setStyle] = useState<StyleConfig>({ vocabulary: 2, excitement: 8, fantasy: false });
  const [journal, setJournal] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'bot' | 'user', text: string, hasButtons: boolean = false) => {
    setMessages(prev => [...prev, { role, text, hasButtons }]);
  };

  // Probability Simulator for Step 3
  const probabilities = useMemo((): ProbabilityOption[] => {
    const exc = style.excitement;
    const baseWords = [
      { word: "Good", color: "bg-slate-400" },
      { word: "Nice", color: "bg-slate-500" },
      { word: "SPECTACULAR", color: "bg-emerald-500" }
    ];
    
    // Simple math to show probability shift
    if (exc > 7) {
      return [
        { word: "Good", probability: 5, color: "bg-slate-300" },
        { word: "Nice", probability: 5, color: "bg-slate-400" },
        { word: "SPECTACULAR", probability: 90, color: "bg-emerald-500" }
      ];
    } else if (exc < 4) {
      return [
        { word: "Good", probability: 45, color: "bg-slate-500" },
        { word: "Nice", probability: 45, color: "bg-slate-600" },
        { word: "SPECTACULAR", probability: 10, color: "bg-emerald-200" }
      ];
    } else {
      return [
        { word: "Good", probability: 33, color: "bg-slate-400" },
        { word: "Nice", probability: 33, color: "bg-slate-500" },
        { word: "SPECTACULAR", probability: 34, color: "bg-emerald-400" }
      ];
    }
  }, [style.excitement]);

  const handleSend = async (manualInput?: string) => {
    const input = manualInput || userInput.trim();
    if (!input) return;
    
    if (!manualInput) {
      addMessage('user', input);
      setUserInput('');
    }

    if (currentStep === PipelineStep.SETUP) {
      if (!tripData.destination) {
        setIsLoading(true);
        setTripData(prev => ({ ...prev, destination: input }));
        try {
          const rec = await recommendMonth(input);
          addMessage('bot', `Calculated best time for ${input}: ${rec}. Should we lock that in, or pick another month?`);
        } catch (e) {
          addMessage('bot', `Destination locked: ${input}. Which month are we travel-simulating?`);
        } finally {
          setIsLoading(false);
        }
      } else if (!tripData.month) {
        setIsLoading(true);
        try {
          const monthOnly = await extractMonth(input);
          setTripData(prev => ({ ...prev, month: monthOnly }));
          addMessage('bot', `Month context added: ${monthOnly}. Duration (days)?`);
        } catch (e) {
          setTripData(prev => ({ ...prev, month: input }));
          addMessage('bot', `Month captured: ${input}. Duration (days)?`);
        } finally {
          setIsLoading(false);
        }
      } else if (!tripData.duration) {
        setTripData(prev => ({ ...prev, duration: input }));
        addMessage('bot', `Duration set. Finally, enter a focus interest (e.g., Dinosaurs, Space, Cooking).`);
      } else if (!tripData.interests) {
        setTripData(prev => ({ ...prev, interests: input }));
        addMessage('bot', "System ready. Initialize Grounding Engine?", true);
      } else if (input.toLowerCase().includes('start')) {
        startPipeline();
      }
    } else {
      if (input.toLowerCase().includes('next')) {
        goToNextStep();
      } else if (input.toLowerCase().includes('generate') && currentStep === PipelineStep.STYLE) {
        generateFinalOutput();
      }
    }
  };

  const startPipeline = async () => {
    setIsLoading(true);
    setCurrentStep(PipelineStep.RETRIEVAL);
    addMessage('bot', "Initializing Retrieval Engine. Injecting real-world facts into active memory...");
    try {
      const result = await getTripFacts(tripData);
      setFacts(result);
      addMessage('bot', "Grounding successful. Knowledge chips loaded. Proceed to Logical Planner?", true);
    } catch (e) {
      addMessage('bot', "Retrieval error. Connection unstable. Retry?");
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = async () => {
    if (currentStep === PipelineStep.RETRIEVAL) {
      if (!facts) {
        addMessage('bot', "Grounding is missing. Re-run the Grounding Engine first.");
        return;
      }
      setIsLoading(true);
      setCurrentStep(PipelineStep.PLANNING);
      addMessage('bot', "Generating Reasoning Script. Building a day-by-day logical sequence to maintain coherence.");
      try {
        const result = await createTimeline(facts, tripData.destination, tripData.duration);
        setTimeline(result);
        addMessage('bot', "Logic Blueprint finalized. Adjust Probability Weights (Style)?", true);
      } catch (e) {
        addMessage('bot', "Planning phase failed. The model drifted. Re-calculating...");
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === PipelineStep.PLANNING) {
      if (!timeline) {
        addMessage('bot', "No timeline found. Re-run the Planner before moving to Style.");
        return;
      }
      setCurrentStep(PipelineStep.STYLE);
      addMessage('bot', "Probability Engine online. Use the sliders to bias the word selection process.", true);
    }
  };

  const generateFinalOutput = async () => {
    if (!facts || !timeline) {
      addMessage('bot', "Missing facts or plan. Run Grounding and Planning before generation.");
      return;
    }
    setIsLoading(true);
    addMessage('bot', "Beginning Final Generation. Sampling words based on plan, facts, and weighted style...");
    try {
      const vocabStr = style.vocabulary > 5 ? "Advanced" : "Simple";
      const excitementStr = style.excitement > 5 ? "High" : "Calm";
      const result = await generateJournal(tripData, facts, timeline, { vocab: vocabStr, excitement: excitementStr });
      setJournal(result);
      setCurrentStep(PipelineStep.OUTPUT);
      setAudioBase64(null);
      addMessage('bot', "Output stream finished. View the Attention connections below.");
    } catch (e) {
      addMessage('bot', "Generation halted due to an internal error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListen = async () => {
    if (isAudioLoading || !journal.trim()) return;
    setIsAudioLoading(true);
    try {
      let b64 = audioBase64;
      if (!b64) {
        b64 = await generateSpeech(journal);
        setAudioBase64(b64);
      }
      if (!b64) throw new Error("No audio data");

      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const audioBuffer = await decodeAudioData(decodeBase64(b64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleDownloadAudio = () => {
    if (!audioBase64) return;
    const bytes = decodeBase64(audioBase64);
    const wavHeader = createWavHeader(bytes.length, 24000, 1, 16);
    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Texty_Output_${tripData.destination}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createWavHeader = (dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    view.setUint32(0, 0x52494646, false); 
    view.setUint32(4, 36 + dataLength, true); 
    view.setUint32(8, 0x57415645, false); 
    view.setUint32(12, 0x666d7420, false); 
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); 
    view.setUint32(40, dataLength, true);
    return new Uint8Array(header);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`AI Generated: ${tripData.destination}`, 20, 30);
    doc.setFontSize(10);
    doc.text(`Retrieved Facts: ${facts?.flight.airline}, ${facts?.food.name}, ${facts?.attraction.name}`, 20, 40);
    doc.line(20, 45, 190, 45);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(journal, 170);
    doc.text(splitText, 20, 55);
    doc.save(`AgentTexty_${tripData.destination}.pdf`);
  };

  const handleStartOver = () => {
    setCurrentStep(PipelineStep.SETUP);
    setTripData(getInitialTrip());
    setMessages(getInitialMessages());
    setFacts(null);
    setTimeline(null);
    setJournal('');
    setAudioBase64(null);
    setStyle({ vocabulary: 2, excitement: 8, fantasy: false });
  };

  const learnMoreMap: Record<number, LearnMoreContent> = {
    [PipelineStep.RETRIEVAL]: {
      question: "How does the Grounding Engine work?",
      answer: "Normally, AI models are 'frozen' in time. They don't know today's weather or current flights. By using the Grounding Engine (RAG), we inject real-world data directly into the AI's 'Context Window' (its short-term memory). This prevents 'hallucination' because the AI must use the facts we provide as its anchor."
    },
    [PipelineStep.PLANNING]: {
      question: "Why does the AI need a Reasoning Script?",
      answer: "AI predicts the next word based on probability. Without a plan, it can lose track of where it started. A 'Reasoning Script' or 'Chain of Thought' is like a mental to-do list that the AI checks before it starts writing. This ensures the story flows logically and hits every required point."
    },
    [PipelineStep.STYLE]: {
      question: "What is the Probability Engine?",
      answer: "AI doesn't choose words based on feelings. It calculates which word is most likely to come next. When you move the sliders, you are shifting the 'weights' of those probabilities. High excitement increases the probability of energetic words, making them the most likely choice for the model to pick."
    },
    [PipelineStep.OUTPUT]: {
      question: "What are Attention Highlights?",
      answer: "While the AI writes, it uses an 'Attention Mechanism' to look back at the original data chips. It's like a spotlight moving between your input facts and the sentence being written. This connection is how the AI ensures that when it mentions 'dinner,' it specifically mentions the Indian restaurant we found in Step 1."
    }
  };

  return (
    <div className="flex flex-col h-full font-inter select-none">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-2xl z-30 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-microchip text-2xl"></i>
          </div>
          <div>
            <h1 className="font-kids text-2xl font-bold leading-none tracking-tight">Agent Texty</h1>
            <p className="text-[10px] opacity-60 uppercase tracking-widest font-black mt-1">Text Generation Lab v2.0</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[1,2,3,4].map(s => (
            <div key={s} className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${currentStep >= s ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <span className="text-[10px] font-black">{s}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest hidden md:block">
                {s === 1 ? 'Grounding' : s === 2 ? 'Planning' : s === 3 ? 'Probability' : 'Attention'}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        
        {/* CHATBOT (REFINED AS LAB ASSISTANT) */}
        <div className="w-[35%] flex flex-col border-r border-slate-200 bg-white relative shadow-2xl z-20">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-terminal text-[8px]"></i> Lab Assistant
            </span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="text-sm leading-relaxed font-medium">{m.text}</p>
                </div>
                {m.hasButtons && i === messages.length - 1 && !isLoading && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-start w-full">
                    {currentStep === PipelineStep.SETUP && tripData.interests && (
                      <button onClick={() => handleSend('Start')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-bolt"></i> Run Grounding Engine
                      </button>
                    )}
                    {currentStep === PipelineStep.RETRIEVAL && (
                      <button onClick={() => handleSend('Next')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-diagram-project"></i> Run Planner
                      </button>
                    )}
                    {currentStep === PipelineStep.PLANNING && (
                      <button onClick={() => handleSend('Next')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-sliders"></i> Bias Probabilities
                      </button>
                    )}
                    {currentStep === PipelineStep.STYLE && (
                      <button onClick={() => handleSend('Generate')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-wand-sparkles"></i> Synthesize Text
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter parameters..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-black active:scale-90 disabled:opacity-50 transition-all shadow-lg"
              >
                <i className="fa-solid fa-play"></i>
              </button>
            </form>
          </div>
        </div>

        {/* WORKSPACE (THE LAB) */}
        <div className="w-[65%] bg-slate-50 flex flex-col p-10 overflow-y-auto custom-scrollbar relative">
          
          {/* LEARN MORE MODAL */}
          {activeLearnMore && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-2xl border-4 border-slate-100 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <i className="fa-solid fa-lightbulb text-3xl"></i>
                    </div>
                    <h3 className="font-kids text-3xl text-indigo-900">{activeLearnMore.question}</h3>
                  </div>
                  <button onClick={() => setActiveLearnMore(null)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <i className="fa-solid fa-circle-xmark text-4xl"></i>
                  </button>
                </div>
                <div className="text-slate-600 leading-relaxed font-medium text-lg pr-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeLearnMore.answer}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setActiveLearnMore(null)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
                    Close Lab Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC LEARN MORE TOOLTIP */}
          {currentStep > 0 && learnMoreMap[currentStep] && (
            <div className="flex justify-center mb-8 sticky top-0 z-10">
              <button 
                onClick={() => setActiveLearnMore(learnMoreMap[currentStep])}
                className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-xl flex items-center gap-3 active:scale-95"
              >
                <i className="fa-solid fa-microscope text-lg text-indigo-400"></i>
                Lab Manual: {learnMoreMap[currentStep].question.split('?')[0]}?
              </button>
            </div>
          )}

          {currentStep === PipelineStep.SETUP && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-fade-in">
              <div className="relative">
                <div className="w-80 h-80 bg-white rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-inner group overflow-hidden">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <i className="fa-solid fa-rotate text-8xl animate-spin text-indigo-400"></i>
                      <p className="font-black text-xs uppercase tracking-widest text-indigo-400">Calibrating...</p>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-square-plus text-8xl mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="font-black uppercase tracking-widest text-xs">Waiting for Input</p>
                    </>
                  )}
                </div>
                {/* Decorative particles */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-50 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-amber-50 rounded-full animate-pulse"></div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                {[
                  { key: 'destination', icon: 'fa-location-dot', label: 'TARGET' },
                  { key: 'month', icon: 'fa-calendar', label: 'MONTH' },
                  { key: 'duration', icon: 'fa-stopwatch', label: 'DAYS' },
                  { key: 'interests', icon: 'fa-dna', label: 'BIAS' }
                ].map(({ key, icon, label }) => (
                  <div key={key} className={`bg-white p-6 rounded-3xl border-2 transition-all duration-500 ${tripData[key as keyof TripData] ? 'border-indigo-500 shadow-xl shadow-indigo-100 scale-100' : 'border-slate-100 opacity-40 scale-95'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${tripData[key as keyof TripData] ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <i className={`fa-solid ${icon} text-lg`}></i>
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest leading-none mb-1">{label}</p>
                        <p className="text-base font-bold text-slate-800 truncate">{tripData[key as keyof TripData] || '----'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === PipelineStep.RETRIEVAL && facts && (
            <div className="space-y-10 animate-slide-up">
              <div className="border-b-2 border-slate-200 pb-8 flex justify-between items-end">
                <div>
                  <h2 className="font-kids text-5xl font-bold text-slate-900 leading-none">Grounding Engine</h2>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-3">Context Window Status: Active</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full font-black text-[10px] uppercase shadow-sm flex items-center gap-3">
                  <i className="fa-solid fa-wifi animate-pulse"></i> Search Tool: Online
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-indigo-300 uppercase mb-8 tracking-[0.2em] text-center border-b border-white/10 pb-4">
                    Injecting External Knowledge Chips
                  </p>
                  
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { key: 'FLIGHT', val: facts.flight.airline, sub: facts.flight.route, icon: 'fa-plane' },
                      { key: 'CUISINE', val: facts.food.name, sub: facts.food.address, icon: 'fa-utensils' },
                      { key: 'ACTIVITY', val: facts.attraction.name, sub: facts.attraction.description, icon: 'fa-star' }
                    ].map((chip, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-indigo-400 transition-all group animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                          <i className={`fa-solid ${chip.icon}`}></i>
                        </div>
                        <p className="text-[8px] font-black text-indigo-400 mb-1">{chip.key}</p>
                        <p className="text-white font-bold text-lg mb-2 truncate">{chip.val}</p>
                        <p className="text-[9px] text-white/50 leading-relaxed line-clamp-2">{chip.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <LessonCard icon="fa-solid fa-anchor" title="📍 Grounding vs. Hallucination" text="AI often 'guesses' facts. By injecting these Knowledge Chips into the Context Window, we provide a 'Ground Truth' for the model to reference while writing." />
            </div>
          )}

          {currentStep === PipelineStep.PLANNING && timeline && (
            <div className="space-y-12 animate-slide-up">
              <div className="border-b-2 border-slate-200 pb-8 flex justify-between items-end">
                <div>
                  <h2 className="font-kids text-5xl font-bold text-slate-900 leading-none">Logical Planner</h2>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-3">Coherence Protocol: Standard</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex gap-10">
                <div className="w-1/3 border-r border-slate-100 pr-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-6 tracking-widest">Reasoning Checklist</p>
                  <div className="space-y-4">
                    {[
                      "Check duration constraints",
                      "Ensure travel logic",
                      "Match morning/afternoon flow",
                      "Integrate interest bias"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <i className="fa-solid fa-circle-check text-indigo-500"></i>
                        <p className="text-xs font-bold text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {timeline.map((day, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 group hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full">DAY {day.dayNumber} LOG</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                        <p>AM: {day.morning}</p>
                        <p>PM: {day.afternoon}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <LessonCard icon="fa-solid fa-diagram-project" title="🦴 Coherence & Chain-of-Thought" text="AI writes one word at a time. Without a plan (Blueprint), it would forget the beginning by the time it reaches the end. This skeleton ensures long-range logic." color="emerald" />
            </div>
          )}

          {currentStep === PipelineStep.STYLE && (
            <div className="space-y-12 animate-slide-up">
              <div className="border-b-2 border-slate-200 pb-8">
                <h2 className="font-kids text-5xl font-bold text-slate-900 leading-none">Probability Engine</h2>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-3">Weight Configuration: User Overriden</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-10">
                  <div className="space-y-6">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Vocabulary Level</label>
                    <input 
                      type="range" min="1" max="10" value={style.vocabulary} 
                      onChange={(e) => setStyle({...style, vocabulary: parseInt(e.target.value)})}
                      className="w-full h-3 bg-indigo-50 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] font-black text-indigo-400">
                      <span>SIMPLE</span>
                      <span>COMPLEX</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Excitement Level</label>
                    <input 
                      type="range" min="1" max="10" value={style.excitement} 
                      onChange={(e) => setStyle({...style, excitement: parseInt(e.target.value)})}
                      className="w-full h-3 bg-amber-50 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] font-black text-amber-500">
                      <span>CALM</span>
                      <span>HYPED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-8 tracking-widest text-center border-b border-white/10 pb-4">Real-time Probability Simulator</p>
                  <p className="text-white text-lg font-bold text-center mb-10">"The destination was..."</p>
                  
                  <div className="space-y-6">
                    {probabilities.map((opt, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-white font-black text-[11px] tracking-widest">{opt.word}</span>
                          <span className="text-indigo-400 font-bold text-xs">{opt.probability}%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full ${opt.color} transition-all duration-500 ease-out shadow-lg`}
                            style={{ width: `${opt.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <LessonCard icon="fa-solid fa-chart-simple" title="📊 Mathematical Selection" text="AI doesn't have moods—it has 'weights'. By adjusting the sliders, you are telling the engine to favor words with a higher 'energy score' in its database." color="amber" />
            </div>
          )}

          {currentStep === PipelineStep.OUTPUT && (
            <div className="space-y-12 animate-slide-up pb-20">
              <div className="border-b-2 border-slate-200 pb-8 flex justify-between items-end">
                <div>
                  <h2 className="font-kids text-5xl font-bold text-slate-900 leading-none">Synthesis Output</h2>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-3">Status: Output Rendered</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleListen} disabled={isAudioLoading} className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all">
                    {isAudioLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-volume-high"></i>}
                  </button>
                  <button onClick={handleDownloadPDF} className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-black transition-all">
                    <i className="fa-solid fa-file-pdf"></i>
                  </button>
                </div>
              </div>

              <div className="flex gap-10">
                <div className="flex-1">
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-b-[16px] border-indigo-100 relative group min-h-[500px]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <i className="fa-solid fa-paper-plane text-8xl -rotate-45"></i>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="mb-10 pb-6 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Synthesized Journal</span>
                        <button onClick={handleStartOver} className="text-[10px] font-black text-slate-300 uppercase hover:text-red-500 transition-colors">Reset Lab</button>
                      </div>

                      <div className="text-slate-700 text-lg leading-relaxed font-medium space-y-8 select-text">
                        {journal.split('\n').filter(l => l.trim()).map((line, idx) => (
                          <p key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.2}s` }}>
                            {line.split(' ').map((word, widx) => {
                              const isFact = facts && (
                                word.toLowerCase().includes(facts.flight.airline.toLowerCase().split(' ')[0]) ||
                                word.toLowerCase().includes(facts.food.name.toLowerCase().split(' ')[0]) ||
                                word.toLowerCase().includes(facts.attraction.name.toLowerCase().split(' ')[0])
                              );
                              return (
                                <span 
                                  key={widx} 
                                  className={isFact ? "text-indigo-600 font-black cursor-help bg-indigo-50 px-0.5 rounded transition-all hover:bg-indigo-600 hover:text-white" : ""}
                                  onMouseEnter={() => isFact && setHighlightedFact(word)}
                                  onMouseLeave={() => isFact && setHighlightedFact(null)}
                                >
                                  {word}{' '}
                                </span>
                              );
                            })}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-1/3 space-y-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Active Attention Pins</p>
                   {facts && [
                     { key: 'flight', icon: 'fa-plane', val: facts.flight.airline },
                     { key: 'food', icon: 'fa-utensils', val: facts.food.name },
                     { key: 'attraction', icon: 'fa-star', val: facts.attraction.name }
                   ].map((f, idx) => (
                     <div 
                      key={idx} 
                      className={`p-5 rounded-2xl border-2 transition-all ${highlightedFact?.toLowerCase().includes(f.val.toLowerCase().split(' ')[0]) ? 'bg-indigo-600 border-indigo-400 text-white scale-105 shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
                     >
                       <div className="flex items-center gap-3">
                         <i className={`fa-solid ${f.icon}`}></i>
                         <p className="text-xs font-black uppercase tracking-widest">{f.val}</p>
                       </div>
                     </div>
                   ))}

                   <div className="bg-slate-900 p-6 rounded-2xl text-white">
                      <p className="text-[9px] font-black text-white/40 uppercase mb-3 tracking-widest">Lab Results</p>
                      <div className="space-y-2 text-[10px] font-bold text-indigo-300">
                        <div className="flex justify-between"><span>TOKEN COUNT</span><span>~450</span></div>
                        <div className="flex justify-between"><span>GROUNDING SCORE</span><span>98.2%</span></div>
                        <div className="flex justify-between"><span>COHERENCE</span><span>MAX</span></div>
                      </div>
                      <button 
                        onClick={handleDownloadAudio}
                        className="w-full mt-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Download Audio Stream
                      </button>
                   </div>
                </div>
              </div>

              <LessonCard icon="fa-solid fa-eye" title="👁️ The Attention Mechanism" text="While generating, the AI 'Attends' (looks back) at the facts we provided. Notice how the highlighted words in the text connect directly to the Knowledge Chips in the sidebar! This is the 'Focus' of the model." />
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 2px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        input[type=range]::-webkit-slider-runnable-track { height: 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
        input[type=range]::-webkit-slider-thumb { margin-top: -6px; height: 24px; width: 24px; border-radius: 50%; background: #ffffff; cursor: pointer; border: 2px solid #6366f1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
      `}</style>
    </div>
  );
};

export default App;
