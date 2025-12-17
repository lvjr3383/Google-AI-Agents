# 🛰️ Intent Detection Lab (Google AI Studio)

An educational walkthrough of how an LLM can detect customer intent step by step—signal extraction, mapping into a 2D intent landscape, ranking candidate intents, and producing a routing payload. Prompts in the repo are intentionally minimal; keys stay in env.

## What we built
- A wizard-style UI that shows each phase of intent classification.
- A chat sidecar so users can ask “why” at each step.
- Visuals that map urgency vs. transactionality and show which intent wins.

## Why we built it
- Make intent classification explainable instead of a one-line label.
- Teach how triggers, coordinates, and probabilities relate to routing actions.
- Encourage experimentation with thresholds and follow-up questions.

## How it works (high level)
- **Models:** Gemini `gemini-3-pro-preview` for the main analysis; `gemini-2.5-flash` for fast Q&A.
- **Schema-driven:** analysis must return `signal` (text + triggers), `landscape` (x/y plus explanation), `competition` (top intents with probabilities), and `routing` (winner, payload, reasoning). The UI renders directly from this structure.
- **Axes:** X = informational (-10) to transactional (+10); Y = low urgency (-10) to high urgency (+10). Sample clusters: Account Security (~8, 8), Payments (~5, -5), General Support (~-8, -2).
- **Stack:** React + TypeScript + Vite, Tailwind via CDN, Recharts for plotting, Lucide for icons.

## User flow
1) **Input:** enter a customer request.  
2) **Signal:** highlight trigger phrases detected in the text.  
3) **Landscape:** place the request on the urgency/transactionality map.  
4) **Competition:** rank candidate intents (softmax-style) and show probabilities.  
5) **Routing:** generate a simple payload (action/priority/queue) plus reasoning.

## Lessons and design choices
- Deterministic rendering: every chart/step maps to a field in the JSON schema.
- Threshold tuning: the UI exposes a confidence slider to show how strict routing could be.
- Minimal prompts in code: enough to run; bring your own prompts via env if you want more flavor.

## Run locally

Prereqs: Node.js and a Gemini API key.

1) Install dependencies:
```bash
npm install
```
2) Add your key in `.env.local` (keep it out of git):
```bash
GEMINI_API_KEY=your_gemini_key_here
```
3) Start the dev server:
```bash
npm run dev
```
4) Open the URL from the terminal (defaults to `http://localhost:3000`).

## Privacy and limits
- Keep your API key private; do not commit `.env.local`.
- Avoid sending sensitive text; logs follow Google’s service terms.
- Prompts are minimal by design; the app still works, and you can override via env if desired.

## Files of interest
- `App.tsx` — orchestrates the wizard and layout.
- `components/ChatInterface.tsx` — chat + threshold controls.
- `components/AnalysisResult.tsx` — renders signal, landscape plot, competition, routing.
- `services/geminiService.ts` — Gemini calls and schema.
- `types.ts` — shared types and cluster definitions.
