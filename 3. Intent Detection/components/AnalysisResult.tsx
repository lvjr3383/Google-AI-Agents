import React, { useEffect, useRef, useState } from 'react';
import { AnalysisResponse, WizardStep, CLUSTERS } from '../types';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  ReferenceLine
} from 'recharts';
import { 
  ArrowRight, CheckCircle, AlertTriangle, Cpu, Network, 
  ShieldCheck, ShieldAlert, Ticket, FileJson, Activity, ChevronDown, ChevronRight, Zap
} from 'lucide-react';

interface AnalysisResultProps {
  data: AnalysisResponse;
  currentStep: WizardStep;
  confidenceThreshold: number;
  onNextStep: () => void;
}

interface StepCardProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ 
  stepNumber,
  title, 
  subtitle,
  icon: Icon, 
  children, 
  isActive, 
  isCompleted
}) => {
  return (
    <div 
      className={`bg-white border rounded-xl shadow-sm mb-8 transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in ${
        isActive ? 'border-blue-300 ring-4 ring-blue-50/50' : 'border-slate-200'
      }`}
    >
      <div className={`p-5 border-b flex items-center space-x-4 rounded-t-xl ${
        isActive ? 'bg-slate-50 border-blue-100' : 'bg-slate-50 border-slate-100'
      }`}>
        {/* Step Indicator Badge */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold transition-all duration-300 shrink-0 ${
          isCompleted 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : isActive 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg animate-pulse' 
              : 'bg-white border-slate-200 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle size={20} /> : stepNumber}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
              <Icon size={16} />
            </div>
            <h3 className={`font-bold text-lg truncate ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h3>
          </div>
          {subtitle && <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, currentStep, confidenceThreshold, onNextStep }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (currentStep > WizardStep.Signal) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [currentStep]);

  const renderSignal = () => {
    const parts = data.signal.text.split(/(\s+)/);
    return (
      <div className="space-y-6">
        <div className="text-xl leading-relaxed font-mono text-slate-600 bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-inner">
          {parts.map((part, i) => {
            const cleanPart = part.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
            const isTrigger = data.signal.triggers.some(t => 
              cleanPart.includes(t.toLowerCase()) || t.toLowerCase().includes(cleanPart)
            ) && cleanPart.length > 2;
            
            return (
              <span 
                key={i} 
                className={isTrigger ? "bg-amber-100 text-amber-900 font-bold border-b-2 border-amber-400 px-1 pt-0.5 rounded-t transition-colors duration-500" : ""}
              >
                {part}
              </span>
            );
          })}
        </div>
        
        <div className="flex items-start gap-4 text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
          <Activity size={18} className="mt-0.5 text-blue-500 shrink-0" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-700 font-mono text-xs uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded mr-2">Token_Analysis:</span> 
            Identified {data.signal.triggers.length} semantic triggers. These tokens have been isolated for weight calculation in the transformer architecture.
          </p>
        </div>
        
        {currentStep === WizardStep.Signal && (
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button 
              onClick={onNextStep}
              className="group flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95 font-bold shadow-lg shadow-blue-900/10"
            >
              <span>Map Vector Landscape</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLandscape = () => {
    const scatterData = [
      ...CLUSTERS.map(c => ({ x: c.x, y: c.y, z: 1, type: 'cluster', label: c.label, color: c.color })),
      { x: data.landscape.x, y: data.landscape.y, z: 2, type: 'query', label: 'Current Query', color: '#6366f1' }
    ];

    return (
      <div className="space-y-6">
        <div className="h-80 w-full bg-slate-100 rounded-xl border border-slate-200 relative mt-4 mb-8 overflow-hidden shadow-inner">
           <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis type="number" dataKey="x" domain={[-12, 12]} hide />
              <YAxis type="number" dataKey="y" domain={[-12, 12]} hide />
              
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-200 shadow-2xl rounded-lg text-xs z-50">
                      <p className="font-black text-slate-900 mb-1 uppercase tracking-tighter">{d.label}</p>
                      <p className="text-blue-600 font-mono font-bold">Vector: [{d.x}, {d.y}]</p>
                    </div>
                  );
                }
                return null;
              }} />
              
              <Scatter name="Clusters" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="white"
                    strokeWidth={3}
                  />
                ))}
              </Scatter>
              
              <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
            </ScatterChart>
          </ResponsiveContainer>
          
          {/* Legend / Axes labels pinned to container edge */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 -rotate-90 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase pointer-events-none">
            Urgency_Scale
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase pointer-events-none">
            Transaction_Weight
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-sm text-blue-900 italic leading-relaxed">
          "The semantic engine projected this request into the coordinate <span className="font-mono font-bold underline">({data.landscape.x}, {data.landscape.y})</span>. Its proximity to the <strong>{data.competition[0].intent}</strong> cluster triggers high-confidence routing."
        </div>

        {currentStep === WizardStep.Landscape && (
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button 
              onClick={onNextStep}
              className="group flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95 font-bold shadow-lg shadow-blue-900/10"
            >
              <span>Validate Risk Gap</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRiskAnalysis = () => {
    const winner = data.competition[0];
    const runnerUp = data.competition[1];
    
    const winnerPct = Math.round(winner.probability * 100);
    const runnerUpPct = Math.round(runnerUp.probability * 100);
    const gap = winnerPct - runnerUpPct;
    
    const isSafeGap = gap > 15;
    const isHighConfidence = winner.probability >= confidenceThreshold;
    const isSafeToAutomate = isSafeGap && isHighConfidence;

    return (
      <div className="space-y-10">
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Zap size={14} className="fill-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Primary_Inference</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{winner.intent}</h4>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-blue-600">{winnerPct}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Confidence</p>
            </div>
          </div>
          
          {/* Redesigned Progress Bar & Gap Visualization */}
          <div className="space-y-4">
            <div className="relative h-6 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              {/* Runner Up Marker (Underlay) */}
              <div 
                style={{ width: `${runnerUpPct}%` }} 
                className="bg-slate-300 h-full border-r-2 border-slate-400/30"
              />
              {/* Winner Margin (The Gap) */}
              <div 
                style={{ width: `${gap}%` }} 
                className="bg-blue-400 h-full relative group"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
              </div>
            </div>

            {/* Labels - Stacked to avoid overlap */}
            <div className="flex justify-between items-start text-xs font-mono font-bold mt-4">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[9px] uppercase tracking-wider mb-1">Runner Up Baseline</span>
                <span className="text-slate-600">[{runnerUpPct}%] {runnerUp.intent}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-blue-500 text-[9px] uppercase tracking-wider mb-1">Safety Margin (Gap)</span>
                <span className={`text-lg font-black ${isSafeGap ? 'text-emerald-600' : 'text-amber-600'}`}>+{gap}%</span>
              </div>
            </div>
          </div>

          {/* Verdict Alert */}
          <div className={`mt-10 p-6 rounded-xl border-l-8 flex items-start gap-5 shadow-lg ${
            isSafeToAutomate 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
              : 'bg-amber-50 border-amber-500 text-amber-900'
          }`}>
            <div className={`p-3 rounded-full shrink-0 ${isSafeToAutomate ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {isSafeToAutomate ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <h4 className="font-black text-lg mb-1 tracking-tight">
                {isSafeToAutomate ? 'Low Risk: Automation Path' : 'High Risk: Ambiguity Warning'}
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                {isSafeToAutomate 
                  ? `Safety gap confirmed. Margin (+${gap}%) exceeds risk threshold. The model is definitively clear on this intent.` 
                  : `Safety threshold breach. The model is struggling to distinguish "${winner.intent}" from "${runnerUp.intent}". Escalate to human.`}
              </p>
            </div>
          </div>
        </div>

        {currentStep === WizardStep.Competition && (
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button 
              onClick={onNextStep}
              className="group flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95 font-bold shadow-lg shadow-blue-900/10"
            >
              <span>Build Routing Payload</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderActionDashboard = () => {
    const winnerScore = data.competition[0].probability;
    const isOutOfScope = winnerScore < confidenceThreshold;
    const payload = data.routing.payload;
    const action = isOutOfScope ? "ESCALATE_TO_HUMAN" : payload.action;
    const queue = isOutOfScope ? "Manual_Review_Queue" : payload.target_queue;
    const priority = isOutOfScope ? "URGENT" : payload.priority;

    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-2">
        <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-slate-100">
              <Ticket size={20} />
              <span className="font-mono text-xs font-black uppercase tracking-widest">Execution_Packet</span>
            </div>
            <div className={`px-3 py-1 rounded-md text-[10px] font-black border-2 ${
              priority === 'HIGH' || priority === 'URGENT' ? 'bg-red-500 border-red-400 text-white' : 'bg-blue-500 border-blue-400 text-white'
            }`}>
              {priority}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Resolved Intent</label>
              <div className="font-black text-slate-900 flex items-center space-x-3 text-2xl">
                 <span className="truncate">{isOutOfScope ? "UNCERTAIN" : data.routing.winner}</span>
                 {isOutOfScope && <AlertTriangle size={24} className="text-amber-500 animate-pulse" />}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Handler Target</label>
              <div className="font-mono text-sm text-blue-700 bg-blue-50 border border-blue-100 inline-block px-4 py-2 rounded-lg font-bold">
                {queue}
              </div>
            </div>
            <div className="md:col-span-2 pt-6 border-t border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Downstream API Call</label>
               <div className="flex items-center space-x-4 text-sm bg-slate-900 text-blue-400 p-4 rounded-xl font-mono border-b-4 border-blue-900 shadow-lg">
                  <div className={`w-3 h-3 rounded-full ${isOutOfScope ? 'bg-amber-400' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
                  <span className="font-bold tracking-tight">{action}()</span>
                  <span className="text-slate-500 ml-auto hidden sm:block">ACK_SUCCESS_200</span>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => setShowJson(!showJson)}
            className="flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest px-2"
          >
            {showJson ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <FileJson size={14} />
            <span>View.Raw_Payload()</span>
          </button>
          
          {showJson && (
            <div className="mt-4 bg-slate-950 rounded-xl p-6 overflow-x-auto shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <pre className="text-xs font-mono text-blue-300 leading-relaxed">
{JSON.stringify({
  version: "v3.1",
  confidence: winnerScore,
  inference: isOutOfScope ? "FALLBACK" : "DECISIVE",
  payload: isOutOfScope ? { fallback_action: "ESCALATE" } : data.routing.payload
}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 pb-24" ref={bottomRef}>
      
      <StepCard 
        stepNumber={1}
        title="Signal Extraction" 
        subtitle="Phase 01 / Pre-processing"
        icon={Cpu} 
        isActive={currentStep === WizardStep.Signal}
        isCompleted={currentStep > WizardStep.Signal}
      >
        {renderSignal()}
      </StepCard>

      {currentStep >= WizardStep.Landscape && (
        <StepCard 
          stepNumber={2}
          title="Vector Landscape" 
          subtitle="Phase 02 / Embedding"
          icon={Network} 
          isActive={currentStep === WizardStep.Landscape}
          isCompleted={currentStep > WizardStep.Landscape}
        >
          {renderLandscape()}
        </StepCard>
      )}

      {currentStep >= WizardStep.Competition && (
        <StepCard 
          stepNumber={3}
          title="Risk Analysis" 
          subtitle="Phase 03 / Validation"
          icon={ShieldCheck} 
          isActive={currentStep === WizardStep.Competition}
          isCompleted={currentStep > WizardStep.Competition}
        >
          {renderRiskAnalysis()}
        </StepCard>
      )}

      {currentStep >= WizardStep.Routing && (
        <StepCard 
          stepNumber={4}
          title="Action Dashboard" 
          subtitle="Phase 04 / Execution"
          icon={Ticket} 
          isActive={currentStep === WizardStep.Routing}
          isCompleted={currentStep > WizardStep.Routing}
        >
          {renderActionDashboard()}
        </StepCard>
      )}

      <div className="h-10"></div>
    </div>
  );
};