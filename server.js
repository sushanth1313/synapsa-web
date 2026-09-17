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

// Helper to detect Gemini 429 Quota / Rate Limit errors
function isGeminiQuotaError(err) {
  if (!err) return false;
  const errStr = (err.message || '') + ' ' + (typeof err === 'object' ? JSON.stringify(err) : String(err));
  return (
    err.status === 429 ||
    err.code === 429 ||
    err.statusCode === 429 ||
    err.response?.status === 429 ||
    err.error?.code === 429 ||
    errStr.includes('429') ||
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.includes('QuotaExceeded') ||
    errStr.includes('QUOTA_EXCEEDED') ||
    errStr.includes('rate limit') ||
    errStr.includes('request limit')
  );
}

function getRetryDelaySeconds(err) {
  try {
    const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err);
    const match = errStr.match(/"retryDelay"\s*:\s*"(\d+)s?"/i) || errStr.match(/"retryDelay"\s*:\s*(\d+)/i) || errStr.match(/retryAfter\s*[:=]\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  } catch (e) {}
  return null;
}

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

    let geminiErrorType = null;
    let retryDelaySec = null;
    let traceModel = 'gemini-3.6-flash';
    let traceHttpStatus = 200;
    let traceGeminiResponse = 'SUCCESS';

    try {
      console.log('NOVA REQUEST RECEIVED: YES');
      if (!gemini) {
        traceGeminiResponse = 'ERROR';
        geminiErrorType = 'AUTH';
        throw new Error("Gemini client not initialized. Check GEMINI_API_KEY.");
      }
      
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const config = {
        systemInstruction: fullSystemPrompt,
        temperature: 0.7,
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      console.log('GEMINI REQUEST SENT: YES');
      console.log('MODEL:', traceModel);

      const response = await gemini.models.generateContent({
        model: traceModel,
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

      console.log('HTTP STATUS:', traceHttpStatus);
      console.log('GEMINI RESPONSE:', traceGeminiResponse);

    } catch (geminiError) {
      traceGeminiResponse = 'ERROR';
      const status = geminiError.status || geminiError.code || geminiError.statusCode || geminiError.response?.status || geminiError.error?.code || 500;
      traceHttpStatus = status;
      const errStr = (geminiError.message || '') + ' ' + (typeof geminiError === 'object' ? JSON.stringify(geminiError) : String(geminiError));
      
      if (status === 401 || status === 403 || errStr.includes('401') || errStr.includes('403')) {
        geminiErrorType = 'AUTH';
      } else if (status === 404 || errStr.includes('404')) {
        geminiErrorType = 'NOT_FOUND';
      } else if (status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('QuotaExceeded') || errStr.includes('QUOTA_EXCEEDED') || errStr.includes('rate limit') || errStr.includes('request limit')) {
        geminiErrorType = 'QUOTA';
        retryDelaySec = getRetryDelaySeconds(geminiError);
      } else {
        geminiErrorType = 'OTHER';
      }
      
      console.log('HTTP STATUS:', traceHttpStatus);
      console.log('GEMINI RESPONSE:', traceGeminiResponse);
      console.log('ERROR TYPE:', geminiErrorType);
      console.error('Safe Error Details:', geminiError?.message || geminiErrorType);
    }

    if (geminiErrorType || !responseText) {
      console.log("Gemini failed or returned empty. Applying Local Fallbacks...");

      const lowerText = latestMessage.toLowerCase();
      
      const intents = {
        mood: ['how are you', 'mood', 'feel good', 'happy', 'feeling', 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'ভালে আছো', 'ভাল আছি', 'মই ভালে আছো', 'feel', 'feeling'],
        game: ['game', 'play', 'ಆಟ', 'খেল', 'গেম'],
        routine: ['routine', 'schedule', 'what to do', 'today', 'ದಿನಚರಿ', 'ৰুটিন', 'রুটিন'],
        tired: ['tired', 'calm', 'exhausted', 'ಸುಸ್ತಾಗಿದೆ', 'ভাগৰ', 'ক্লান্ত', 'rest'],
        help: ['help', 'assist', 'ಸಹಾಯ', 'সহায়', 'সাহায্য', 'support'],
        important: ['important', 'activity', 'ಮುಖ್ಯ', 'গুৰুত্বপূৰ্ণ', 'গুরুত্বপূর্ণ']
      };

      const detectIntent = (text) => {
        for (const [intent, keywords] of Object.entries(intents)) {
          if (keywords.some(kw => text.includes(kw))) return intent;
        }
        return 'unknown';
      };

      const intent = detectIntent(lowerText);
      const isKn = targetLanguage === 'Kannada';
      const isAs = targetLanguage === 'Assamese';
      const isBn = targetLanguage === 'Bengali';

      let fallbackText = '';
      
      if (intent === 'mood') {
        if (isKn) fallbackText = 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ! ನೀವು ಹೇಗಿದ್ದೀರಿ?';
        else if (isAs) fallbackText = 'মই ভালে আছো! আপুনি কেনে আছে?';
        else if (isBn) fallbackText = 'আমি ভালো আছি! আপনি কেমন আছেন?';
        else fallbackText = 'I am doing well! How are you feeling today?';
      } else if (intent === 'game') {
        if (isKn) fallbackText = 'ನಾವು ಒಂದು ಆಟ ಆಡೋಣ ಬನ್ನಿ. [NAVIGATE: /games]';
        else if (isAs) fallbackText = 'আহক আমি এটা খেল খেলোঁ। [NAVIGATE: /games]';
        else if (isBn) fallbackText = 'আসুন একটি গেম খেলি। [NAVIGATE: /games]';
        else fallbackText = 'Let\'s play a game together. [NAVIGATE: /games]';
      } else if (intent === 'routine') {
        if (isKn) fallbackText = 'ಇಂದಿನ ನಿಮ್ಮ ದಿನಚರಿ ಇಲ್ಲಿದೆ. [NAVIGATE: /routine]';
        else if (isAs) fallbackText = 'আজিৰ আপোনাৰ ৰুটিন ইয়াত দিয়া হৈছে। [NAVIGATE: /routine]';
        else if (isBn) fallbackText = 'আজকের আপনার রুটিন এখানে। [NAVIGATE: /routine]';
        else fallbackText = 'Here is your routine for today. [NAVIGATE: /routine]';
      } else if (intent === 'tired') {
        if (isKn) fallbackText = 'ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಾವು ಕೆಲವು ಶಾಂತಿಯುತ ಚಟುವಟಿಕೆಗಳನ್ನು ಮಾಡೋಣ. [NAVIGATE: /calm]';
        else if (isAs) fallbackText = 'জিৰণি লওক। আমি কিছু শান্তিপূৰ্ণ কাম কৰোঁ আহক। [NAVIGATE: /calm]';
        else if (isBn) fallbackText = 'বিশ্রাম নিন। চলুন কিছু শান্ত কার্যকলাপ করি। [NAVIGATE: /calm]';
        else fallbackText = 'Take some rest. Let us do some calming activities. [NAVIGATE: /calm]';
      } else if (intent === 'help') {
        if (isKn) fallbackText = 'ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಏನು ಬೇಕು ಎಂದು ಹೇಳಿ.';
        else if (isAs) fallbackText = 'মই আপোনাক সহায় কৰিবলৈ ইয়াত আছো। অনুগ্ৰহ কৰি কি লাগে কওক।';
        else if (isBn) fallbackText = 'আমি আপনাকে সাহায্য করতে এখানে আছি। অনুগ্রহ করে বলুন কী দরকার।';
        else fallbackText = 'I am here to help you. Please tell me what you need.';
      } else if (intent === 'important') {
        if (isKn) fallbackText = 'ನಿಮ್ಮ ಪ್ರಮುಖ ಚಟುವಟಿಕೆಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು. [NAVIGATE: /routine]';
        else if (isAs) fallbackText = 'আপোনাৰ গুৰুত্বপূৰ্ণ কামবোৰ ইয়াত চাব পাৰে। [NAVIGATE: /routine]';
        else if (isBn) fallbackText = 'আপনার গুরুত্বপূর্ণ কাজগুলো এখানে দেখতে পারেন। [NAVIGATE: /routine]';
        else fallbackText = 'You can see your important activities here. [NAVIGATE: /routine]';
      } else {
        if (isKn) fallbackText = 'ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ನಾವು ಬೇರೆ ಏನಾದರೂ ಮಾಡೋಣವೇ?';
        else if (isAs) fallbackText = 'ক্ষমা কৰিব, মই বুজি পোৱা নাই। আমি বেলেগ কিবা কৰোঁ নেকি?';
        else if (isBn) fallbackText = 'দুঃখিত, আমি বুঝতে পারিনি। আমরা কি অন্য কিছু করব?';
        else fallbackText = 'I am having some trouble right now, but I am still here. Let\'s do a memory exercise or check your schedule.';
      }
      
      responseText = fallbackText;
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

if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`NOVA AI Backend running on http://localhost:${PORT}`);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

export default app;
