
export enum Step {
  INPUT = 0,
  BLUEPRINT = 1,
  MATRIX = 2,
  ASSEMBLY = 3,
  EXPORT = 4
}

export interface ChatMessage {
  id: string;
  sender: 'architect' | 'user';
  text: string;
  bubbles?: string[];
  isThinking?: boolean;
}

export interface TreeNode {
  label: string;
  children?: TreeNode[];
  word?: string;
  id: string;
}

export interface POSMapping {
  word: string;
  tag: string;
}

export interface CKYCell {
  row: number;
  col: number;
  tags: string[];
}

export interface ParsedResponse {
  tokens: { word: string; tag: string }[];
  constituents: { label: string; start: number; end: number }[];
  linearized: string;
}
