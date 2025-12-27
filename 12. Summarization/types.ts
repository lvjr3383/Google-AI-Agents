
export enum PipelineStep {
  INITIALIZATION = 0,
  SCOPE_CONTEXT = 1,
  FILTER_HEATMAP = 2,
  SYNTHESIS = 3,
  ESSENCE = 4
}

export type FlavorType = 'article' | 'email' | 'paper' | 'custom';

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  isPipelineStep?: boolean;
}

export interface StepData {
  chat: string;
  workspace: any;
}

export interface AppState {
  currentStep: PipelineStep;
  inputText: string;
  flavor: FlavorType;
  isLoading: boolean;
  history: ChatMessage[];
  currentWorkspaceData: any;
}
