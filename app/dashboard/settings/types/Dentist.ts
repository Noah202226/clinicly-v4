// Example: Dentist Type
export interface Dentist {
  name: string;
  email: string;
  contact: string;
  branchId: string; // Appwrite relationship ID to the Branches collection
}
