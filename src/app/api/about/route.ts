import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    // Fallback to aboutInfo if aboutUs is not yet set
    if (!settings?.aboutUs && settings?.aboutInfo) {
      const text = settings.aboutInfo;
      const fallback = {
        root: {
          type: "root",
          version: 1,
          indent: 0,
          format: "",
          direction: "ltr",
          children: [
            {
              type: "paragraph",
              version: 1,
              indent: 0,
              format: "",
              direction: "ltr",
              textStyle: "",
              textFormat: 0,
              children: [
                {
                  type: "text",
                  version: 1,
                  mode: "normal",
                  text,
                  style: "",
                  detail: 0,
                  format: 0,
                },
              ],
            },
          ],
        },
      };
      return NextResponse.json({ data: fallback }, { status: 200 });
    }
    return NextResponse.json({ data: settings?.aboutUs ?? null }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch About Us (public):", error);
    return NextResponse.json(
      { error: "Failed to fetch About Us" },
      { status: 500 }
    );
  }
}
