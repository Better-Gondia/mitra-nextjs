"use client";

import { initUserData } from "@/lib/data";
import { User } from "@/types";
import { create } from "zustand";

interface UserDataStore {
  userData: User;
  isAuthenticated: boolean;
  setUserData: (user: User) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  getUserFromUrl: () => Promise<User | null>;
}

const fetchUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const useUserData = create<UserDataStore>((set, get) => ({
  userData: initUserData,
  isAuthenticated: false,
  setUserData: (user: User) => set({ userData: user }),
  setIsAuthenticated: (authenticated: boolean) =>
    set({ isAuthenticated: authenticated }),
  getUserFromUrl: async () => {
    if (typeof window === "undefined") return null;

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");

    if (!userId) {
      set({ isAuthenticated: false, userData: initUserData });
      return null;
    }

    const user = await fetchUserById(userId);
    if (user) {
      set({ userData: user, isAuthenticated: true });
      return user;
    } else {
      set({ isAuthenticated: false, userData: initUserData });
      return null;
    }
  },
}));
