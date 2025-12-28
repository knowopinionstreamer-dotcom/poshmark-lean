import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    // We removed googleAI() completely
    ollama({
      serverAddress: 'http://localhost:11434', // Using your local Ollama address
    }),
  ],
  // We force the default model to be your local Llama 3.2
  model: 'ollama/llama3.2', 
});