import {
  Client,
  Account,
  Databases,
  AppwriteException,
  Models,
  Teams,
  Storage,
} from "appwrite";

// 1. --- Configuration Constants & Types ---
// IMPORTANT: Assumes these environment variables are correctly set in .env.local
export const DATABASE_ID: string = process.env
  .NEXT_PUBLIC_DATABASE_ID as string;
export const BRANCHES_COLLECTION_ID: string = "branches";
export const SERVICES_COLLECTION_ID: string = "services";
export const DENTISTS_COLLECTION_ID: string = "dentists";
export const USERS_COLLECTION_ID: string = "users";
export const PATIENT_COLLECTION_ID: string = "patients";
export const INSTALLMENTS_COLLECTION_ID = "installments";
export const TRANSACTIONS_COLLECTION_ID = "transactions";
export const INVENTORY_COLLECTION_ID = "inventories";
export const EXPENSE_COLLECTION_ID = "expenses";
export const INVENTORY_MOVEMENTS_COLLECTION_ID = "inventory_movements";
export const DENTAL_NOTES_COLLECTION_ID = "dental-notes";
export const MEDICAL_HISTORY_COLLECTION_ID = "medical-history";
export const PATIENT_CHART_COLLECTION_ID = "dentalchart";

export const IMAGE_STORAGE_ID = "egargue-storage";

// Add other collection IDs here (e.g., DENTISTS_COLLECTION_ID, SERVICES_COLLECTION_ID)

// Define the structure of your document data
export interface Branch {
  $id: string;
  name: string;
  address: string;
  startHour: number;
  endHour: number;
}

// Example: Dentist Type
export interface Dentist {
  name: string;
  email: string;
  contact: string;
  branchId: string; // Appwrite relationship ID to the Branches collection
}

export interface User {
  accountId: string;
  name: string;
  email: string;
  role: string; // "admin" | "dentist" | "patient" | "user"
  isActive: boolean;
  permissions: string[]; // e.g., ["read", "write"]
  branchId?: string;
  branchIds?: string[]; // Add this for the new multiple branch feature
}

export interface Patient {
  $id: string;

  name: string;
  phone: string;

  email?: string;
  gender?: "male" | "female" | "other";
  birthdate?: string;
  address?: string;
  notes?: string;

  // Branch the patient belongs to
  branchId: string;

  // Optional creator reference
  createdBy?: string;

  // Appwrite defaults
  $createdAt: string;
  $updatedAt: string;
}

// Define the structure of your custom user preferences
export interface CustomUserPreferences extends Models.Preferences {
  avatarUrl?: string;
}

// 2. --- Appwrite Client Initialization ---
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

// 3. --- Export Appwrite Services ---
export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client); // Initialized and Exported Teams service
export const storage = new Storage(client);
export { client };

// 4. --- Utility Functions ---

/**
 * Checks user session and returns the user object or null.
 */
export const checkUserSession =
  async (): Promise<Models.User<CustomUserPreferences> | null> => {
    try {
      const user = await account.get<CustomUserPreferences>();
      return user;
    } catch (error) {
      if (error instanceof AppwriteException) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes("missing scopes") ||
          errorMessage.includes("user not found")
        ) {
          return null;
        }
      }
      console.error("Unforeseen Appwrite error during session check:", error);
      return null;
    }
  };

/**
 * ✅ Corrected Function to get a list of Teams the current user is a member of.
 * This is the correct way to get user teams using the Appwrite Client SDK.
 *
 * @returns A list of team objects containing the $id and name.
 */
export const getUserTeams = async (): Promise<Models.Team[]> => {
  try {
    // Correct approach: Use the teams.list() method.
    // When called without any queries, it lists the teams the current user is a member of.
    const response = await teams.list();

    // The result structure is Models.TeamList, which contains the teams array.
    return response.teams;
  } catch (error) {
    // If the user is not logged in or has no teams, this handles the error gracefully.
    console.error("Error fetching user team list:", error);
    return [];
  }
};

// Function to log out the user
export const logoutUser = async (): Promise<void> => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
