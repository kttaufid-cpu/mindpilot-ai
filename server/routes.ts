import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  generateAiResponse, 
  generateTaskSuggestions, 
  analyzeSpending, 
  generateWellnessInsight,
  generateGoalActionPlan 
} from "./openai";

const FREE_AI_LIMIT = 15;
const FREE_DOCUMENT_LIMIT = 10;
const FREE_GOAL_LIMIT = 3;

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check AI usage limits
  async function checkAiLimit(userId: string, isPremium: boolean): Promise<{ allowed: boolean; remaining: number }> {
    if (isPremium) return { allowed: true, remaining: Infinity };
    const user = await storage.getUser(userId);
    const used = user?.aiResponsesUsedToday ?? 0;
    return { allowed: used < FREE_AI_LIMIT, remaining: FREE_AI_LIMIT - used };
  }

  // AI Chat endpoint
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { message, context } = req.body;

      const limitCheck = await checkAiLimit(userId, user?.isPremium ?? false);
      if (!limitCheck.allowed) {
        return res.status(429).json({ 
          message: "Daily AI limit reached. Upgrade to Premium for unlimited access.",
          remaining: 0
        });
      }

      const response = await generateAiResponse(message, context || "general");
      await storage.incrementAiResponses(userId);
      await storage.createAiChat({ userId, message, response, context });

      res.json({ response, remaining: limitCheck.remaining - 1 });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Tasks endpoints
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.createTask({ ...req.body, userId });
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.updateTask(parseInt(req.params.id), userId, req.body);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteTask(parseInt(req.params.id), userId);
      if (!success) return res.status(404).json({ message: "Task not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // AI Task suggestions (Premium only or limited)
  app.post('/api/tasks/ai-suggest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const limitCheck = await checkAiLimit(userId, user?.isPremium ?? false);
      if (!limitCheck.allowed) {
        return res.status(429).json({ message: "Daily AI limit reached" });
      }

      const tasks = await storage.getTasks(userId);
      const goals = await storage.getGoals(userId);
      
      const suggestions = await generateTaskSuggestions(
        tasks.map(t => t.title),
        goals.map(g => g.title),
        new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"
      );

      await storage.incrementAiResponses(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Task suggestion error:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  // Transactions endpoints
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transaction = await storage.createTransaction({ ...req.body, userId });
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.delete('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteTransaction(parseInt(req.params.id), userId);
      if (!success) return res.status(404).json({ message: "Transaction not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // AI Spending analysis
  app.get('/api/transactions/ai-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isPremium) {
        return res.status(403).json({ message: "Premium feature. Upgrade to access spending insights." });
      }

      const transactions = await storage.getTransactions(userId);
      const analysis = await analyzeSpending(
        transactions.map(t => ({
          amount: parseFloat(t.amount),
          category: t.category || "Uncategorized",
          description: t.description || ""
        }))
      );

      res.json({ analysis });
    } catch (error) {
      console.error("Spending analysis error:", error);
      res.status(500).json({ message: "Failed to analyze spending" });
    }
  });

  // Documents endpoints
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isPremium) {
        const count = await storage.getDocumentCount(userId);
        if (count >= FREE_DOCUMENT_LIMIT) {
          return res.status(403).json({ 
            message: `Document limit reached (${FREE_DOCUMENT_LIMIT}). Upgrade to Premium for unlimited storage.` 
          });
        }
      }

      const document = await storage.createDocument({ ...req.body, userId });
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.patch('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const document = await storage.updateDocument(parseInt(req.params.id), userId, req.body);
      if (!document) return res.status(404).json({ message: "Document not found" });
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteDocument(parseInt(req.params.id), userId);
      if (!success) return res.status(404).json({ message: "Document not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Wellness endpoints
  app.get('/api/wellness', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getWellnessEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching wellness entries:", error);
      res.status(500).json({ message: "Failed to fetch wellness entries" });
    }
  });

  app.post('/api/wellness', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.createWellnessEntry({ ...req.body, userId });
      res.json(entry);
    } catch (error) {
      console.error("Error creating wellness entry:", error);
      res.status(500).json({ message: "Failed to create wellness entry" });
    }
  });

  app.get('/api/wellness/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getTodayWellnessEntry(userId);
      res.json(entry || null);
    } catch (error) {
      console.error("Error fetching today's wellness:", error);
      res.status(500).json({ message: "Failed to fetch today's wellness" });
    }
  });

  // AI Wellness insights
  app.get('/api/wellness/ai-insight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isPremium) {
        return res.status(403).json({ message: "Premium feature. Upgrade for personalized wellness insights." });
      }

      const entries = await storage.getWellnessEntries(userId);
      const insight = await generateWellnessInsight(
        entries.slice(0, 7).map(e => ({
          mood: e.mood ?? 5,
          energyLevel: e.energyLevel ?? 5,
          sleepHours: parseFloat(e.sleepHours?.toString() ?? "7")
        }))
      );

      res.json({ insight });
    } catch (error) {
      console.error("Wellness insight error:", error);
      res.status(500).json({ message: "Failed to get insight" });
    }
  });

  // Goals endpoints
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isPremium) {
        const activeCount = await storage.getActiveGoalCount(userId);
        if (activeCount >= FREE_GOAL_LIMIT) {
          return res.status(403).json({ 
            message: `Goal limit reached (${FREE_GOAL_LIMIT}/month). Upgrade to Premium for unlimited goals.` 
          });
        }
      }

      const goal = await storage.createGoal({ ...req.body, userId });
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.updateGoal(parseInt(req.params.id), userId, req.body);
      if (!goal) return res.status(404).json({ message: "Goal not found" });
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteGoal(parseInt(req.params.id), userId);
      if (!success) return res.status(404).json({ message: "Goal not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // AI Goal action plan
  app.post('/api/goals/:id/ai-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isPremium) {
        return res.status(403).json({ message: "Premium feature. Upgrade for AI-generated action plans." });
      }

      const goals = await storage.getGoals(userId);
      const goal = goals.find(g => g.id === parseInt(req.params.id));
      
      if (!goal) return res.status(404).json({ message: "Goal not found" });

      const plan = await generateGoalActionPlan(goal.title, goal.description || "");
      
      await storage.updateGoal(goal.id, userId, { actionPlan: plan });
      
      res.json({ plan });
    } catch (error) {
      console.error("Goal plan error:", error);
      res.status(500).json({ message: "Failed to generate plan" });
    }
  });

  // User subscription status
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      res.json({
        isPremium: user?.isPremium ?? false,
        expiresAt: user?.premiumExpiresAt,
        aiResponsesUsedToday: user?.aiResponsesUsedToday ?? 0,
        aiLimit: user?.isPremium ? Infinity : FREE_AI_LIMIT,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
