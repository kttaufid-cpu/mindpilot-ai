import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { firebaseAuth, firebaseDB, isConfigured } from "@/lib/firebase";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isPremium: boolean | null;
  premiumExpiresAt: string | null;
  aiResponsesUsedToday: number | null;
  createdAt: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showRegister: boolean;
  selectedTab: string | null;
  error: string | null;
  login: (tab?: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  closeRegister: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = "mindpilot_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConfigured) {
      const unsubscribe = firebaseAuth.onAuthChange(async (firebaseUser: any) => {
        if (firebaseUser) {
          const profile: any = await firebaseDB.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              id: firebaseUser.uid,
              email: profile.email || firebaseUser.email,
              firstName: profile.firstName || null,
              lastName: profile.lastName || null,
              profileImageUrl: profile.profileImageUrl || firebaseUser.photoURL,
              isPremium: profile.isPremium || false,
              premiumExpiresAt: profile.premiumExpiresAt || null,
              aiResponsesUsedToday: profile.aiResponsesUsedToday || 0,
              createdAt: profile.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || null,
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
              profileImageUrl: firebaseUser.photoURL,
              isPremium: false,
              premiumExpiresAt: null,
              aiResponsesUsedToday: 0,
              createdAt: new Date().toISOString(),
            });
          }
          setShowRegister(false);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      setTimeout(() => {
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
        setIsLoading(false);
      }, 500);
    }
  }, []);

  const register = async (data: RegisterData) => {
    setError(null);
    
    if (isConfigured) {
      try {
        await firebaseAuth.register(data.email, data.password, data.firstName, data.lastName);
        setShowRegister(false);
      } catch (err: any) {
        console.error("Registration error:", err);
        if (err.code === "auth/email-already-in-use") {
          setError("Email ini sudah didaftarkan. Sila gunakan email lain.");
        } else if (err.code === "auth/weak-password") {
          setError("Kata laluan terlalu lemah. Sila gunakan kata laluan yang lebih kuat.");
        } else {
          setError(err.message || "Ralat pendaftaran. Sila cuba lagi.");
        }
        throw err;
      }
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: null,
        isPremium: false,
        premiumExpiresAt: null,
        aiResponsesUsedToday: 0,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setShowRegister(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    
    if (isConfigured) {
      try {
        await firebaseAuth.login(email, password);
        setShowRegister(false);
      } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          setError("Email atau kata laluan tidak sah.");
        } else {
          setError(err.message || "Ralat log masuk. Sila cuba lagi.");
        }
        throw err;
      }
    } else {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === email) {
          setUser(parsed);
          setShowRegister(false);
          return;
        }
      }
      setError("Email atau kata laluan tidak sah.");
      throw new Error("Invalid credentials");
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    
    if (isConfigured) {
      try {
        await firebaseAuth.loginWithGoogle();
        setShowRegister(false);
      } catch (err: any) {
        console.error("Google login error:", err);
        setError(err.message || "Ralat log masuk Google. Sila cuba lagi.");
        throw err;
      }
    }
  };

  const openRegister = (tab?: string) => {
    if (tab) {
      localStorage.setItem("mindpilot_selected_tab", tab);
      setSelectedTab(tab);
    }
    setShowRegister(true);
  };

  const logout = async () => {
    if (isConfigured) {
      await firebaseAuth.logout();
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("mindpilot_selected_tab");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      showRegister,
      selectedTab,
      error,
      login: openRegister,
      loginWithEmail,
      loginWithGoogle,
      register,
      closeRegister: () => setShowRegister(false),
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
