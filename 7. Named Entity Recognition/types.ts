
export interface Token {
  text: string;
  bioTag: string;
  label: string;
  start: number;
  end: number;
}

export interface Span {
  text: string;
  label: string;
  start: number;
  end: number;
  color: string;
}

export interface Stats {
  Person: number;
  Organization: number;
  Location: number;
  Date: number;
  Other: number;
}

export interface StepExplanation {
  title: string;
  explanation: string;
  inputDescription: string;
  outputDescription: string;
}

export interface NERAnalysis {
  isInputValid: boolean;
  validationMessage: string;
  tokens: Token[];
  spans: Span[];
  stats: Stats;
  summary: string;
  insight: string;
  pipelineExplanations: {
    step1: StepExplanation;
    step2: StepExplanation;
    step3: StepExplanation;
    step4: StepExplanation;
  };
}

export enum EntityType {
  PERSON = 'PERSON',
  ORG = 'ORG',
  GPE = 'GPE',
  LOC = 'LOC',
  DATE = 'DATE',
  MONEY = 'MONEY',
  PRODUCT = 'PRODUCT',
  EVENT = 'EVENT'
}
