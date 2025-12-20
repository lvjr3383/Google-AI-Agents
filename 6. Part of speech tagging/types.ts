
export interface TokenRow {
  index: number;
  token: string;
  lemma: string;
  pos: string;
  fine_tag: string;
  dep: string;
  head_token: string;
}

export interface ColorSpan {
  text: string;
  pos: string;
  color_hex: string;
}

export interface ChartData {
  labels: string[];
  counts: number[];
}

export interface AnalysisResult {
  tokens: TokenRow[];
  chartData: ChartData;
  colorizedSpans: ColorSpan[];
  markdownSummary: string;
  tagExplanations: string;
  isInputValid: boolean;
  validationMessage?: string;
}

export type AnalysisStep = 'input' | 'tokenize' | 'tag' | 'aggregate' | 'present';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStepAction?: boolean;
}
