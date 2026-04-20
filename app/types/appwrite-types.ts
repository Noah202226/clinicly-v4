// types/appwrite-types.ts (Create this file)

import { Models } from "appwrite";

// Define the structure of your custom user preferences
export interface CustomUserPreferences extends Models.Preferences {
  avatarUrl?: string; // Appwrite custom attribute for the user avatar URL
  // Add any other custom preferences you store, like theme or settings
}

// Extend the full User model to use your CustomUserPreferences
export interface CustomUser extends Models.User<CustomUserPreferences> {}

export interface User extends Models.Document {
  accountId: string;
  name: string;
  email: string;
  role: string; // "admin" | "dentist" | "patient" | "user"
  isActive: boolean;
  permissions: string[]; // e.g., ["read", "write"]
}
