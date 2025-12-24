# Agent Translator — A Guided Tour of Neural Machine Translation

We wanted a simple, visual way to teach how an NMT model “thinks” while moving meaning from English into Spanish, German, Italian, Chinese (Simplified), and Telugu. This app keeps the UI playful (“The Weaver”) while exposing the core steps that matter for model builders and curious learners.

## Why we built it
- Show that translation is a sequence of reasoning steps, not a single black-box call.
- Make decode internals (tokenization, candidate probabilities, attention) digestible.
- Keep everything “agentic”: the model narrates its own choices as it works.

## What you get
- Four clear stages: input intent + tokenization, decode timeline, attention map, and final output with romanization/back-translation.
- Multi-target switcher (EN → ES/DE/IT/ZH-S/TEL).
- Lightweight React/Vite front-end with Tailwind styling; charts via Recharts; attention heatmap component.
- A single Gemini call that returns both the structured workspace JSON and the narrated chat text.

## How it works (at a glance)
1) **Input & Target**: Capture the English text and chosen target language; show detected language + intent guess from the model.  
2) **Tokenization**: Render the subword pieces so users see how the model segments meaning.  
3) **Neural Decoding**: For a few early steps, chart the top-5 candidate tokens with probabilities to illustrate beam/greedy-like choices.  
4) **Attention & Final Output**: Visualize a token-level attention matrix, then present the translation, romanization (when useful), and a literal gloss to compare fluency vs. faithfulness.

Under the hood, `services/geminiService.ts` calls Gemini with a JSON schema so the response arrives as typed data (`workspace`) plus a short narrative (`chatText`). The UI stitches that into StepCards, a bar chart (`CandidateChart`), and an attention heatmap (`AttentionHeatmap`).

## Quickstart (local)
Prereqs: Node.js.

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

## Repo layout
- `App.tsx` — main layout, step progression, and “Weaver” sidebar.
- `components/` — StepCard, candidate probability chart, attention heatmap.
- `services/geminiService.ts` — Gemini call + response shaping.
- `types.ts` — shared TypeScript contracts for the workspace and UI.

## Lessons learned
- Enforcing a JSON schema in the generation call keeps the UI stable even with creative narration.
- Showing only a few decode steps is enough to explain token competition without overwhelming users.
- Romanization + literal glosses help non-native readers sanity-check meaning drift.
- Treating the model as an “agent” (explaining choices) makes the educational story stick better than raw outputs.

## Next ideas
- Add latency and confidence summaries per run.
- Let users compare greedy vs. sampling side-by-side.
- Surface byte/character stats for inputs in non-Latin scripts.
