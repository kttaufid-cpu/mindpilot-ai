// Mock data store for demo mode
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  category?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  amount: string;
  type: "income" | "expense";
  category: string;
  description: string;
  date: string;
}

export interface WellnessEntry {
  id: number;
  mood: number;
  energyLevel: number;
  sleepHours: string;
  notes?: string;
  date: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  status: string;
  progress: number;
  targetDate?: string;
}

const STORAGE_KEYS = {
  tasks: "mindpilot_tasks",
  transactions: "mindpilot_transactions",
  wellness: "mindpilot_wellness",
  goals: "mindpilot_goals",
  subscription: "mindpilot_subscription",
};

export interface Subscription {
  isPremium: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  subscriptionStartDate: string | null;
  aiResponsesUsedToday: number;
  aiLimit: number;
  lastResetDate: string;
}

// Initial demo data
const initialTasks: Task[] = [
  { id: 1, title: "Review monthly budget", priority: "high", status: "pending", category: "finance", createdAt: new Date().toISOString() },
  { id: 2, title: "Morning meditation", priority: "medium", status: "completed", category: "wellness", createdAt: new Date().toISOString() },
  { id: 3, title: "Call insurance company", priority: "high", status: "pending", category: "personal", createdAt: new Date().toISOString() },
  { id: 4, title: "Prepare weekly meal plan", priority: "low", status: "pending", category: "health", createdAt: new Date().toISOString() },
];

const initialTransactions: Transaction[] = [
  { id: 1, amount: "5000.00", type: "income", category: "income", description: "Monthly salary", date: new Date().toISOString() },
  { id: 2, amount: "1200.00", type: "expense", category: "bills", description: "Rent payment", date: new Date().toISOString() },
  { id: 3, amount: "85.50", type: "expense", category: "food", description: "Grocery shopping", date: new Date().toISOString() },
  { id: 4, amount: "45.00", type: "expense", category: "transport", description: "Fuel", date: new Date().toISOString() },
];

const initialWellness: WellnessEntry[] = [
  { id: 1, mood: 7, energyLevel: 6, sleepHours: "7.5", notes: "Feeling good today", date: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, mood: 5, energyLevel: 4, sleepHours: "5", notes: "Tired from late night", date: new Date(Date.now() - 172800000).toISOString() },
];

const initialGoals: Goal[] = [
  { id: 1, title: "Save RM10,000 for emergency fund", description: "Build up emergency savings", status: "active", progress: 45 },
  { id: 2, title: "Exercise 3 times per week", description: "Improve fitness routine", status: "active", progress: 60 },
];

