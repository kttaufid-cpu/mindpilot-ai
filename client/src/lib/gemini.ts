// Google Gemini AI Integration for MindPilot
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Default API key for the app
const DEFAULT_API_KEY = "AIzaSyAa-wV9Ea8DR--jIdEJHgt6oa5k7Y8noWo";

// Store API key in localStorage for demo (in production, use backend)
const STORAGE_KEY = "mindpilot_gemini_key";

export const geminiService = {
  // Set API key
  setApiKey: (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
  },

  // Get API key (use default if not set)
  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_KEY;
  },

  // Check if API key is set (always true now with default)
  hasApiKey: (): boolean => {
    return true;
  },

  // Remove API key
  removeApiKey: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Generate AI response
  chat: async (message: string, context?: string): Promise<string> => {
    const apiKey = geminiService.getApiKey();
    
    if (!apiKey) {
      return "Sila masukkan API Key Gemini anda di bahagian Profile untuk menggunakan AI.";
    }

    const systemPrompt = `Anda adalah MindPilot AI, pembantu kehidupan peribadi yang mesra dan pintar. 
Anda membantu pengguna dengan:
- Pengurusan tugas dan produktiviti
- Perancangan kewangan dan bajet
- Kesihatan dan kesejahteraan
- Penetapan matlamat dan perancangan

Konteks pengguna: ${context || "Tiada konteks tambahan"}

Berikan respons yang ringkas, praktikal, dan membantu dalam Bahasa Malaysia atau English mengikut bahasa soalan pengguna.`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          return "API Key tidak sah. Sila semak API Key anda di Profile.";
        }
        throw new Error(error.error?.message || "Gemini API error");
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        return "Maaf, saya tidak dapat menjana respons. Sila cuba lagi.";
      }

      return text;
    } catch (error) {
      console.error("Gemini API error:", error);
      return "Ralat sambungan ke AI. Sila semak internet anda dan cuba lagi.";
    }
  },

  // Generate task suggestions
  suggestTasks: async (existingTasks: string[]): Promise<string[]> => {
    const prompt = `Berdasarkan tugas sedia ada: ${existingTasks.join(", ")}
    
Cadangkan 3 tugas baru yang berkaitan dan berguna. Format: senarai ringkas sahaja, satu tugas per baris.`;

    const response = await geminiService.chat(prompt);
    return response.split("\n").filter(line => line.trim()).slice(0, 3);
  },

  // Analyze spending
  analyzeSpending: async (transactions: { description: string; amount: number; type: string }[]): Promise<string> => {
    const summary = transactions.map(t => `${t.description}: RM${t.amount} (${t.type})`).join("\n");
    const prompt = `Analisis perbelanjaan ini dan beri nasihat ringkas:
${summary}

Berikan 2-3 tip untuk menambah baik kewangan.`;

    return geminiService.chat(prompt);
  },

  // Wellness advice
  getWellnessAdvice: async (mood: number, energy: number, sleep: number): Promise<string> => {
    const prompt = `Pengguna melaporkan:
- Mood: ${mood}/10
- Tenaga: ${energy}/10  
- Tidur: ${sleep} jam

Berikan nasihat kesihatan ringkas dan positif (2-3 ayat).`;

    return geminiService.chat(prompt);
  },

  // Daily summary
  generateDailySummary: async (tasks: number, completed: number, spending: number): Promise<string> => {
    const prompt = `Ringkasan hari ini:
- Tugas: ${completed}/${tasks} siap
- Perbelanjaan: RM${spending}

Berikan ulasan ringkas dan motivasi untuk esok (2-3 ayat).`;

    return geminiService.chat(prompt);
  }
};

export default geminiService;
