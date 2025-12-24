
export interface InputAnalysis {
  source_text: string;
  detected_language: string;
  target_language: string;
  intent: string;
}

export interface Tokenization {
  explanation: string;
  tokens: string[];
  token_count?: number;
  byte_view?: string;
}

export interface Candidate {
  token: string;
  prob: number;
}

export interface DecodeStep {
  step: number;
  current_token: string;
  top_5_candidates: Candidate[];
  mechanism?: string;
}

export interface AttentionMap {
  target_token: string;
  weights: { source_token: string; weight: number }[];
}

export interface FinalOutput {
  translation_script: string;
  romanization: string;
  literal_translation: string;
  fluency_score?: string;
}

export interface TranslationWorkspace {
  step_1_input: InputAnalysis;
  step_2_tokenization: Tokenization;
  step_3_decode_timeline: DecodeStep[];
  step_4_final_output: FinalOutput;
  attention_map?: AttentionMap[];
  suggested_questions?: { [key: string]: string[] };
}

export interface AgentResponse {
  workspace: TranslationWorkspace;
  chatText: string;
}

export enum TargetLanguage {
  SPANISH = 'Spanish',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  CHINESE = 'Chinese (Simplified)',
  TELUGU = 'Telugu'
}
