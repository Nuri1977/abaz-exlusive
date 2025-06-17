"use client";

import type { User } from "better-auth";

import { authClient } from "@/lib/auth-client";

/**
 * Hook to check if the current user is an admin (client-side)
 * @returns boolean - True if the user is an admin, false otherwise
 */
export const useIsAdmin = (): boolean => {
  const { data: session } = authClient.useSession();
  // Access the isAdmin property safely with type checking
  return Boolean((session?.user as User & { isAdmin?: boolean })?.isAdmin);
};
