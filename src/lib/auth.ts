import bcryptjs from "bcryptjs";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Configure authentication methods
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({
      user,
      url,
      token,
    }: {
      user: { id: string; email: string };
      url: string;
      token: string;
    }) => {
      // Send reset password email
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/email/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user,
            url,
            token,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to send reset password email");
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    password: {
      hash: async (password: string) => {
        // Custom password hashing
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        if (!hashedPassword) {
          throw new Error("Failed to hash password");
        }
        return hashedPassword;
      },
      verify: async ({
        hash,
        password,
      }: {
        hash: string;
        password: string;
      }) => {
        // Custom password verification
        const isValid = await bcryptjs.compare(password, hash);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        // Additional validation logic can be added here
        return isValid;
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Add user configuration to include isAdmin field
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        default: false,
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/email/confirm-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user,
              url,
              token,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to send verification email");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
});
