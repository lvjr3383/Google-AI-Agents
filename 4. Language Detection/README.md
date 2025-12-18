# 🌐 Language Detection Lab (Google AI Studio)

An educational, step-by-step language detector that acts like a “linguistic detective.” It walks through evidence collection, clue hunting, family/region mapping, tie-breaker probabilities, and a final “passport” with an action packet. Prompts in the repo are minimal; keys stay in env.

## Why we built it
- Make language detection explainable, not just a label.
- Show how clues (characters, ligatures, word fragments) map to linguistic families.
- Teach how confidence and “confusability” drive final answers and system actions.

## What you see (UX flow)
1) **Input:** provide text (and choose ELI5 or concise adult explanations).  
2) **Clue Hunt:** surface distinctive characters/letter patterns.  
3) **Neighborhood:** place the text in a language family/region on a 2D map.  
4) **Tie Breaker:** show top candidates with probabilities.  
5) **Passport:** finalize language, plus an action packet (ISO, direction, formatting, flag, action description).

## How it works (architecture)
- **Models:** Gemini `gemini-3-flash-preview` for detection; `gemini-3-pro-preview` for the detective chat flow.
- **Schema-driven:** detection returns language, confidence, clues, family, confusability list, actionPacket, summary, isGibberish.
- **Axes:** 2D “neighborhood” view (e.g., Romance vs. Slavic vs. Afroasiatic, etc.).
- **Stack:** React + TypeScript + Vite; Tailwind via CDN; minimal charts/logic in components.

## Lessons and design choices
- ELI5 toggle to switch between playful and concise explanations.
- Sequential steps to avoid blurting the answer too early; chat follows the current phase.
- Minimal prompts in code; override via env if you want richer wording.

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
Optional: override prompts (leave blank to use minimal defaults):
```bash
DETECT_PROMPT="Your detection prompt"
DETECT_CHAT_PROMPT="Your chat prompt"
```
3) Start the dev server:
```bash
npm run dev
```
4) Open the URL from the terminal (defaults to `http://localhost:3000`).

## Privacy and limits
- Keep your API key private; do not commit `.env.local`.
- Avoid sensitive input; logs follow Google service terms.
- Prompts are intentionally minimal; use env overrides if you want more detail.

## Files of interest
- `App.tsx` — orchestrates the pipeline and layout.
- `components/ChatInterface.tsx` — chat, ELI5 toggle, and step-aware guidance.
- `components/AnalysisResult.tsx` — clue list, family map, confusability, passport/action packet.
- `services/gemini.ts` — Gemini calls and schema.
- `types.ts` / `constants.ts` — shared types and family listings.
