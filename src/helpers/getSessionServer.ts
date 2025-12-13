import { headers } from "next/headers";

import { auth } from "../lib/auth"; // path to your Better Auth server instance

export const getSessionServer = async () => {
  try {
    // Get current user session with correct headers handling and timeout
    const sessionPromise = auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Session timeout")), 10000); // 10 second timeout
    });

    const session = await Promise.race([sessionPromise, timeoutPromise]);
    return session;
  } catch (error) {
    console.error("Session retrieval error:", error);
    return null; // Return null instead of throwing to prevent page crashes
  }
};
