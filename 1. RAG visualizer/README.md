# Tesla RAG Visualizer

An interactive walkthrough of Retrieval-Augmented Generation using a Tesla Model X manual corpus. It shows chunking, embedding, retrieval, and side-by-side answers (pre-RAG vs. RAG) so learners can see how grounding reduces hallucinations. Prompts in the repo are intentionally minimal; you can override them via env if you want more elaborate wording.

## Why we built it
- Teach RAG as a sequence of concrete steps, not a buzzword.
- Show the impact of chunk sizing/overlap on retrieval quality.
- Contrast grounded answers vs. “guessy” answers to highlight why context matters.

## What you see (UX flow)
1) **Chunking:** choose size/overlap, split the manual, and embed each chunk.  
2) **Vector space:** visualize query vs. chunks with similarity scores.  
3) **Generation:** compare “pre-RAG” (no context) and “RAG” (context-bound) answers; see token counts.  
4) **Analysis:** quick commentary on whether the RAG answer was grounded or declined.

## How it works (architecture)
- **Data:** sample excerpts from the Tesla Model X manual.
- **Pipeline:** chunk → embed (Gemini embeddings) → similarity ranking → prompt with/without context → render answers and scores.
- **Prompts:** minimal templates in code; override via env for custom phrasing.
- **Stack:** React + TypeScript + Vite, Tailwind (CDN), lightweight charts/logic in components.

## Lessons and takeaways
- Chunking matters: size/overlap affect recall and answer quality.
- Grounded prompts reduce hallucination but may return “don’t know” when context is thin.
- Token budgeting: the UI surfaces counts to show context size trade-offs.

## Run locally

### Prerequisites
- Node.js
- Google Gemini API key

### Steps
1. From the repo root:
   ```bash
   cd "1. RAG visualizer"
   npm install
   ```
2. Add your key (or copy `.env.example`):
   ```env
   GEMINI_API_KEY=your_actual_api_key_string
   ```
   Optional prompt overrides (leave blank to use the minimal defaults):
   ```env
   PRE_RAG_PROMPT="Answer concisely. Question: {{question}}"
   RAG_PROMPT="Use only the provided context to answer. If missing, say you do not know.\n\nContext:\n{{context}}\n\nQuestion: {{question}}"
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open the URL from the terminal (typically `http://localhost:3000`).

## Privacy and limits
- Keep `GEMINI_API_KEY` private; do not commit env files with real keys.
- Avoid sending sensitive questions; logs follow Google service terms.
- Minimal prompts ship in repo; use env to supply richer wording if desired.

---
*Built with React, TailwindCSS, and the Google Gemini API.*
