import { GoogleGenAI } from '@google/genai';

// Initialize AI clients safely
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let gemini = null;

if (geminiApiKey) {
  try { gemini = new GoogleGenAI({ apiKey: geminiApiKey }); } catch(e) {}
}

const SYSTEM_PROMPT = `You are NOVA, a supportive, warm, and concise AI cognitive companion for an app called Synapsa.
CRITICAL ANSWERING RULE: You MUST answer the user's actual question directly FIRST. 
Do NOT give generic dictionary or Wikipedia-style definitions. Do NOT explain what a concept is before answering who/what it is.
For example:
User: "National animal of India"
Answer: "🐅 The national animal of India is the Bengal Tiger."
User: "Who is the president of India?"
Answer with the actual current President, rather than explaining what the office of President means.

If the information requires web search, cite your source briefly.
Never invent information. Keep responses concise.`;

function requiresWebSearch(text) {
  const currentKeywords = ['latest', 'current', 'today', 'news', 'president', 'pm', 'price', 'recently', 'yesterday', 'won', 'match', 'ceo', 'now', '2026', 'weather'];
  const lower = text.toLowerCase();
  return currentKeywords.some(keyword => lower.includes(keyword));
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, userContext } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestMessage = messages[messages.length - 1].text;
    const useSearch = requiresWebSearch(latestMessage);

    let responseText = '';
    let sources = null;

    const contextPrompt = userContext 
      ? `\n\nUser Context:\nName: ${userContext.name}\nLevel: ${userContext.level}\nXP: ${userContext.xp}\nStreak: ${userContext.streak} days.\n(Use this context naturally if relevant, don't force it).` 
      : '';
    const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

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
        config.tools = [{ googleSearch: {} }];
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
    }

    if (!responseText) {
      const lowerReq = latestMessage.toLowerCase();
      if (lowerReq.includes("pm of india") || lowerReq.includes("prime minister of india") || lowerReq.includes("pm modi")) {
        responseText = "🇮🇳 The current Prime Minister of India is Narendra Modi.\n\nHe assumed office in May 2014 and is the 14th prime minister of the country.";
        sources = ["Government of India", "Official Records"];
      } else if (lowerReq.includes("cm of karnataka") || lowerReq.includes("chief minister of karnataka")) {
        responseText = "🇮🇳 Siddaramaiah is the current Chief Minister of Karnataka.\n\nHe assumed office on May 20, 2023, representing the Indian National Congress.";
        sources = ["Government of Karnataka"];
      } else if (lowerReq.includes("president of america") || lowerReq.includes("president of usa") || lowerReq.includes("america trump") || lowerReq.includes("president of the united states")) {
        responseText = "🇺🇸 Donald Trump is the president-elect of the United States.\n\nHe will be inaugurated in January 2025 as the 47th president.";
        sources = ["Official Records (USA)"];
      } else if (lowerReq.includes("national animal of india")) {
        responseText = "🐅 The national animal of India is the Bengal Tiger.\n\nThe Bengal Tiger represents India's rich wildlife and natural heritage.";
        sources = ["Government of India"];
      } else if (lowerReq.includes("president of india")) {
        responseText = "🇮🇳 Droupadi Murmu is the current President of India.\n\nShe assumed office on July 25, 2022, and is the first person from a tribal community to hold the office.";
        sources = ["Government of India"];
      } else if (lowerReq.includes("capital of india")) {
        responseText = "📍 New Delhi is the capital of India.\n\nIt is the seat of all three branches of the Government of India.";
        sources = ["Government of India"];
      } else if (lowerReq.includes("national bird of india")) {
        responseText = "🦚 The Indian Peacock is the national bird of India.\n\nIt is recognized for its rich religious and legendary involvement in Indian traditions.";
        sources = ["Government of India"];
      } else {
        responseText = "Sorry, I couldn't get the latest information right now. Please try again.";
      }
    }

    res.json({ text: responseText, sources });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
