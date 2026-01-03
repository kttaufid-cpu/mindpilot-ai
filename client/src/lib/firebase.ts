import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB25FObKePpPKQWWkQWmKkJ3v6RPrp9zMs",
  authDomain: "mindpilot-2f7cb.firebaseapp.com",
  projectId: "mindpilot-2f7cb",
  storageBucket: "mindpilot-2f7cb.firebasestorage.app",
  messagingSenderId: "618101129544",
  appId: "1:618101129544:web:65ebfaf6d99d5f6cf3b37d",
  measurementId: "G-QQP8VM5KE0"
};

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, isConfigured };

// Auth functions
export const firebaseAuth = {
  // Register with email/password
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isConfigured) throw new Error("Firebase not configured");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      firstName,
      lastName,
      isPremium: false,
      trialStartDate: serverTimestamp(),
      trialEndDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      aiResponsesUsedToday: 0,
      lastAiResetDate: new Date().toDateString(),
      createdAt: serverTimestamp()
    });
    
    return user;
  },

  // Login with email/password
  login: async (email: string, password: string) => {
    if (!isConfigured) throw new Error("Firebase not configured");
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Login with Google
  loginWithGoogle: async () => {
    if (!isConfigured) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: result.user.photoURL,
        isPremium: false,
        trialStartDate: serverTimestamp(),
        trialEndDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        aiResponsesUsedToday: 0,
        lastAiResetDate: new Date().toDateString(),
        createdAt: serverTimestamp()
      });
    }
    
    return result.user;
  },

  // Logout
  logout: async () => {
    if (!isConfigured) return;
    return signOut(auth);
  },

  // Get current user
  onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
    if (!isConfigured) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore functions
export const firebaseDB = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    if (!isConfigured) return null;
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // Update user profile
  updateUserProfile: async (userId: string, data: any) => {
    if (!isConfigured) return;
    await updateDoc(doc(db, "users", userId), data);
  },

  // Tasks
  getTasks: async (userId: string) => {
    if (!isConfigured) return [];
    const q = query(collection(db, "tasks"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },

  addTask: async (userId: string, task: any) => {
    if (!isConfigured) return null;
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateTask: async (taskId: string, data: any) => {
    if (!isConfigured) return;
    await updateDoc(doc(db, "tasks", taskId), data);
  },

  deleteTask: async (taskId: string) => {
    if (!isConfigured) return;
    await deleteDoc(doc(db, "tasks", taskId));
  },

  // Transactions
  getTransactions: async (userId: string) => {
    if (!isConfigured) return [];
    const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },

  addTransaction: async (userId: string, transaction: any) => {
    if (!isConfigured) return null;
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transaction,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  deleteTransaction: async (transactionId: string) => {
    if (!isConfigured) return;
    await deleteDoc(doc(db, "transactions", transactionId));
  },

  // Wellness
  getWellnessEntries: async (userId: string) => {
    if (!isConfigured) return [];
    const q = query(collection(db, "wellness"), where("userId", "==", userId), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },

  addWellnessEntry: async (userId: string, entry: any) => {
    if (!isConfigured) return null;
    const docRef = await addDoc(collection(db, "wellness"), {
      ...entry,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Goals
  getGoals: async (userId: string) => {
    if (!isConfigured) return [];
    const q = query(collection(db, "goals"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },

  addGoal: async (userId: string, goal: any) => {
    if (!isConfigured) return null;
    const docRef = await addDoc(collection(db, "goals"), {
      ...goal,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateGoal: async (goalId: string, data: any) => {
    if (!isConfigured) return;
    await updateDoc(doc(db, "goals", goalId), data);
  },

  deleteGoal: async (goalId: string) => {
    if (!isConfigured) return;
    await deleteDoc(doc(db, "goals", goalId));
  },

  // AI Chat History
  saveChatMessage: async (userId: string, message: string, response: string) => {
    if (!isConfigured) return null;
    const docRef = await addDoc(collection(db, "chatHistory"), {
      userId,
      message,
      response,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Subscription
  upgradeToPremium: async (userId: string) => {
    if (!isConfigured) return;
    await updateDoc(doc(db, "users", userId), {
      isPremium: true,
      premiumStartDate: serverTimestamp()
    });
  },

  incrementAiUsage: async (userId: string) => {
    if (!isConfigured) return;
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const today = new Date().toDateString();
      
      if (data.lastAiResetDate !== today) {
        await updateDoc(doc(db, "users", userId), {
          aiResponsesUsedToday: 1,
          lastAiResetDate: today
        });
      } else {
        await updateDoc(doc(db, "users", userId), {
          aiResponsesUsedToday: (data.aiResponsesUsedToday || 0) + 1
        });
      }
    }
  }
};

export default { auth: firebaseAuth, db: firebaseDB, isConfigured };
