# 🧠 The Sentiment Extractor (Practical NLP Field Guide)

> **"To understand the model, we must slow it down."**

An end-to-end, explainable sentiment demo that turns a classifier into a glass box. It shows every stage—from tokenization to vector mapping to feature importance and the final signal—so learners can see how LLM-driven sentiment works. Prompts are kept minimal; you can override them via env vars if you want more flavor.

## Why we built it
- Make sentiment analysis teachable instead of a black box.
- Show that “meaning” is coordinates, weights, and thresholds, not magic.
- Encourage curious users to ask “why” at each step via the chat sidecar.

## What you see (UX flow)
- **Left panel (Chat + Controls):** send text, ask questions, tweak the confidence threshold, drive the step progression.
- **Right panel (Visualization):** four stages
  1) **Tokenization:** tokens, optional IDs, subword splits.
  2) **Vector Space:** scatter plot; X = sentiment (-10 to 10), Y = intensity/abstraction (-10 to 10); anchors + current point.
  3) **Explainability:** clickable heatmap words + sentiment arc over time.
  4) **Final Signal:** label, confidence meter vs. your threshold, plus a short “field note.”

## How it works (architecture)
- **Two-model flow:** a reasoning model returns structured JSON; a fast model answers follow-up questions without re-running analysis.
- **Strict schema:** the analysis response must include tokens, tokenIds, subwords, vector coordinates, high-impact words, sentiment arc, and lesson text so the UI can render deterministically.
- **Stack:** React + TypeScript + Vite, Tailwind (CDN), Recharts, Lucide.

## Lessons and design choices
- Interpretability first: every chart corresponds to a field in the schema; no hidden logic.
- Threshold as a teaching lever: users can tune “confidence” and see how it gates the final signal.
- Minimal prompts in repo: enough to run; override via env to experiment with your own wording.

## Quickstart
1) Install dependencies:
```bash
npm install
```
2) Add your Gemini key in `.env.local` (kept out of git):
```bash
GEMINI_API_KEY=your_gemini_key_here
```
Optional: override prompts (leave blank to use minimal defaults):
```bash
ANALYSIS_PROMPT="Your analysis prompt"
CHAT_PROMPT="Your chat prompt"
```
3) Run the dev server:
```bash
npm run dev
```
4) Open the UI, paste text, and click “Proceed to Next Step” to advance the pipeline.

## Project structure
- `App.tsx` — orchestrates the four-step state machine and layout.
- `components/AnalysisResult.tsx` — token view, vector plot, heatmap, sentiment arc, final signal, lesson.
- `components/ChatInterface.tsx` — chat UI, threshold slider, proceed/reset controls, suggested questions.
- `services/geminiService.ts` — API calls + schema enforcement (env-driven prompts allowed).
- `types.ts` — enums and interfaces for the analysis data.
- `.env.local` — your key and optional prompt overrides (not tracked).

## Data, privacy, and limits
- Outputs are illustrative for education; not production-grade scoring.
- Keep `GEMINI_API_KEY` private; do not commit env files with real keys.
- Avoid sending sensitive text; logs follow Google service terms.
- Charts favor short/medium inputs; very long text can truncate labels.
- Tailwind via CDN; no purge step. Changing schema requires matching TS updates.
