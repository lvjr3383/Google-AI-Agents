
export const TAG_LABELS: Record<string, string> = {
  S: 'Complete Sentence',
  NP: 'Noun Group',
  VP: 'Action Group',
  PP: 'Relationship Group',
  V: 'Action',
  N: 'Thing',
  Det: 'Pointer',
  PRP: 'Person/Object',
  VBD: 'Past Action',
  DT: 'Pointer',
  NN: 'Solid Thing',
  IN: 'Relationship',
  PRP$: 'Owner',
  NNS: 'Multiple Things',
  VBZ: 'Present Action',
  JJ: 'Descriptor',
  ADVP: 'Timing/Manner',
  ADJP: 'Description'
};

// Family-based colors: Blue for Nouns, Green for Verbs, Amber for Determiners, Purple for Prepositions
export const COLORS: Record<string, string> = {
  S: 'bg-slate-800',
  NP: 'bg-sky-500',
  VP: 'bg-emerald-500',
  PP: 'bg-indigo-500',
  V: 'bg-emerald-400',
  N: 'bg-sky-400',
  Det: 'bg-amber-400',
  PRP: 'bg-sky-300',
  VBD: 'bg-emerald-300',
  DT: 'bg-amber-300',
  NN: 'bg-sky-200',
  IN: 'bg-indigo-300',
  PRP$: 'bg-sky-100',
  NNS: 'bg-sky-200',
  VBZ: 'bg-emerald-200',
  JJ: 'bg-rose-300',
  ADVP: 'bg-orange-400',
  ADJP: 'bg-rose-400'
};

export const TEXT_COLORS: Record<string, string> = {
  S: 'text-white',
  NP: 'text-white',
  VP: 'text-white',
  PP: 'text-white'
};

export const GROUCHO_EXAMPLE = "I shot an elephant in my pajamas";
