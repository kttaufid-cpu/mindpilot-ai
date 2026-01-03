import {
  users,
  tasks,
  transactions,
  documents,
  wellnessEntries,
  goals,
  aiChats,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Transaction,
  type InsertTransaction,
  type Document,
  type InsertDocument,
  type WellnessEntry,
  type InsertWellnessEntry,
  type Goal,
  type InsertGoal,
  type AiChat,
  type InsertAiChat,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, userId: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number, userId: string): Promise<boolean>;
  
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number, userId: string): Promise<boolean>;
  
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, userId: string, data: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number, userId: string): Promise<boolean>;
  getDocumentCount(userId: string): Promise<number>;
  
  getWellnessEntries(userId: string): Promise<WellnessEntry[]>;
  createWellnessEntry(entry: InsertWellnessEntry): Promise<WellnessEntry>;
  getTodayWellnessEntry(userId: string): Promise<WellnessEntry | undefined>;
  
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, userId: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number, userId: string): Promise<boolean>;
  getActiveGoalCount(userId: string): Promise<number>;
  
  getAiChats(userId: string, limit?: number): Promise<AiChat[]>;
  createAiChat(chat: InsertAiChat): Promise<AiChat>;
  
  incrementAiResponses(userId: string): Promise<number>;
  resetAiResponses(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, userId: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async deleteTransaction(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getDocuments(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, userId: string, data: Partial<InsertDocument>): Promise<Document | undefined> {
    const [doc] = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return doc;
  }

  async deleteDocument(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getDocumentCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.userId, userId));
    return Number(result[0]?.count ?? 0);
  }

  async getWellnessEntries(userId: string): Promise<WellnessEntry[]> {
    return await db.select().from(wellnessEntries).where(eq(wellnessEntries.userId, userId)).orderBy(desc(wellnessEntries.date));
  }

  async createWellnessEntry(entry: InsertWellnessEntry): Promise<WellnessEntry> {
    const [newEntry] = await db.insert(wellnessEntries).values(entry).returning();
    return newEntry;
  }

  async getTodayWellnessEntry(userId: string): Promise<WellnessEntry | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [entry] = await db.select().from(wellnessEntries)
      .where(and(eq(wellnessEntries.userId, userId), eq(wellnessEntries.date, today)));
    return entry;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, userId: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return goal;
  }

  async deleteGoal(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveGoalCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")));
    return Number(result[0]?.count ?? 0);
  }

  async getAiChats(userId: string, limit: number = 50): Promise<AiChat[]> {
    return await db.select().from(aiChats)
      .where(eq(aiChats.userId, userId))
      .orderBy(desc(aiChats.createdAt))
      .limit(limit);
  }

  async createAiChat(chat: InsertAiChat): Promise<AiChat> {
    const [newChat] = await db.insert(aiChats).values(chat).returning();
    return newChat;
  }

  async incrementAiResponses(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const lastReset = user.lastAiResetDate;
    
    if (!lastReset || lastReset !== today) {
      await this.resetAiResponses(userId);
      const [updated] = await db
        .update(users)
        .set({ aiResponsesUsedToday: 1, lastAiResetDate: today })
        .where(eq(users.id, userId))
        .returning();
      return updated.aiResponsesUsedToday ?? 1;
    }
    
    const [updated] = await db
      .update(users)
      .set({ aiResponsesUsedToday: (user.aiResponsesUsedToday ?? 0) + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updated.aiResponsesUsedToday ?? 0;
  }

  async resetAiResponses(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await db
      .update(users)
      .set({ aiResponsesUsedToday: 0, lastAiResetDate: today })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
