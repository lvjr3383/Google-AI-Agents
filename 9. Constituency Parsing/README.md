<div align="center">
<img width="1200" height="475" alt="Constituency Parsing Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Syntax Architect: Constituency Parsing as a Guided Build

An educational constituency parser that walks learners through classifying tokens, fusing spans, and assembling the final tree—using construction metaphors instead of grammar jargon.

## Why we built it
- **Make phrase structure tangible.** Show how words “click” together into larger constituents.
- **Keep orientation.** A four-phase flow (classify → fuse → assemble → export) with clear step labels.
- **Teach visually.** Token badges, a CKY-style fusion grid, and the final linearized tree each tell part of the story.

## What the agent returns
- **Tokens:** `{ word, tag }` for “brick classification.”
- **Constituents:** `{ label, start, end }` spans for the fusion grid.
- **Linearized tree:** A parenthesized parse for the final export view.

## How the experience flows
1) **Guard light.** If the model response can’t be parsed, the app falls back to empty structures so the UI stays stable.  
2) **Step 1 · Material Sort.** Classify each word (POS tag) with family colors.  
3) **Step 2 · Fusion Grid.** Visualize which spans form constituents; hover to see tags and highlighted tokens.  
4) **Step 3 · Assembly.** Render the full tree in parenthesized form for quick inspection.  
5) **Step 4 · Export.** Show counts and the linearized tree as the “construction manual.”

## UI choices (education-first)
- Construction metaphors (bricks, fusion grid, pyramid) keep the tone approachable.
- Badges and hover highlights make spans scannable; tokens light up with their spans.
- Dark monospace panel for the final tree to emphasize structure.

## Under the hood
- **Client:** React + Vite + Tailwind.
- **Model:** Gemini (`gemini-3-flash-preview`) via `@google/genai`, returning tokens, spans, and a linearized tree in strict JSON.
- **Env:** Reads `API_KEY` or `GEMINI_API_KEY` from `.env.local`; no secrets in the repo.
- **Resilience:** Parsing errors return empty arrays/strings to avoid UI crashes.

## Run locally
Prerequisite: Node.js (LTS recommended).

1) Install dependencies  
   ```bash
   npm install
   ```
2) Add your Gemini key in `.env.local` (next to `package.json`):  
   ```bash
   API_KEY=your_gemini_api_key_here
   ```
3) Start the dev server  
   ```bash
   npm run dev
   ```
4) Open the local URL from the terminal and try the default sentence (“I shot an elephant in my pajamas”).

## Lessons learned
- A CKY-style grid is a friendly way to show span formation without heavy theory.
- Color families for tag types reduce cognitive load.
- Always fail soft: empty data beats a crash when the model response is off.

## What’s next
- Add a legend for phrase labels and color families.
- Offer a downloadable JSON export of tokens/constituents.
- Optional “explain a span” tooltip for key constituents.

## Safety and privacy
- Keep keys in `.env.local`; do not commit secrets.
- Use neutral demo text; avoid sensitive content.
