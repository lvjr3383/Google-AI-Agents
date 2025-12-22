<div align="center">
<img width="1200" height="475" alt="Structure Sentinel Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Structure Sentinel: Dependency Parsing as a Guided Lesson

This app turns dependency parsing into an interactive walkthrough. A tutor sidebar keeps the dialogue going while the main panel steps through root detection, head–dependent links, an ASCII tree, and a distilled [Actor → Action → Recipient] triple.

## Why we built it
- **Make syntax concrete.** Seeing roots, links, and trees side-by-side demystifies how parsers read sentences.
- **Keep learners oriented.** A linear, four-phase flow with a visible stepper avoids context switching.
- **Teach with visuals.** Link cards, ASCII trees, and a core-logic triple give multiple entry points to the same structure.

## What the agent returns
- **Validity gate:** Flags if the sentence is parseable and supplies a friendly message if not.
- **Anchor:** Root verb + POS with a short explanation.
- **Linkage:** Key dependency connections (head, relation, dependent) with a plain-language note.
- **Hierarchy:** ASCII-style tree plus a structural summary.
- **Revelation:** Actor/Action/Recipient triple with a one-line explanation.
- **Tutor prompts:** Suggested follow-up questions to guide the learner.

## How the experience flows
1) **Guard.** If the text isn’t a clear English sentence, the agent returns empty structures and a validation note so the UI stays stable.  
2) **Phase 1 · Anchor.** Identify the root verb and surface its role.  
3) **Phase 2 · Linkage.** Show the head–dependent relations as cards for quick scanning.  
4) **Phase 3 · Hierarchy.** Render an ASCII tree to make depth visible.  
5) **Phase 4 · Revelation.** Boil the sentence down to Actor → Action → Recipient, with a short rationale.

## UI choices (education-first)
- Stepper across the top mirrors the four phases; content stacks below so learners can scroll back without losing place.
- Cards and badges replace dense tables to keep relations scannable.
- ASCII tree stays monospace on a dark panel for contrast; explanations sit next to visuals.
- Tutor sidebar offers example sentences and follow-up questions for self-guided exploration.

## Under the hood
- **Client:** React + Vite + Tailwind for layout and transitions.
- **Model:** Gemini (`gemini-3-pro-preview` for parsing, `gemini-3-flash-preview` for Q&A) via `@google/genai`, returning strict JSON shaped to the UI.
- **Resilience:** Invalid inputs still return empty anchors/linkage/tree/triple so the UI doesn’t crash; API key pulled from `API_KEY` or `GEMINI_API_KEY`.

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
4) Open the local URL from the terminal and try one of the sidebar examples.

## Lessons learned
- Guardrails matter: even bad input should return safe, empty structures.
- Visual variety helps: links as cards, trees as monospace, triples as bold pills.
- Short, per-phase explanations beat one long wall of text.
- A simple Actor → Action → Recipient frame makes even complex trees feel usable.

## What’s next
- Add a compact dependency legend for relation labels.
- Offer optional confidence or score hints when models expose them.
- Export links/tree/triple as JSON for lesson handouts.

## Safety and privacy
- Keep keys in `.env.local`; don’t commit secrets.
- Avoid pasting sensitive text; use neutral examples.
