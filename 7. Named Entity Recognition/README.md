<div align="center">
<img width="1200" height="475" alt="Agent NER Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Entity Explorer: Guided Named Entity Recognition

This app turns Named Entity Recognition into a mini-lesson. A tutor sidebar keeps the conversation going while the main panel walks through token tagging, span grouping, type counts, and a colorized final view.

## Why we built it
- **Demystify “NER” for non-experts.** Show how models go from raw text to labeled spans without jargon overload.
- **Keep students in flow.** A single scrollable workspace and a tutor sidebar mean fewer context shifts.
- **Make structure visible.** BIO tags, span highlights, and a frequency chart offer multiple lenses on the same text.

## What the agent returns
- **Token tags:** BIO tags, labels, and character offsets for each token.
- **Entity spans:** Grouped entities with start/end offsets and consistent colors.
- **Stats:** Counts for Person, Organization, Location, Date, and Other.
- **Summary + insight:** One-line synthesis plus a short teaching note per run.
- **Pipeline notes:** Phase-by-phase explanations for each step (tokenize → span → stats → synthesize).

## How the experience flows
1) **Guard.** Check for English-like input (roughly 8–80 words); invalid text gets a concise nudge and empty results to keep the UI stable.  
2) **Phase 1 · Token tags.** Show BIO tags per token with offsets so students see where entities begin and end.  
3) **Phase 2 · Spans.** Group tokens into labeled spans, color-coded for quick scanning.  
4) **Phase 3 · Stats.** Aggregate counts into a bar chart using plain-label names (Person, Organization, Location, Date, Other).  
5) **Phase 4 · Final read.** Present the colorized text plus a one-line summary and a short “insight” about the entity mix.

## UI choices (education-first)
- Tutor chat stays on the left; the right panel animates each phase so the learner sees progression.
- Labels use full words, not acronyms; colors stay consistent between spans and the chart.
- Hover tooltips expose offsets; counts appear on the chart without requiring hover.
- Progress dots at the top mirror the four phases so users know where they are.

## Under the hood
- **Client:** React + Vite + Tailwind for the layout; Recharts for the entity frequency bar chart.
- **Model:** Gemini (`gemini-3-flash-preview`) returns strict JSON (tokens, spans, stats, summaries) via the `@google/genai` SDK.
- **Schema alignment:** Stats are limited to five buckets; colors map to PERSON/ORG/GPE/LOC/DATE with a default for everything else.

## Run locally
Prerequisite: Node.js (LTS recommended).

1) Install dependencies  
   ```bash
   npm install
   ```
2) Set your Gemini API key in `.env.local` (same level as `package.json`):  
   ```bash
   API_KEY=your_gemini_api_key_here
   ```
3) Start the dev server  
   ```bash
   npm run dev
   ```
4) Open the local URL shown in the terminal and try the starter text in the textbox.

## Lessons learned
- Guardrails keep the UI from breaking—invalid input still returns empty arrays and zeroed stats.
- Consistent labels/colors across spans and charts reduce cognitive load.
- Short, phase-specific explanations are better than one long wall of text.
- Keeping the final highlight at the bottom preserves narrative flow.

## What’s next
- Add a compact “label legend” pill strip above the highlights.
- Offer CSV/JSON export for tokens and spans.
- Add an optional “confidence hint” column if the model supports scores later on.

## Notes on safety and privacy
- Do not hardcode keys or secrets. Use `.env.local` and keep it out of version control.
- Keep demo text non-sensitive; avoid pasting private data into the analyzer.
