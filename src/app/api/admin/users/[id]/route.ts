import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password for security
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();

    // Fetch user to verify it exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is being updated, check if it's already in use
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        email: body.email !== undefined ? body.email : undefined,
        isAdmin: body.isAdmin !== undefined ? body.isAdmin : undefined,
        image: body.image !== undefined ? body.image : undefined,
        // Only update password if provided
        ...(body.password ? { password: body.password } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
