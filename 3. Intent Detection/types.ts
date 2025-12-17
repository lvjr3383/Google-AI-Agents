export interface TriggerAnalysis {
  text: string;
  triggers: string[];
}

export interface LandscapePoint {
  x: number;
  y: number;
  explanation: string;
}

export interface IntentCompetition {
  intent: string;
  probability: number; // 0.0 to 1.0
}

export interface RoutingResult {
  winner: string;
  payload: Record<string, any>;
  reasoning: string;
}

export interface AnalysisResponse {
  signal: TriggerAnalysis;
  landscape: LandscapePoint;
  competition: IntentCompetition[];
  routing: RoutingResult;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum WizardStep {
  Input = 0,
  Signal = 1,
  Landscape = 2,
  Competition = 3,
  Routing = 4,
}

export interface ClusterDef {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

export const CLUSTERS: ClusterDef[] = [
  { id: 'security', label: 'Account Security', x: 8, y: 8, color: '#ef4444' }, // High Urgency, Transactional
  { id: 'payments', label: 'Payments', x: 5, y: -5, color: '#3b82f6' }, // Low Urgency, Transactional
  { id: 'support', label: 'General Support', x: -8, y: -2, color: '#10b981' }, // Mid Urgency, Informational
];