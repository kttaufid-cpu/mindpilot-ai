import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn, getGreeting, formatCurrency, formatDate, getMoodEmoji, getPriorityColor } from "@/lib/utils";
import { mockStore, Task, Transaction, WellnessEntry, Goal, Subscription } from "@/lib/mockData";
import { geminiService } from "@/lib/gemini";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Heart,
  User,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  LogOut,
  Crown,
  Check,
  Trash2,
  FileText,
  Calendar,
  Clock,
  Zap,
} from "lucide-react";

type Tab = "dashboard" | "tasks" | "finance" | "wellness" | "profile";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  // Check for saved tab from landing page feature click
  useEffect(() => {
    const savedTab = localStorage.getItem("mindpilot_selected_tab");
    if (savedTab && ["dashboard", "tasks", "finance", "wellness", "profile"].includes(savedTab)) {
      setActiveTab(savedTab as Tab);
      localStorage.removeItem("mindpilot_selected_tab");
    }
  }, []);

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks" as Tab, label: "Tasks", icon: CheckSquare },
    { id: "finance" as Tab, label: "Finance", icon: Wallet },
    { id: "wellness" as Tab, label: "Wellness", icon: Heart },
    { id: "profile" as Tab, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <nav className="fixed left-0 top-0 h-full w-20 lg:w-64 glass border-r border-border flex flex-col py-6 z-50">
        <div className="flex items-center gap-3 px-4 lg:px-6 mb-8">
          <img src="/logo.png" alt="MindPilot AI" className="w-10 h-10 rounded-xl" />
          <span className="hidden lg:block font-semibold text-lg">MindPilot AI</span>
        </div>

        <div className="flex-1 px-3 lg:px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2 transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="px-3 lg:px-4 mt-auto">
          <TrialBanner refresh={refresh} />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block text-sm">Log out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <DashboardTab user={user} refreshKey={refreshKey} refresh={refresh} />}
            {activeTab === "tasks" && <TasksTab refreshKey={refreshKey} refresh={refresh} />}
            {activeTab === "finance" && <FinanceTab refreshKey={refreshKey} refresh={refresh} />}
            {activeTab === "wellness" && <WellnessTab refreshKey={refreshKey} refresh={refresh} />}
            {activeTab === "profile" && <ProfileTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardTab({ user, refreshKey, refresh }: { user: any; refreshKey: number; refresh: () => void }) {
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const subscription = mockStore.getSubscription();

  useEffect(() => {
    setTasks(mockStore.getTasks());
    setTransactions(mockStore.getTransactions());
    setGoals(mockStore.getGoals());
  }, [refreshKey]);

  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const totalExpenses = transactions.filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const activeGoals = goals.filter(g => g.status === "active").length;

  const handleAiChat = async () => {
    if (!aiMessage.trim()) return;
    setIsThinking(true);
    
    // Build context from user data
    const context = `Tugas pending: ${pendingTasks}, Perbelanjaan bulan ini: RM${totalExpenses.toFixed(2)}, Matlamat aktif: ${activeGoals}`;
    
    try {
      const response = await geminiService.chat(aiMessage, context);
      setAiResponse(response);
      mockStore.incrementAiUsage();
    } catch (error) {
      setAiResponse("Maaf, berlaku ralat. Sila cuba lagi.");
    } finally {
      setIsThinking(false);
      setAiMessage("");
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {getGreeting()}, {user?.firstName || "there"}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your day.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-muted-foreground">Pending Tasks</span>
          </div>
          <p className="text-3xl font-bold">{pendingTasks}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-muted-foreground">This Month</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-muted-foreground">Active Goals</span>
          </div>
          <p className="text-3xl font-bold">{activeGoals}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-muted-foreground">AI Responses</span>
          </div>
          <p className="text-3xl font-bold">
            {subscription.aiResponsesUsedToday}
            <span className="text-base text-muted-foreground font-normal">
              /{subscription.isPremium ? "∞" : subscription.aiLimit}
            </span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Ask MindPilot AI</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiChat()}
                placeholder="Ask me anything about your day, tasks, or goals..."
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleAiChat}
                disabled={isThinking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {isThinking && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Thinking...
              </div>
            )}
            {aiResponse && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's Tasks</h2>
            <span className="text-xs text-muted-foreground">{pendingTasks} pending</span>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition"
              >
                <div className={cn("w-2 h-2 rounded-full", task.status === "completed" ? "bg-green-400" : "bg-yellow-400")} />
                <span className={cn("text-sm flex-1", task.status === "completed" && "line-through text-muted-foreground")}>
                  {task.title}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(task.priority))}>
                  {task.priority}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add your first task!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksTab({ refreshKey, refresh }: { refreshKey: number; refresh: () => void }) {
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTasks(mockStore.getTasks());
    setIsLoading(false);
  }, [refreshKey]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    mockStore.addTask({ title: newTask, priority, status: "pending" });
    setNewTask("");
    refresh();
  };

  const handleToggleTask = (id: number, currentStatus: string) => {
    mockStore.updateTask(id, { status: currentStatus === "completed" ? "pending" : "completed" });
    refresh();
  };

  const handleDeleteTask = (id: number) => {
    mockStore.deleteTask(id);
    refresh();
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Tasks</h1>
        <p className="text-muted-foreground">Manage your tasks and let AI help you prioritize.</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Add a new task..."
            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={handleAddTask}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length ? (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 flex items-center gap-4"
            >
              <button
                onClick={() => handleToggleTask(task.id, task.status)}
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition",
                  task.status === "completed"
                    ? "bg-green-500 border-green-500"
                    : "border-border hover:border-primary"
                )}
              >
                {task.status === "completed" && <Check className="w-4 h-4 text-white" />}
              </button>
              <div className="flex-1">
                <p className={cn("font-medium", task.status === "completed" && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                  </p>
                )}
              </div>
              <span className={cn("text-xs px-3 py-1 rounded-full", getPriorityColor(task.priority))}>
                {task.priority}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Add your first task above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FinanceTab({ refreshKey, refresh }: { refreshKey: number; refresh: () => void }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTransactions(mockStore.getTransactions());
    setIsLoading(false);
  }, [refreshKey]);

  const handleAddTransaction = () => {
    if (!amount || !description) return;
    mockStore.addTransaction({
      amount: parseFloat(amount).toFixed(2),
      description,
      category,
      type,
      date: new Date().toISOString(),
    });
    setAmount("");
    setDescription("");
    refresh();
  };

  const handleDeleteTransaction = (id: number) => {
    mockStore.deleteTransaction(id);
    refresh();
  };

  const totalIncome = transactions.filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const categories = ["general", "food", "transport", "entertainment", "bills", "shopping", "health", "income"];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Finance</h1>
        <p className="text-muted-foreground">Track your spending and income.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-muted-foreground">Total Income</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm text-muted-foreground">Total Expenses</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Add Transaction</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition",
                type === "expense" ? "bg-red-500/20 text-red-400" : "bg-muted/50 text-muted-foreground"
              )}
            >
              Expense
            </button>
            <button
              onClick={() => setType("income")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition",
                type === "income" ? "bg-green-500/20 text-green-400" : "bg-muted/50 text-muted-foreground"
              )}
            >
              Income
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (RM)"
            className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={handleAddTransaction}
          className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          Add Transaction
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : transactions.length ? (
            transactions.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                  t.type === "income" ? "bg-green-500/10" : "bg-red-500/10")}>
                  {t.type === "income" ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category} • {formatDate(t.date)}</p>
                </div>
                <p className={cn("font-semibold", t.type === "income" ? "text-green-400" : "text-red-400")}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
                <button
                  onClick={() => handleDeleteTransaction(t.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet. Start tracking your money!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WellnessTab({ refreshKey, refresh }: { refreshKey: number; refresh: () => void }) {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<WellnessEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setEntries(mockStore.getWellnessEntries());
    setTodayEntry(mockStore.getTodayWellness());
    setIsLoading(false);
  }, [refreshKey]);

  const handleSaveCheckin = () => {
    mockStore.addWellnessEntry({
      mood,
      energyLevel: energy,
      sleepHours: sleep.toString(),
      notes,
    });
    setNotes("");
    refresh();
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Wellness</h1>
        <p className="text-muted-foreground">Track your mood, energy, and habits.</p>
      </div>

      {!todayEntry && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Today's Check-in</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Mood ({mood}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-center text-2xl mt-2">{getMoodEmoji(mood)}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Energy Level ({energy}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Sleep Hours ({sleep}h)</label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about today..."
            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
            rows={3}
          />
          <button
            onClick={handleSaveCheckin}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Save Check-in
          </button>
        </div>
      )}

      {todayEntry && (
        <div className="glass rounded-2xl p-6 mb-6 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">Today's check-in complete!</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl">{getMoodEmoji(todayEntry.mood || 5)}</p>
              <p className="text-xs text-muted-foreground">Mood: {todayEntry.mood}/10</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayEntry.energyLevel}/10</p>
              <p className="text-xs text-muted-foreground">Energy</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayEntry.sleepHours}h</p>
              <p className="text-xs text-muted-foreground">Sleep</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Wellness History</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : entries.length ? (
            entries.slice(0, 7).map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                <div className="text-2xl">{getMoodEmoji(entry.mood || 5)}</div>
                <div className="flex-1">
                  <p className="font-medium">{formatDate(entry.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    Mood: {entry.mood}/10 • Energy: {entry.energyLevel}/10 • Sleep: {entry.sleepHours}h
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wellness entries yet. Start tracking above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [subscription, setSubscription] = useState(mockStore.getSubscription());
  const [trialDays, setTrialDays] = useState(mockStore.getTrialDaysRemaining());
  const [isTrialActive, setIsTrialActive] = useState(mockStore.isTrialActive());
  const [apiKey, setApiKey] = useState(geminiService.getApiKey() || "");
  const [apiKeySaved, setApiKeySaved] = useState(geminiService.hasApiKey());
  const goals = mockStore.getGoals();

  const handleUpgrade = () => {
    mockStore.upgradeToPremium();
    setSubscription(mockStore.getSubscription());
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      geminiService.setApiKey(apiKey.trim());
      setApiKeySaved(true);
    }
  };

  const handleRemoveApiKey = () => {
    geminiService.removeApiKey();
    setApiKey("");
    setApiKeySaved(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          {subscription.isPremium && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Premium</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goals
          </h3>
          <p className="text-3xl font-bold mb-1">{goals.length}</p>
          <p className="text-sm text-muted-foreground">
            {subscription.isPremium ? "Unlimited goals" : `${3 - goals.filter(g => g.status === "active").length} remaining this month`}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Documents
          </h3>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-sm text-muted-foreground">
            {subscription.isPremium ? "Unlimited storage" : "10 remaining"}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Langganan</h3>
        {subscription.isPremium ? (
          <div>
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Pelan Premium Aktif</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Anda mempunyai akses penuh termasuk AI tanpa had, storan tanpa had, dan matlamat tanpa had.
            </p>
          </div>
        ) : isTrialActive ? (
          <div>
            <div className="flex items-center gap-2 text-yellow-400 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Percubaan Percuma</span>
              <span className="ml-auto text-sm">{trialDays} hari lagi</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mb-4">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${((7 - trialDays) / 7) * 100}%` }}
              />
            </div>
            <p className="text-muted-foreground mb-4">
              Nikmati semua ciri Premium secara percuma untuk 7 hari. Selepas itu, langgan untuk terus menggunakan.
            </p>
            <button 
              onClick={handleUpgrade}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Langgan Sekarang - RM9.90/bulan
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Percubaan Tamat</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Tempoh percubaan percuma anda telah tamat. Langgan sekarang untuk terus menggunakan MindPilot AI.
            </p>
            <button 
              onClick={handleUpgrade}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Langgan Sekarang - RM9.90/bulan
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">AI Usage Today</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ 
                width: subscription.isPremium 
                  ? "10%" 
                  : `${Math.min(100, (subscription.aiResponsesUsedToday / subscription.aiLimit) * 100)}%` 
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {subscription.aiResponsesUsedToday} / {subscription.isPremium ? "∞" : subscription.aiLimit}
          </span>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Google Gemini API Key
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Masukkan API key Gemini anda untuk mengaktifkan AI sebenar. 
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline ml-1"
          >
            Dapatkan API key percuma →
          </a>
        </p>
        
        {apiKeySaved ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              ✓ API Key telah disimpan (***{apiKey.slice(-6)})
            </div>
            <button
              onClick={handleRemoveApiKey}
              className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition"
            >
              Buang
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none text-sm"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrialBanner({ refresh }: { refresh: () => void }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trialDays, setTrialDays] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    const sub = mockStore.getSubscription();
    setSubscription(sub);
    setTrialDays(mockStore.getTrialDaysRemaining());
    setIsTrialActive(mockStore.isTrialActive());
  }, []);

  const handleUpgrade = () => {
    mockStore.upgradeToPremium();
    setSubscription(mockStore.getSubscription());
    refresh();
  };

  if (!subscription) return null;

  if (subscription.isPremium) {
    return (
      <div className="hidden lg:block glass rounded-2xl p-4 mb-4 border border-green-500/30">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Premium Active</span>
        </div>
        <p className="text-xs text-muted-foreground">Unlimited AI & all features unlocked</p>
      </div>
    );
  }

  if (isTrialActive) {
    return (
      <div className="hidden lg:block glass rounded-2xl p-4 mb-4 border border-yellow-500/30">
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Free Trial</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {trialDays} hari lagi dalam percubaan percuma
        </p>
        <div className="w-full h-1.5 bg-muted rounded-full mb-3">
          <div 
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${((7 - trialDays) / 7) * 100}%` }}
          />
        </div>
        <button 
          onClick={handleUpgrade}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Langgan RM9.90/bulan
        </button>
      </div>
    );
  }

  return (
    <div className="hidden lg:block glass rounded-2xl p-4 mb-4 border border-red-500/30">
      <div className="flex items-center gap-2 text-red-400 mb-2">
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Percubaan Tamat</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Langgan sekarang untuk terus menggunakan MindPilot AI
      </p>
      <button 
        onClick={handleUpgrade}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
      >
        Langgan RM9.90/bulan
      </button>
    </div>
  );
}
