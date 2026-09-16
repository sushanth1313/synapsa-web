import { GoogleGenAI } from '@google/genai';
console.log('GoogleGenAI type:', typeof GoogleGenAI);
try {
  const gemini = new GoogleGenAI({ apiKey: 'dummy' });
  console.log('Success!', typeof gemini.models.generateContent);
} catch (e) {
  console.error('Error:', e);
}
