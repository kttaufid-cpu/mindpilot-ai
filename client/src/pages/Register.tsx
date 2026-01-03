import { useState } from "react";
import { motion } from "framer-motion";
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
    
    if (!firstName.trim()) newErrors.firstName = "Nama pertama diperlukan";
    if (!lastName.trim()) newErrors.lastName = "Nama akhir diperlukan";
    if (!email.trim()) {
      newErrors.email = "Email diperlukan";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak sah";
    }
    if (!password) {
      newErrors.password = "Kata laluan diperlukan";
    } else if (password.length < 6) {
      newErrors.password = "Kata laluan mesti sekurang-kurangnya 6 aksara";
    }
    if (!agreeTerms) newErrors.terms = "Anda mesti bersetuju dengan terma";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await onRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password
      });
    } catch (err: any) {
      // Error is handled by parent, just update loading state
      setErrors({ submit: err.message || "Ralat pendaftaran" });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "7 hari percubaan percuma",
    "AI pembantu peribadi",
    "Pengurusan tugas pintar",
    "Penjejakan kewangan",
    "Pemantauan kesihatan"
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
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition"
          >
            ← Kembali ke laman utama
          </button>

          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="MindPilot AI" className="w-10 h-10 rounded-xl" />
            <span className="font-semibold text-xl">MindPilot AI</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Daftar Akaun Baru</h1>
          <p className="text-muted-foreground mb-8">
            Mula percubaan percuma 7 hari anda hari ini
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Pertama</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ahmad"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border ${errors.firstName ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Akhir</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ali"
                  className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.lastName ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmad@contoh.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border ${errors.email ? 'border-red-500' : 'border-border'} focus:border-primary focus:outline-none`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kata Laluan</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 aksara"
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

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Saya bersetuju dengan{" "}
                <a href="#" className="text-primary hover:underline">Terma & Syarat</a>
                {" "}dan{" "}
                <a href="#" className="text-primary hover:underline">Dasar Privasi</a>
              </label>
            </div>
            {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}
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
                  Mula Percubaan Percuma <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah ada akaun?{" "}
            <button onClick={onBack} className="text-primary hover:underline">
              Log masuk
            </button>
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
              <span className="font-semibold">Apa yang anda dapat</span>
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
                  <p className="font-semibold">Percubaan Percuma 7 Hari</p>
                  <p className="text-sm text-muted-foreground">Kemudian RM9.90/bulan</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Batalkan bila-bila masa. Tiada kad kredit diperlukan untuk mula.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
