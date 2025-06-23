import { isAdminServer } from "@/helpers/isAdminServer";
import { prisma } from "@/lib/prisma";
import { settingsFormSchema } from "@/schemas/settings";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input data
    const validationResult = settingsFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingSettings = await prisma.settings.findFirst();
    if (existingSettings) {
      return NextResponse.json(
        { message: "Settings already exists" },
        { status: 400 }
      );
    }

    const response = await prisma.settings.create({
      data: validationResult.data,
    });

    revalidateTag("settings");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input data
    const validationResult = settingsFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const response = await prisma.settings.update({
      where: {
        id: "default",
      },
      data: validationResult.data,
    });

    revalidateTag("settings");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await prisma.settings.delete({
      where: {
        id: "default",
      },
    });

    revalidateTag("settings");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}