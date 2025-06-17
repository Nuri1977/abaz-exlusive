import type { User } from "better-auth";

import { getSessionServer } from "./getSessionServer";

/**
 * Check if the current user is an admin (server-side)
 * @returns Promise<boolean> - True if the user is an admin, false otherwise
 */
export const isAdminServer = async (): Promise<boolean> => {
  const session = await getSessionServer();
  // Access the isAdmin property safely with type checking
  return Boolean((session?.user as User & { isAdmin?: boolean })?.isAdmin);
};
