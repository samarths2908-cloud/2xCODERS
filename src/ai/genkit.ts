import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Genkit automatically looks for GOOGLE_GENAI_API_KEY in the environment.
// We can also explicitly pass it if needed.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
