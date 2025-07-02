import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ data: settings?.aboutUs }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch About Us (public):", error);
    return NextResponse.json(
      { error: "Failed to fetch About Us" },
      { status: 500 }
    );
  }
}
