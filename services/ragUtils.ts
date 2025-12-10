import { Chunk } from '../types';

/**
 * Splits text into chunks based on word count with overlap.
 */
export const chunkText = (text: string, chunkSize: number, overlap: number): Chunk[] => {
  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');
  const chunks: Chunk[] = [];
  
  // Guard against infinite loops or invalid inputs
  const safeSize = Math.max(10, chunkSize);
  const safeOverlap = Math.min(safeSize - 1, Math.max(0, overlap));
  const step = safeSize - safeOverlap;

  for (let i = 0; i < words.length; i += step) {
    const end = Math.min(i + safeSize, words.length);
    const chunkWords = words.slice(i, end);
    const chunkText = chunkWords.join(' ');
    
    chunks.push({
      id: `chunk-${chunks.length + 1}`,
      text: chunkText,
      startWordIndex: i,
      endWordIndex: end,
    });

    if (end >= words.length) break;
  }
  
  return chunks;
};

/**
 * Calculates cosine similarity between two vectors.
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Projects a high-dimensional vector to 2D for visualization.
 * Uses a deterministic random projection (hashing based).
 */
export const projectTo2D = (vector: number[], seed: number): { x: number; y: number } => {
    // Simple deterministic projection for demo purposes
    // In a real app with mathjs, we'd use a fixed matrix multiplication
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < vector.length; i++) {
        // Pseudo-random weights based on dimension index
        const wx = Math.sin(i * 1.1 + seed) * (Math.cos(i * 0.5));
        const wy = Math.cos(i * 1.3 + seed) * (Math.sin(i * 0.8));
        x += vector[i] * wx;
        y += vector[i] * wy;
    }
    
    return { x, y };
};