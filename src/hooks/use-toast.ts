"use client";
import { useState } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

const emit = (toasts: Toast[]) => {
  currentToasts = toasts;
  listeners.forEach((l) => l(toasts));
};

export const toast = (t: Omit<Toast, "id">) => {
  const id = String(++toastCount);
  emit([...currentToasts, { ...t, id }]);
  setTimeout(() => emit(currentToasts.filter((x) => x.id !== id)), 4000);
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);
  if (!listeners.includes(setToasts)) listeners.push(setToasts);
  return { toast, toasts };
};
