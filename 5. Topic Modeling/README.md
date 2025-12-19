<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Topic Modeling Hub

An interactive, sci‑fi‑styled walkthrough of Latent Dirichlet Allocation (LDA) that shows how 20 short reviews get distilled, vectorized, clustered, and mapped into five themes. Think of it as a lab tour for people who learn best by seeing the gears turn.

## What we’re doing
- Demonstrating the end-to-end intuition of LDA on a tiny, transparent dataset (cars, phones, movies, sports, food).
- Visualizing each stage: stop-word removal, word-frequency “dictionary,” probabilistic clustering, and the final topic atlas.
- Letting an on-screen “agent” narrate progress with concise explanations (no secrets baked in).

## Why it matters
- Topic modeling is usually hidden behind notebooks; this makes the pipeline tangible for newcomers.
- Visual feedback reduces the mystery of “black-box” clustering and helps teams reason about feature quality.
- Small, curated corpora are perfect for teaching—fast iterations, visible effects, no heavy infrastructure.

## How it works (high level)
1) **Distillation (Preprocessing)** — Stop words fade out; topic keywords get dotted underlines and color pins so you can see potential signals.  
2) **Dictionary (Vectorization)** — A simple frequency matrix highlights which words dominate each document.  
3) **Iteration (LDA vibes)** — Animated particles wander, then converge into five color-coded clusters when you click “GROUP NOW.”  
4) **Atlas (Mapping)** — Final topic bubbles orbit a center point, each showing top indicator keywords.

## Run it locally
**Prereqs:** Node.js 18+ recommended.

```bash
cd "5. Topic Modeling"
cp .env.local .env.local    # keep the filename; just edit the value
# Add your Gemini key: GEMINI_API_KEY=YOUR_KEY
npm install
npm run dev
```
Open http://localhost:3000 and step through the stages. If you don’t set a key, the agent falls back to safe, generic copy; the visuals still run offline.

## Ways to experiment (no secret sauce required)
- **Swap the corpus:** Edit `constants.ts` to add or replace the sample reviews and keywords. You’ll immediately see different clusters.  
- **Change the palette/physics:** Tweak colors or particle counts in `components/stages/LDAIteration.tsx` to alter the convergence feel.  
- **Adjust the narration tone:** Update the short explanation templates in `services/geminiService.ts`—keep them concise to avoid UI overflow.  
- **Hide/show hints:** Remove the dotted keyword underlines in `Preprocessing.tsx` to test how much guidance users need.

## Lessons learned
- Keep fallbacks: if there’s no API key or a network hiccup, the app still educates instead of failing hard.  
- Short latency wins: a small timeout plus a local default response keeps the agent feeling responsive.  
- Visuals teach faster than text: showing stop-word removal and cluster formation reduces the need for long prompts.  
- Scope beats scale: a 20-document set is enough to explain LDA without overwhelming newcomers.

## Deployment note
No secrets live in the repo. Provide `GEMINI_API_KEY` at runtime (e.g., `.env.local` or your host’s env management) and run `npm run build` for a static export. Adjust CSP or CORS only if your hosting platform requires it.
