import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Wallet, 
  Calendar, 
  Heart, 
  Target, 
  MessageSquare,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";

export default function Landing() {
  const { login } = useAuth();

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    login();
  };

  const features = [
    { icon: Brain, title: "AI Task Pilot", description: "Auto-generated daily tasks, priority sorting, smart reminders", label: "Tasks", tab: "tasks" },
    { icon: Wallet, title: "Smart Money View", description: "Track spending, see patterns, get gentle budget alerts", label: "Money", tab: "finance" },
    { icon: Calendar, title: "Life Organizer Hub", description: "Keep documents and notes in one secure, searchable place", label: "Organization", tab: "dashboard" },
    { icon: Heart, title: "Wellness Coach", description: "Sleep, breaks, movement nudges at the right moments", label: "Habits", tab: "wellness" },
    { icon: Target, title: "Goal Navigator", description: "Set monthly goals with realistic weekly action plans", label: "Goals", tab: "dashboard" },
    { icon: MessageSquare, title: "Smart Summaries", description: "AI reads the long stuff, gives you the 10-second version", label: "Summaries", tab: "dashboard" },
  ];

  const handleFeatureClick = (tab: string) => {
    login(tab);
  };

  const pricingPlans = [
    {
      name: "Free Forever",
      price: "RM0",
      period: "lifetime",
      features: [
        "15 AI responses per day",
        "Manual task management",
        "Basic mood tracking",
        "Up to 10 documents",
        "3 goals per month",
        "5 summaries per day",
      ],
      cta: "Start Free",
      featured: false,
    },
    {
      name: "Premium",
      price: "RM9.90",
      period: "/month",
      features: [
        "Unlimited AI responses",
        "Auto-generated daily tasks",
        "Smart financial sync & insights",
        "Unlimited cloud storage",
        "Unlimited goals + action plans",
        "Priority AI processing",
        "No ads, encrypted backup",
      ],
      cta: "Start 7-Day Free Trial",
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MindPilot AI" className="w-8 h-8 rounded-xl" />
            <span className="font-semibold text-lg">MindPilot AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogin}
              className="px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/50 transition"
            >
              Log in
            </button>
            <button 
              onClick={handleLogin}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 text-sm text-muted-foreground mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI life assistant for adults 25–50
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  <span className="gradient-text">MindPilot AI</span>
                  <br />
                  The assistant thinks ahead for you.
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mb-8">
                  Automate your tasks, money, and daily routines with a single AI assistant built for real life — not just work.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> AI plans your day</span>
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Clear spending view</span>
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Smarter routines</span>
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> One app for life</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
                  >
                    Start 7-Day Free Trial <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border font-medium hover:bg-muted/50 transition"
                  >
                    Try Free Forever
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  No credit card needed for Free plan. Cancel or downgrade anytime.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-3xl p-6 glow"
              >
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <span>Today with MindPilot</span>
                  <span className="text-accent">AI mode: Active</span>
                </div>
                <div className="bg-background/50 rounded-2xl p-5 border border-border">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs mb-3">
                    Daily plan generated by AI
                  </div>
                  <p className="text-sm mb-4">Here's how I'm planning your day:</p>
                  <div className="space-y-3">
                    {[
                      { label: "Deep work block", time: "9:00–11:00 · High-focus tasks", badge: "Priority", color: "bg-green-400/10 text-green-400", tab: "tasks" },
                      { label: "Bills & money check-in", time: "You have 1 bill due in 3 days", badge: "Finance", color: "bg-blue-400/10 text-blue-400", tab: "finance" },
                      { label: "Energy break & stretch", time: "3:00 PM · Based on your calendar", badge: "Wellness", color: "bg-purple-400/10 text-purple-400", tab: "wellness" },
                      { label: "Evening recap", time: "I'll send a 60-second summary at 9 PM", badge: "Summary", color: "bg-orange-400/10 text-orange-400", tab: "dashboard" },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleFeatureClick(item.tab)}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${item.color}`}>{item.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything you need, powered by AI.</h2>
              <p className="text-muted-foreground">
                MindPilot AI combines tasks, finances, routines, coaching, and summaries into one intelligent assistant.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleFeatureClick(feature.tab)}
                  className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">{feature.label}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-2 flex items-center gap-2">
                    <feature.icon className="w-5 h-5 text-primary" />
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium">
                    <span>Cuba Sekarang</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-20 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">From sign-up to "life on autopilot" in 3 steps.</h2>
                <p className="text-muted-foreground mb-8">
                  Get started in minutes and let MindPilot take over the mental load.
                </p>
                <div className="space-y-6 border-l border-border pl-6">
                  {[
                    { step: "1", title: "Sign up & connect", desc: "Create your account and tell MindPilot about your goals and habits." },
                    { step: "2", title: "AI learns your routine", desc: "MindPilot analyzes your patterns and starts building your personalized system." },
                    { step: "3", title: "Life on autopilot", desc: "Wake up to a planned day, tracked finances, and wellness reminders — all automatic." },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <div className="absolute -left-[1.65rem] w-3 h-3 rounded-full border-2 border-accent bg-background" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Step {item.step}</p>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-20 h-20 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">AI-powered automation</p>
                  <p className="text-sm text-muted-foreground/70">Learns and adapts to you</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground">Start free forever or unlock everything with Premium.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pricingPlans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass rounded-3xl p-8 ${plan.featured ? 'border-primary glow' : ''}`}
                >
                  {plan.featured && (
                    <div className="flex items-center gap-1 text-primary text-sm mb-4">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleLogin}
                    className={`block w-full text-center py-3 rounded-full font-medium transition ${
                      plan.featured
                        ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25'
                        : 'border border-border hover:bg-muted/50'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MindPilot AI" className="w-6 h-6 rounded-lg" />
              <span>MindPilot AI</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition">Privacy</a>
              <a href="#" className="hover:text-foreground transition">Terms</a>
              <a href="#" className="hover:text-foreground transition">Support</a>
            </div>
            <p>© {new Date().getFullYear()} MindPilot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
