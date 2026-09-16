import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI clients safely
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let gemini = null;

if (geminiApiKey) {
  try { gemini = new GoogleGenAI({ apiKey: geminiApiKey }); } catch(e) {}
}

const SYSTEM_PROMPT = `You are NOVA, a supportive, warm, and concise AI cognitive companion for an app called Synapsa.
Your purpose is to assist elderly users with cognitive care, memory games, daily routines, reminders, and emotional wellness.
CRITICAL RULES:
1. ONLY answer questions related to cognitive care, the user's daily routine, games, or general emotional support.
2. If the user asks a general knowledge question, POLITELY REDIRECT them to cognitive care tasks. Do NOT answer the general question. 
3. NEVER give medical diagnoses or claim to be a doctor.
4. Be very concise and warm.
5. If the user wants to navigate somewhere in the app (e.g. go to games, show my routine, go home), end your response exactly with the tag [NAVIGATE: <path>] where path is one of: /games, /routine, /, /progress, /calm, /memory-game.`;

// Intelligent Routing Helper
function requiresWebSearch(text) {
  const currentKeywords = ['latest', 'current', 'today', 'news', 'president', 'pm', 'price', 'recently', 'yesterday', 'won', 'match', 'ceo', 'now', '2026', 'weather'];
  const lower = text.toLowerCase();
  return currentKeywords.some(keyword => lower.includes(keyword));
}

// -----------------------------------------------------------------
// MOCK DATABASE & RBAC FOR DEMONSTRATION
// -----------------------------------------------------------------
const MOCK_DB = {
  patients: {
    'patient-1': { id: 'patient-1', name: 'Ravi Sharma', level: 3, xp: 450, streak: 5 },
    'patient-2': { id: 'patient-2', name: 'Anjali Das', level: 1, xp: 120, streak: 2 }
  },
  caregivers: {
    'cg-1': {
      id: 'cg-1', 
      name: 'Dr. Neha', 
      assignedPatients: ['patient-1'] // cg-1 is only allowed to access patient-1
    }
  }
};

app.get('/api/patient/:id', (req, res) => {
  const { id } = req.params;
  const caregiverId = req.headers['x-caregiver-id'];
  
  if (!caregiverId || !MOCK_DB.caregivers[caregiverId]) {
    return res.status(401).json({ error: 'Unauthorized: Caregiver ID required' });
  }

  const caregiver = MOCK_DB.caregivers[caregiverId];
  if (!caregiver.assignedPatients.includes(id)) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to view this patient\'s data.' });
  }

  const patient = MOCK_DB.patients[id];
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  res.json({ success: true, data: patient });
});
// -----------------------------------------------------------------

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext, language } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestMessage = messages[messages.length - 1].text;
    const useSearch = requiresWebSearch(latestMessage);

    let responseText = '';
    let sources = null;

    // Build context-aware prompt
    const contextPrompt = userContext 
      ? `\n\nUser Context:\nName: ${userContext.name}\nLevel: ${userContext.level}\nXP: ${userContext.xp}\nStreak: ${userContext.streak} days.\nRoutine Today: ${userContext.routine || 'None'}\n(Answer routine questions using this routine context).` 
      : '';
      
    // Language enforcement
    const langNames = {
      'en-IN': 'English',
      'kn-IN': 'Kannada',
      'bn-IN': 'Bengali',
      'as-IN': 'Assamese'
    };
    const targetLanguage = language ? (langNames[language] || language) : 'English';
    const langPrompt = `\n\nCRITICAL LANGUAGE RULE: You MUST generate your response text ENTIRELY in ${targetLanguage}. Do NOT respond in English unless ${targetLanguage} is English. Any navigation tags like [NAVIGATE: /games] must still be in English exactly as specified, but the rest of the spoken text must be fully translated to ${targetLanguage}.`;

    const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt + langPrompt;

    let geminiErrorMsg = '';

    try {
      if (!gemini) throw new Error("Gemini client not initialized. Check GEMINI_API_KEY.");
      
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const config = {
        systemInstruction: fullSystemPrompt,
        temperature: 0.7,
      };

      if (useSearch) {
        console.log('Using Gemini with Google Search Grounding...');
        config.tools = [{ googleSearch: {} }];
      } else {
        console.log('Using Gemini (Normal mode)...');
      }

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: latestMessage }] }
        ],
        config
      });

      responseText = response.text || '';
      
      if (useSearch) {
        if (response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent) {
           sources = ["Google Search"];
        } else if (response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length > 0) {
           sources = response.candidates[0].groundingMetadata.groundingChunks.map(chunk => chunk.web?.title).filter(Boolean);
        }
      }

    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      geminiErrorMsg = geminiError.message || String(geminiError);
    }

    // Ultimate fallback if API failed or missing keys
    if (!responseText) {
      console.log("Gemini failed or returned empty. Applying Fallbacks...");
      responseText = geminiErrorMsg ? `Backend AI Error: ${geminiErrorMsg}` : "I am having some trouble right now, but I am still here. Let's do a memory exercise or check your schedule.";
    }

    let action = null;
    const navMatch = responseText.match(/\[NAVIGATE:\s*([^\]]+)\]/i);
    if (navMatch) {
      action = navMatch[1].trim();
      responseText = responseText.replace(/\[NAVIGATE:\s*([^\]]+)\]/i, '').trim();
    }

    res.json({ success: true, response: responseText, sources, action });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error', response: "Nova is having trouble connecting right now. Please try again." });
  }
});

// Serve static files from the React app (for production deployment on Render)
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`NOVA AI Backend running on http://localhost:${PORT}`);
});
