# Agent QnA — How a QA Model Thinks (Visually)

Agent QnA is a split-screen teaching tool that shows how a QA system moves from a user question to a grounded answer. It keeps the vibe playful (“Agent QnA”) while exposing the four core stages: Intent → Evidence → Logic → Verdict.

## Why we built it
- Make question answering transparent instead of a black box.
- Teach newcomers how intent mapping, retrieval, attention, and grounding fit together.
- Show the model’s “reasoning” in a visual pipeline, not just a final sentence.

## What you get
- Two-panel layout: chat narration on the left, structured “workspace” on the right.
- Four steps visualized: saliency of the question, knowledge fragments, attention weighting, and a final verdict with grounding checks and a simple analogy.
- Lightweight React/Vite front-end; Tailwind for styling; all data comes from a single Gemini call with a structured schema.

## How it works (at a glance)
1) **Intent Mapping** — highlight which words carry weight, show a primary goal, and flag the “neural load” (complexity).  
2) **Knowledge Fragments** — list top facts with relative strength so users see what evidence is in play.  
3) **Attention & Logic** — show how focus is split across fragments, what logic combines them, and which noisy items were ignored.  
4) **Verdict** — deliver the answer plus a grounding check (2–3 supporting facts), a kid-friendly analogy, and a confidence note.

Under the hood, `geminiService.ts` calls Gemini with a schema so the response includes both chat text and workspace fields. The UI parses them into cards, bars, and lists without exposing any hidden prompts or keys.

## Quickstart (local)
Prereqs: Node.js.

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

## Repo layout
- `App.tsx` — split-screen layout, stage navigation, and workspace rendering.
- `constants.tsx` — high-level system instruction (no secrets).
- `geminiService.ts` — Gemini client + response parsing and safety guard for missing keys.
- `types.ts` — chat/workspace data contracts.

## Lessons learned
- Enforcing a structured response keeps the visuals stable even when the narrative is creative.
- Showing only a handful of fragments/weights is enough for users to “feel” retrieval and attention.
- A simple analogy + grounding check makes the verdict easier to trust (or question).
- Clear key handling prevents silent failures when the API key is missing.

## Next ideas
- Side-by-side comparison: retrieval-on vs. retrieval-off answers.
- Add latency and token-count callouts per stage.
- Let users toggle answer styles (concise vs. step-by-step) while keeping the same workspace.***
