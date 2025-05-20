import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Platform } from "react-native";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(date: number): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isIOS(): boolean {
  return Platform.OS === "ios";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
}

// Remove html tags from text
export function formatHTMLtoText(text: string): string {
  // If text is undefined, return an empty string
  if (!text) return "";
  return text?.replace(/<[^>]*>?/g, "");
}
