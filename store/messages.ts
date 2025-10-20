"use client";

import { translate } from "@/lib/translator";
import { ChatMessage, Language } from "@/types";
import { create } from "zustand";

interface UseMessages {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  addMessages: (newMessages: ChatMessage[]) => void;
  clearMessages: () => void;
  resetToInitial: () => void;
  updateMessage: (id: number, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: number) => void;
}

const getInitialMessage = (lang?: Language): ChatMessage => {
  const language: Language =
    typeof window !== "undefined"
      ? (localStorage.getItem("language") as Language) ?? "english"
      : "english";

  return {
    id: 0,
    content: translate("intro_message", lang ?? language),
    messageType: "bot",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

export const useMessages = create<UseMessages>()((set, get) => ({
  messages: [],

  setMessages: (messages: ChatMessage[]) => set({ messages }),

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addMessages: (newMessages: ChatMessage[]) =>
    set((state) => ({
      messages: [...state.messages, ...newMessages],
    })),

  clearMessages: () => set({ messages: [] }),
  resetToInitial: () => set({ messages: [getInitialMessage()] }),

  updateMessage: (id: number, updates: Partial<ChatMessage>) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  removeMessage: (id: number) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
}));
