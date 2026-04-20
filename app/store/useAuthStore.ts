// app/store/useAuthStore.ts

import { create } from "zustand";
import {
  account,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from "@/app/appwrite";
import { Query } from "appwrite";

interface AuthState {
  user: any | null;
  userDoc: any | null;
  loading: boolean;

  checkAuth: () => Promise<any | null>;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Appwrite Account
  userDoc: null, // Your custom user document (with `role`)
  loading: true,

  checkAuth: async () => {
    set({ loading: true });
    try {
      const accountUser = await account.get();

      // 👍 Fetch user document based on email
      const userDocs = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("email", accountUser.email)],
      );

      const userDoc = userDocs.documents[0] || null;

      set({ user: accountUser, userDoc, loading: false });

      return accountUser;
    } catch (error) {
      set({ user: null, userDoc: null, loading: false });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  handleLogin: async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
  },

  handleLogout: async () => {
    set({ loading: true });
    try {
      await account.deleteSession("current");
      set({ user: null, userDoc: null, loading: false });
    } catch (error) {
      console.error("Logout failed:", error);
      set({ loading: false });
    }
  },
}));
