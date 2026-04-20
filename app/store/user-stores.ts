import { create } from "zustand";
import { ID, Models } from "appwrite";

import { User } from "@/app/appwrite";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "@/app/appwrite";
import toast from "react-hot-toast";

// -------------------
// Type Definitions
// -------------------
interface UserDocument extends User, Models.Document {}

interface UserStoreState {
  users: UserDocument[];
  currentUser: UserDocument | null;
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  // createUser: (data: Partial<User>) => Promise<Models.DefaultDocument>;
  setCurrentUser: (user: UserDocument | null) => void;

  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

// -------------------
// Store
// -------------------
export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  // Fetch all users
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
      );

      set({
        users: response.documents as unknown as UserDocument[],
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch users from Appwrite:", err);
      set({ error: "Could not load user data.", isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // createUser: async (data: Partial<User>) => {
  //   try {
  //     const response = await databases.createDocument(
  //       DATABASE_ID,
  //       USERS_COLLECTION_ID,
  //       ID.unique(), // auto-generate document ID
  //       data
  //     );

  //     await get().fetchUsers();
  //     return response;
  //   } catch (err) {
  //     console.error("Failed to create user:", err);
  //     throw err;
  //   }
  // },

  // Update an existing user (roles, permissions, status)
  updateUser: async (id, data) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        id,
        data,
      );
      await get().fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    }
  },

  // Delete a user from the collection
  deleteUser: async (id) => {
    console.log("Attempting to delete user with ID:", id); // Debug log
    try {
      // 1. Delete from Appwrite Auth via server-side API route
      const authResponse = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(
          errorData.error || "Failed to delete user auth account",
        );
      }

      toast.success("User deleted successfully"); // Show success toast after deletion

      // // 2. Delete from the Appwrite Database collection
      // await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, id);

      // 3. Refresh user list
      await get().fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      throw err;
    }
  },
}));
