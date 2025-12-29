<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agent Texty — Travel Weaver Lab Notes

### Why we built this
- Text generation feels abstract; we wanted a playful lab that shows how retrieval, planning, and style knobs shape what the model writes.  
- Parents, teachers, and curious builders kept asking “how does the AI pick words?”—this demo exposes the pipeline without revealing internal prompts.  
- The travel theme gives a concrete anchor (BNA → destination) so users can see facts, probabilities, and attention in action.

### What we built
- A React + Vite single-page lab with two panels: chat-led guidance on the left and a multi-step “lab workspace” on the right.  
- Four phases: Grounding (fact injection), Planning (timeline scaffold), Probability (style sliders), and Output (journal + attention highlights).  
- Optional TTS playback and quick PDF export—kept lightweight to avoid leaking any prompt details.

### How it works (high-level, no secret sauce)
1) **Grounding Engine** — We ask Gemini Flash to fetch structured facts (flight, restaurant, attraction) and dedupe grounding URLs.  
2) **Logical Planner** — A JSON timeline (days with AM/PM) is generated so long-form text stays coherent.  
3) **Probability Engine** — Simple sliders alter vocabulary and excitement; we render a probability bar to visualize word bias.  
4) **Synthesis + Attention Pins** — Gemini Pro turns facts + plan into a ~300-word “Junior Jetsetter Journal.” Highlighted tokens map back to the grounded facts; TTS is capped to ~1k chars for snappy playback.  

All prompts are minimal and task-scoped—no private keys or full instruction sets are exposed in code or UI.

### Lessons learned
- Guardrails matter: fail fast when the API key is missing; block “Next” if grounding/plan is empty.  
- Grounding chunks + visible highlights boost trust; users see exactly which fact powered which word.  
- Small schemas reduce LLM drift and make UI rendering stable.  
- Trimming audio input keeps playback responsive; long TTS calls hurt UX.  
- Travel as a domain is vivid enough to teach probabilities without leaking internal logic.

### Run locally (minimal steps)
1. Install deps: `npm install`  
2. Add your Gemini key to `.env.local` as `GEMINI_API_KEY` (no other secrets required).  
3. Start dev server: `npm run dev` and open the printed localhost URL.  

Keep keys in env vars; avoid hardcoding prompts or tokens. The shipped code is the minimum needed to reproduce the demo experience safely.
