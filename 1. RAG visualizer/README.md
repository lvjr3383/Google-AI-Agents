# Tesla RAG Visualizer

An interactive educational tool demonstrating Retrieval-Augmented Generation (RAG) concepts using a Tesla Model X manual corpus. 

This tool visualizes the RAG pipeline steps:
1. **Chunking Strategy**: See how text is split into overlapping segments.
2. **Vector Space**: Visualize text embeddings and query similarity in a 2D plot.
3. **Generation**: Compare "Pre-RAG" (hallucination-prone) answers vs. "RAG" (grounded) answers.

## Run Locally

### Prerequisites
- Node.js installed on your machine.
- A Google Gemini API Key.

### Steps

1. From the repository root, go to the project folder and install dependencies:
   ```bash
   cd "1. RAG visualizer"
   npm install
   ```

2. **Configure your API Key** (still inside `1. RAG visualizer`):
   - Get a free API key from [Google AI Studio](https://aistudio.google.com/).
   - Create a file named `.env` in the root directory of the project.
   - Add your key to the file (variable name must be `API_KEY`):
     ```env
     API_KEY=your_actual_api_key_string
     ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL provided in the terminal (usually `http://localhost:1234` or similar).

---
*Built with React, TailwindCSS, and the Google Gemini API.*
