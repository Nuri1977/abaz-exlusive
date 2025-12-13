import type { User } from "better-auth";

import { getSessionServer } from "./getSessionServer";

/**
 * Check if the current user is an admin (server-side)
 * @returns Promise<boolean> - True if the user is an admin, false otherwise
 */
export const isAdminServer = async (): Promise<boolean> => {
  try {
    const session = await getSessionServer();

    // If session is null (timeout or error), return false
    if (!session?.user) {
      return false;
    }

    // Access the isAdmin property safely with type checking
    return Boolean((session.user as User & { isAdmin?: boolean })?.isAdmin);
  } catch (error) {
    console.error("Admin check error:", error);
    return false; // Return false on any error to prevent access
  }
};
