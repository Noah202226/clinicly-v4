import { create } from "zustand";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import toast from "react-hot-toast";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = "reminders";

interface Task {
  $id: string;
  note: string;
  author: string;
  branch: string;
  $createdAt: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (branchName: string) => Promise<void>;
  addTask: (note: string, author: string, branch: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,

  // Fetch only notes for the current branch
  fetchTasks: async (branchName) => {
    set({ loading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("branch", branchName), Query.orderDesc("$createdAt")],
      );
      set({ tasks: response.documents as any, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addTask: async (note, author, branch) => {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        note,
        author,
        branch,
      });
      // Note: Hahayaan nating ang Realtime ang mag-update ng list
      toast.success("new note save.d");
    } catch (error) {
      console.error(error);
      toast.error("error:" + error);
    }
  },

  deleteTask: async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
