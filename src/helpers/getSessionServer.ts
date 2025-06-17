import { headers } from "next/headers";

import { auth } from "../lib/auth"; // path to your Better Auth server instance

export const getSessionServer = async () => {
  // Get current user session with correct headers handling
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  return session;
};
