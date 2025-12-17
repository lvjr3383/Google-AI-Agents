# 🧠 The Sentiment Extractor (Practical NLP Field Guide)

> **"To understand the model, we must slow it down."**

An educational walkthrough of sentiment analysis that shows every step of the reasoning pipeline—without exposing private prompts or any production-only tricks. It is designed as a teaching tool: clear visuals, explicit stages, and guardrails to keep keys and implementation details private.

## Why it exists
- Turn the typical “black box” sentiment demo into a glass box for learners.
- Show how raw text becomes tokens, vectors, feature importance, and finally a sentiment signal.
- Encourage questions: the chat panel lets users interrogate each stage instead of just accepting a label.

## What the user experiences
- **Left panel (Chat + Controls):** enter text, ask questions, adjust the confidence threshold, and drive the step progression.
- **Right panel (Visualization):** four stages:
  1) **Tokenization:** see tokens, optional IDs, and any subword splits.
  2) **Vector Space:** a scatter plot that positions the input against anchor concepts (X = sentiment, Y = intensity/abstraction).
  3) **Explainability:** clickable heatmap words plus a sentiment arc over time.
  4) **Final Signal:** classification, confidence meter vs. your threshold, and a short “field note” lesson.

## How it works (high level)
- **Two-model flow:** one Gemini model produces structured analysis JSON; a lighter model handles follow-up questions without re-running analysis.
- **Strict data contract:** the analysis response is forced into a schema so the UI can render deterministically (tokens, vector coordinates, impact words, sentiment arc, final signal, lesson text).
- **Frontend stack:** React + TypeScript + Vite, Tailwind via CDN for speed, Recharts for charts, Lucide for icons.

## What is **not** included
- No proprietary prompt text, private weights, or internal parameters are published here.
- The schema comments explain shapes for rendering, not “secret sauce” logic.
- Keys stay local; nothing sensitive is committed.

## Quickstart
1) Install dependencies:
```bash
npm install
```
2) Provide your Gemini key in `.env.local` (kept out of git):
```bash
GEMINI_API_KEY=your_gemini_key_here
```
Optional: add your own prompts (leave blank to use the minimal defaults in code):
```bash
ANALYSIS_PROMPT="Your analysis prompt"
CHAT_PROMPT="Your chat prompt"
```
3) Run the dev server:
```bash
npm run dev
```
4) Open the UI, paste any text, and step through the stages (use the “Proceed to Next Step” button in the chat panel).

## Project structure (high level)
- `App.tsx` — orchestrates the four-step state machine and layout.
- `components/AnalysisResult.tsx` — renders token view, vector plot, heatmap, sentiment arc, final signal, and lesson.
- `components/ChatInterface.tsx` — chat UI, threshold slider, proceed/reset controls, suggested questions.
- `services/geminiService.ts` — API calls and response schema enforcement (keys pulled from env; prompts can be overridden via env).
- `types.ts` — shared enums and interfaces for the analysis data.
- `.env.local` — placeholder for your key (not tracked); add your own `.env.local` or shell export.

## Data and privacy notes
- The analysis output uses illustrative coordinates and scores for education; do not present it as production-grade scoring.
- Keep your `GEMINI_API_KEY` private. Do not commit environment files with real keys.
- Logs/telemetry follow Google’s service terms; avoid sending sensitive text for analysis.
- Default prompts are intentionally minimal. Supply your own via env if you want a more guided experience.

## Known constraints
- Charts are tuned for short to medium inputs; very long texts may truncate labels.
- Tailwind is loaded via CDN for simplicity; there is no purge step.
- The UI expects the schema fields shown above; changing them requires matching TypeScript updates.
