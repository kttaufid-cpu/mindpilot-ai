import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function getOpenAI(): OpenAI {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please add your OPENAI_API_KEY to use AI features.");
  }
  return openai;
}

export async function generateAiResponse(
  prompt: string,
  context: string,
  userHistory?: string
): Promise<string> {
  const systemPrompt = `You are MindPilot AI, a friendly and intelligent personal life assistant. You help users manage their tasks, finances, wellness, and personal goals. 
  
Your personality:
- Warm, supportive, and encouraging
- Concise but thorough
- Action-oriented - always suggest next steps
- Personalized - reference user's context when available

Current context: ${context}
${userHistory ? `Recent user activity: ${userHistory}` : ""}

Respond in a helpful, human-like manner. Keep responses focused and actionable.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1000,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateTaskSuggestions(
  userTasks: string[],
  userGoals: string[],
  timeOfDay: string
): Promise<{ title: string; description: string; priority: string }[]> {
  const prompt = `Based on the user's existing tasks and goals, suggest 3 new tasks that would help them be more productive today.

Existing tasks: ${userTasks.join(", ") || "None"}
User goals: ${userGoals.join(", ") || "None"}
Time of day: ${timeOfDay}

Respond with a JSON array of exactly 3 task objects, each with:
- title: short task title
- description: brief description
- priority: "high", "medium", or "low"`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a productivity assistant that suggests actionable tasks. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.tasks || [];
  } catch (error) {
    console.error("Task suggestion error:", error);
    return [];
  }
}

export async function analyzeSpending(
  transactions: { amount: number; category: string; description: string }[]
): Promise<string> {
  const prompt = `Analyze these spending transactions and provide brief insights:

${JSON.stringify(transactions.slice(0, 20))}

Provide:
1. Top spending categories
2. Any concerning patterns
3. One actionable tip to save money

Keep the response under 150 words.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a friendly financial advisor providing spending insights." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 300,
    });

    return response.choices[0].message.content || "Unable to analyze spending at this time.";
  } catch (error) {
    console.error("Spending analysis error:", error);
    return "Unable to analyze spending at this time.";
  }
}

export async function generateWellnessInsight(
  recentEntries: { mood: number; energyLevel: number; sleepHours: number }[]
): Promise<string> {
  const prompt = `Based on these recent wellness check-ins, provide a brief personalized insight:

${JSON.stringify(recentEntries)}

Include:
1. A pattern you noticed
2. One specific wellness tip
3. An encouraging note

Keep it warm and under 100 words.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a supportive wellness coach. Be warm and encouraging." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 200,
    });

    return response.choices[0].message.content || "Keep taking care of yourself!";
  } catch (error) {
    console.error("Wellness insight error:", error);
    return "Keep taking care of yourself!";
  }
}

export async function generateGoalActionPlan(
  goalTitle: string,
  goalDescription: string
): Promise<{ week: number; action: string; milestone: string }[]> {
  const prompt = `Create a 4-week action plan for this goal:

Goal: ${goalTitle}
Description: ${goalDescription}

Respond with JSON containing an array of 4 week objects, each with:
- week: week number (1-4)
- action: specific action to take that week
- milestone: what success looks like`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a goal-setting coach. Create realistic, actionable plans. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.plan || [];
  } catch (error) {
    console.error("Goal plan error:", error);
    return [];
  }
}