function getStore<T>(key: string, initial: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  } catch {
    return initial;
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const mockStore = {
  // Tasks
  getTasks: (): Task[] => getStore(STORAGE_KEYS.tasks, initialTasks),
  addTask: (task: Omit<Task, "id" | "createdAt">): Task => {
    const tasks = mockStore.getTasks();
    const newTask: Task = { ...task, id: Date.now(), createdAt: new Date().toISOString() };
    setStore(STORAGE_KEYS.tasks, [...tasks, newTask]);
    return newTask;
  },
  updateTask: (id: number, updates: Partial<Task>): Task | null => {
    const tasks = mockStore.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates };
    setStore(STORAGE_KEYS.tasks, tasks);
    return tasks[idx];
  },
  deleteTask: (id: number): boolean => {
    const tasks = mockStore.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    setStore(STORAGE_KEYS.tasks, filtered);
    return filtered.length < tasks.length;
  },

  // Transactions
  getTransactions: (): Transaction[] => getStore(STORAGE_KEYS.transactions, initialTransactions),
  addTransaction: (tx: Omit<Transaction, "id">): Transaction => {
    const txs = mockStore.getTransactions();
    const newTx: Transaction = { ...tx, id: Date.now() };
    setStore(STORAGE_KEYS.transactions, [...txs, newTx]);
    return newTx;
  },
  deleteTransaction: (id: number): boolean => {
    const txs = mockStore.getTransactions();
    const filtered = txs.filter(t => t.id !== id);
    setStore(STORAGE_KEYS.transactions, filtered);
    return filtered.length < txs.length;
  },

  // Wellness
  getWellnessEntries: (): WellnessEntry[] => getStore(STORAGE_KEYS.wellness, initialWellness),
  getTodayWellness: (): WellnessEntry | null => {
    const entries = mockStore.getWellnessEntries();
    const today = new Date().toDateString();
    return entries.find(e => new Date(e.date).toDateString() === today) || null;
  },
  addWellnessEntry: (entry: Omit<WellnessEntry, "id" | "date">): WellnessEntry => {
    const entries = mockStore.getWellnessEntries();
    const newEntry: WellnessEntry = { ...entry, id: Date.now(), date: new Date().toISOString() };
    setStore(STORAGE_KEYS.wellness, [...entries, newEntry]);
    return newEntry;
  },

  // Goals
  getGoals: (): Goal[] => getStore(STORAGE_KEYS.goals, initialGoals),
  addGoal: (goal: Omit<Goal, "id">): Goal => {
    const goals = mockStore.getGoals();
    const newGoal: Goal = { ...goal, id: Date.now() };
    setStore(STORAGE_KEYS.goals, [...goals, newGoal]);
    return newGoal;
  },
  updateGoal: (id: number, updates: Partial<Goal>): Goal | null => {
    const goals = mockStore.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    goals[idx] = { ...goals[idx], ...updates };
    setStore(STORAGE_KEYS.goals, goals);
    return goals[idx];
  },
  deleteGoal: (id: number): boolean => {
    const goals = mockStore.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    setStore(STORAGE_KEYS.goals, filtered);
    return filtered.length < goals.length;
  },

  // Subscription with 7-day trial
  getSubscription: (): Subscription => {
    const stored = localStorage.getItem(STORAGE_KEYS.subscription);
    const today = new Date().toDateString();
    
    if (stored) {
      const sub = JSON.parse(stored) as Subscription;
      
      // Reset daily AI count if new day
      if (sub.lastResetDate !== today) {
        sub.aiResponsesUsedToday = 0;
        sub.lastResetDate = today;
        localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(sub));
      }
      
      return sub;
    }
    
    // Initialize new trial
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const newSub: Subscription = {
      isPremium: false,
      trialStartDate: trialStart.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      subscriptionStartDate: null,
      aiResponsesUsedToday: 0,
      aiLimit: 15,
      lastResetDate: today,
    };
    
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(newSub));
    return newSub;
  },

  // Check if trial is active
  isTrialActive: (): boolean => {
    const sub = mockStore.getSubscription();
    if (sub.isPremium) return false;
    if (!sub.trialEndDate) return false;
    return new Date() < new Date(sub.trialEndDate);
  },

  // Get trial days remaining
  getTrialDaysRemaining: (): number => {
    const sub = mockStore.getSubscription();
    if (sub.isPremium || !sub.trialEndDate) return 0;
    const remaining = new Date(sub.trialEndDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  },

  // Upgrade to premium
  upgradeToPremium: (): Subscription => {
    const sub = mockStore.getSubscription();
    sub.isPremium = true;
    sub.subscriptionStartDate = new Date().toISOString();
    sub.aiLimit = Infinity;
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(sub));
    return sub;
  },

  // Increment AI usage
  incrementAiUsage: (): void => {
    const sub = mockStore.getSubscription();
    sub.aiResponsesUsedToday += 1;
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(sub));
  },

  // Check if can use AI
  canUseAi: (): boolean => {
    const sub = mockStore.getSubscription();
    if (sub.isPremium) return true;
    return sub.aiResponsesUsedToday < sub.aiLimit;
  },

  // AI Chat (mock responses)
  getAiResponse: (message: string): string => {
    const responses = [
      "Based on your schedule, I recommend tackling your high-priority tasks first thing in the morning when your energy is highest.",
      "Looking at your spending patterns, you're on track with your budget this month. Great job!",
      "I notice you've been sleeping less than 7 hours lately. Consider setting an earlier bedtime alarm.",
      "Your goal progress is looking good! You're 45% towards your emergency fund target.",
      "Today looks manageable. You have 3 pending tasks and your energy level from yesterday was 6/10.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },
};
