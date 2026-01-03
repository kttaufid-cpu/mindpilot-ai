import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelector from "@/components/LanguageSelector";
import { 
  Brain, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface RegisterProps {
  onRegister: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => void;
  onBack: () => void;
  selectedTab?: string;
}

export default function Register({ onRegister, onBack, selectedTab }: RegisterProps) {
  const { t } = useTranslation();
  const { loginWithEmail, loginWithGoogle, error: authError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!isLoginMode) {
      if (!firstName.trim()) newErrors.firstName = "Nama pertama diperlukan";
      if (!lastName.trim()) newErrors.lastName = "Nama akhir diperlukan";
    }
    if (!email.trim()) {
      newErrors.email = "Email diperlukan";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak sah";
    }
    if (!password) {
      newErrors.password = "Kata laluan diperlukan";
    } else if (!isLoginMode && password.length < 6) {
      newErrors.password = "Kata laluan mesti sekurang-kurangnya 6 aksara";
    }
    if (!isLoginMode && !agreeTerms) newErrors.terms = "Anda mesti bersetuju dengan terma";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (isLoginMode) {
        await loginWithEmail(email.trim(), password);
      } else {
        await onRegister({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password
        });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || (isLoginMode ? "Ralat log masuk" : "Ralat pendaftaran") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
      let errorMessage = "Ralat log masuk Google";
      if (err.code === "auth/unauthorized-domain") {
        errorMessage = "Domain ini belum dibenarkan untuk Firebase. Sila gunakan email/password.";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Popup ditutup. Sila cuba lagi.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    t('feature7DayTrial'),
    t('featureAIAssistant'),
    t('featureSmartTasks'),
    t('featureFinanceTracking'),
    t('featureWellnessMonitoring')
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              {t('backToHome')}
            </button>
            <LanguageSelector />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="MindPilot AI" className="w-10 h-10 rounded-xl" />
            <span className="font-semibold text-xl">MindPilot AI</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isLoginMode ? t('loginTitle') : t('registerTitle')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isLoginMode ? t('welcomeBack') : t('startTrialToday')}
          </p>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl border border-border bg-white text-gray-800 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoginMode ? t('loginWithGoogle') : t('registerWithGoogle')}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">{t('or')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('firstName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border ${errors.firstName ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                    />
                  </div>
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('lastName')}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.lastName ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border ${errors.email ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('minChars')}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-muted/50 border ${errors.password ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {!isLoginMode && (
              <>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    {t('agreeToTerms')}{" "}
                    <a href="#" className="text-primary hover:underline">{t('termsAndConditions')}</a>
                    {" "}{t('and')}{" "}
                    <a href="#" className="text-primary hover:underline">{t('privacyPolicy')}</a>
                  </label>
                </div>
                {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}
              </>
            )}
            {errors.submit && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLoginMode ? t('loginButton') : t('startTrialButton')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLoginMode ? (
              <>
                {t('dontHaveAccount')}{" "}
                <button onClick={() => setIsLoginMode(false)} className="text-primary hover:underline">
                  {t('registerNow')}
                </button>
              </>
            ) : (
              <>
                {t('alreadyHaveAccount')}{" "}
                <button onClick={() => setIsLoginMode(true)} className="text-primary hover:underline">
                  {t('login')}
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-purple-500/10 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md"
        >
          <div className="glass rounded-3xl p-8 glow">
            <div className="flex items-center gap-2 text-primary mb-6">
              <Sparkles className="w-6 h-6" />
              <span className="font-semibold">{t('whatYouGet')}</span>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-background/50 rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">{t('trialInfo')}</p>
                  <p className="text-sm text-muted-foreground">{t('thenPrice')}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('cancelAnytime')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
