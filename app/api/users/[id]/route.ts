import { Client, Users } from "node-appwrite";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: Request,
  // Update: Type params as a Promise for Next.js 15+ compatibility
  { params }: Props,
) {
  try {
    // 1. Await params to safely extract the ID
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 2. Safety Check: Verify environment variables are loaded
    if (
      !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
      !process.env.APPWRITE_API_KEY
    ) {
      console.error("CRITICAL ERROR: Missing Appwrite Environment Variables");
      console.log("ENDPOINT:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
      console.log("PROJECT:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
      console.log("KEY:", process.env.APPWRITE_API_KEY ? "Loaded" : "Missing");

      return NextResponse.json(
        { error: "Server misconfiguration. Check console logs." },
        { status: 500 },
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // Secret API key with 'users.write' scope

    const users = new Users(client);

    // Delete the user from Appwrite Authentication
    await users.delete(id);

    return NextResponse.json({
      message: "User deleted from auth successfully",
    });
  } catch (error: any) {
    console.error("Auth deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user from Auth" },
      { status: 500 },
    );
  }
}
