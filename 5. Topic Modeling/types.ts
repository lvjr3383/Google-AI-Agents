
export enum LabStage {
  DISTILLATION = 'DISTILLATION',
  DICTIONARY = 'DICTIONARY',
  ITERATION = 'ITERATION',
  ATLAS = 'ATLAS'
}

export interface Review {
  id: number;
  text: string;
  topic?: string;
}

export interface ChatMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
}
