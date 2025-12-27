<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agent Summarizer — Compression Lab Notes

### What we built
Agent Summarizer is a visual “compression lab” that walks users through how a Gemini model strips, merges, and refines text into an essential summary. It is a React + Vite app with a split layout: the left pane is a conversational guide, the right pane is a live workspace that renders each pipeline phase.

### Why we built it
- Summarization often feels like a black box. We wanted a transparent, stepwise view that shows *why* information gets dropped or preserved.
- Educators and analysts needed a way to show trade-offs between brevity and fidelity without exposing full system prompts or internal logic.
- We also wanted a reusable scaffold for other “explain-the-model” demos across the Google AI Agents gallery.

### How the pipeline works (no secret sauce)
1) **Initialization (Scan)** — We ingest the raw text and capture simple physics: token counts, target size, audience dial, and reading-time estimates.  
2) **Scope & Context (Value Scan)** — Gemini ranks segments by salience and surfaces entities; the UI renders a “heatmap” of value nodes.  
3) **Synthesis (Concept Merge)** — Two key concepts are fused into a single bottleneck idea, showing how abstraction reduces redundancy.  
4) **Essence (Final Cut)** — A two-sentence summary plus a “cutting room floor” list that makes losses explicit and assigns a faithfulness score.  

All prompts stay minimal in the codebase: we only send enough instructions for structure and safety, not the full narrative copy you see in the UI.

### Architecture at a glance
- **Frontend:** React 19 + Vite 6, Tailwind via CDN for quick styling.  
- **State flow:** `App.tsx` coordinates pipeline steps and chat history; `ChatPanel` manages user prompts and TTS playback; `WorkspacePanel` renders the current phase.  
- **LLM integration:** `services/geminiService.ts` wraps Gemini 3 Flash for JSON-structured phases and Gemini TTS for optional narration. We check for `GEMINI_API_KEY` (or `API_KEY`) and fail fast with a friendly warning if missing.  
- **Types & safety:** Lightweight schemas (via `@google/genai` Type) ensure the model returns the fields each phase needs; basic guards prevent null UI states.

### Lessons learned
- Treat summaries as telemetry, not magic: exposing token budgets and losses builds user trust.  
- Visual anchors (heat orbs, accuracy ring) keep non-technical users engaged longer than plain text explanations.  
- Small, explicit schemas reduce LLM drift and make UI rendering predictable.  
- Text-to-speech is a pleasant add-on but needs truncation for latency; clamping to ~1k chars kept playback snappy.  
- Always gate on API keys early—silent failures create confusing UX.

### Run locally (minimal steps)
1. Install deps: `npm install`  
2. Add your Gemini key to `.env.local` as `GEMINI_API_KEY` (no other secrets required).  
3. Start dev server: `npm run dev` and open the printed localhost URL.  

If you deploy elsewhere, keep your key in env vars and avoid hardcoding prompts or tokens. The shipped configs are enough to reproduce the demo experience without exposing internal instructions.
