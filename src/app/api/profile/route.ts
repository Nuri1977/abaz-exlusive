import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Get current user session with correct headers handling
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, email, password } = body;

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    // Get current user session with correct headers handling
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete the user account
    // This will cascade delete sessions and accounts due to the Prisma schema relation
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
