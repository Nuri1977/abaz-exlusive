import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { changePasswordSchema } from "@/schemas/auth";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      Object.entries(parsed.error.format()).forEach(([key, value]) => {
        if (
          key !== "_errors" &&
          value &&
          typeof value === "object" &&
          "_errors" in value
        ) {
          fieldErrors[key] = (value as any)._errors[0];
        }
      });

      return NextResponse.json(
        {
          message: "Validation failed",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: await headers(),
      });

      return NextResponse.json(
        { message: "Password updated successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Password change error:", error);

      if (
        error.message?.includes("Invalid password") ||
        error.message?.includes("current password")
      ) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { message: error.message || "Failed to change password" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error updating password:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
