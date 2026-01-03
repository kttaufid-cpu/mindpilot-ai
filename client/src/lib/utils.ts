import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency: string = "RM"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency}${num.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 8) return "😄";
  if (mood >= 6) return "🙂";
  if (mood >= 4) return "😐";
  if (mood >= 2) return "😔";
  return "😢";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "text-red-400 bg-red-400/10";
    case "medium": return "text-yellow-400 bg-yellow-400/10";
    case "low": return "text-green-400 bg-green-400/10";
    default: return "text-gray-400 bg-gray-400/10";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed": return "text-green-400 bg-green-400/10";
    case "in_progress": return "text-blue-400 bg-blue-400/10";
    case "pending": return "text-yellow-400 bg-yellow-400/10";
    default: return "text-gray-400 bg-gray-400/10";
  }
}
