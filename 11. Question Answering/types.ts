
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  chatPart?: string;
  workspacePart?: string;
}

export interface SplitContent {
  chat: string;
  workspace: string;
}
