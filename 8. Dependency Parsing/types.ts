
export enum StepType {
  ANCHOR = 'anchor',
  LINKAGE = 'linkage',
  HIERARCHY = 'hierarchy',
  REVELATION = 'revelation'
}

export interface LinkageItem {
  head: string;
  relation: string;
  dependent: string;
}

export interface ParsingResult {
  sentence: string;
  isValid: boolean;
  validationMessage?: string;
  anchor: {
    word: string;
    pos: string;
    explanation: string;
  };
  linkage: {
    connections: LinkageItem[];
    explanation: string;
  };
  hierarchy: {
    tree: string;
    explanation: string;
  };
  revelation: {
    actor: string;
    action: string;
    recipient: string;
    explanation: string;
  };
  suggestedQuestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
