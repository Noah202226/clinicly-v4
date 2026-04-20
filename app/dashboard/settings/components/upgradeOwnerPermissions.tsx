import { databases } from "@/app/appwrite";
import { DATABASE_ID, USERS_COLLECTION_ID } from "@/app/appwrite";

export async function upgradeOwnerPermissions() {
  try {
    // 1. Fetch all users from your Appwrite collection
    const res = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    const users = res.documents;

    const owners = users.filter((user) => user.role === "owner");

    console.log(`Found ${owners.length} owners. Starting upgrade...`);

    for (const owner of owners) {
      // 2. Define the full set of permissions an owner should have
      const essentialPermissions = ["read", "write"];
      const sectionPermissions = [
        "dashboard",
        "patients",
        "medical_history",
        "inventory",
        "sales_reports",
        "appointments",
        "expenses",
        "settings",
      ];

      // Combine them and remove duplicates
      const updatedPermissions = Array.from(
        new Set([...essentialPermissions, ...sectionPermissions]),
      );

      // 3. Update the document in Appwrite
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        owner.$id,
        {
          permissions: updatedPermissions, // Ensure your attribute name matches
        },
      );
      console.log(`Successfully upgraded: ${owner.email}`);
    }

    alert("All Owners have been upgraded with read/write access.");
  } catch (error) {
    console.error("Batch upgrade failed:", error);
  }
}
