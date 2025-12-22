import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      select: {
        telephone: true,
        email: true,
        name: true,
        facebook: true,
        instagram: true,
        twitter: true,
        youtube: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
