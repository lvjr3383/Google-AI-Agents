<div align="center">
<img width="1200" height="475" alt="POS Agent Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GrammarLens: Part-of-Speech Tagging as an Educational Agent

This project turns a POS tagger into a guided learning experience. Instead of tossing a user a raw table of tags, the agent walks through the why, what, and how of tagging, with a conversational coach on the left (about 30% of the screen) and a rich workspace on the right (about 70%). The focus is to help non-experts see how sentences are built, not to overwhelm them with abbreviations.

## Why we built it
- **Shrink the gap between theory and intuition.** POS tags can feel abstract; we surface them step-by-step with explanations.
- **Keep the user in flow.** A conversational guide paired with a staged workspace keeps the mental load low.
- **Make structure visible.** Bar charts, token tables, and colorized text give multiple views of the same analysis.

## How the experience unfolds
1) **Input guard.** The agent checks that the text looks like an English sentence of reasonable length. If it isn’t, the user gets a friendly nudge to try something simpler.
2) **Step 1 · Tokenize.** Show how the sentence splits into tokens and lemmas (dictionary forms). This demystifies the idea of “tokenization.”
3) **Step 2 · Tag.** Add parts of speech and head words, but display full names (e.g., “Determiner,” “Adjective,” “Proper Noun”) instead of cryptic abbreviations. A brief “spotlight” explains two tags in plain English.
4) **Step 3 · Aggregate.** Count the tags and render a horizontal bar chart with inline counts so users don’t need to hover. Labels use full POS names to stay readable.
5) **Step 4 · Present.** Colorize the original sentence by POS and keep it at the bottom of the workspace to avoid jumping back to the top. A short summary highlights the overall structure and invites another run.

## What the agent returns
- **Token table:** index, token, base form, POS (full name), head word.
- **Tag spotlight:** two short explanations to contrast tags found in the sentence.
- **Chart data:** labels and counts ready for visualization.
- **Colorized spans:** text chunks keyed to POS colors for the final highlighted sentence.
- **Markdown summary:** one punchy line about the sentence structure.

## UI design choices (educational over flashy)
- Full POS names by default; abbreviations only appear in tooltips.
- Counts are printed on the bars; hover is optional, not required.
- Consistent colors between chart and highlighted text for faster scanning.
- A linear scroll: input → table → spotlight → chart → final colorized sentence. No jump-backs.

## Under the hood (conceptual)
- The chat panel collects the sentence and triggers the analysis steps.
- The workspace renders different slices of the analysis as the user clicks through steps.
- Gemini provides the POS analysis and returns structured JSON for tokens, chart data, spans, and explanations.
- A simple POS name map keeps labels user-friendly, and the layout ensures the final reveal stays at the bottom of the flow.

## How to run locally
Prerequisites: Node.js (LTS recommended).

1) Install dependencies:
   ```bash
   npm install
   ```
2) Set your API key in `.env.local`:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```
3) Start the dev server:
   ```bash
   npm run dev
   ```
4) Open the local URL shown in the terminal. Use one of the starter sentences in the chat panel to see the flow.

## Lessons learned
- **Clarity beats completeness.** Showing full POS names and inline counts helps users trust what they see.
- **Flow matters.** Keeping the final highlight at the bottom reduces context-switching fatigue.
- **Explain just enough.** Two short tag spotlights per run give value without overwhelming the reader.
- **Align data and visuals.** Shared color cues across chart and spans reduce cognitive load.

## What’s next
- Add a toggle to reveal abbreviations for curious users.
- Offer downloadable CSV/JSON for tokens and counts.
- Add a compact dependency tree view for advanced readers, but keep it optional.

## Stay privacy- and security-aware
- Do not hardcode keys or secrets. Use `.env.local` and never commit it.
- Keep examples harmless and non-sensitive; avoid uploading private text for analysis.
