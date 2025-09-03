import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET() {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    // Fallback: if aboutUs is empty but aboutInfo exists, return a minimal Lexical state
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
      console.log("fallback", fallback);
      return NextResponse.json({ data: fallback }, { status: 200 });
    }
    console.log("settings?.aboutUs", settings?.aboutUs);
    return NextResponse.json({ data: settings?.aboutUs ?? null }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch About Us:", error);
    return NextResponse.json(
      { error: "Failed to fetch About Us" },
      { status: 500 }
    );
  }
}

// Update About Us content (admin only)
export async function PUT(request: Request) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const { aboutUs } = await request.json();
    if (!aboutUs) {
      return NextResponse.json(
        { error: "Missing aboutUs content" },
        { status: 400 }
      );
    }
    // Try update, if not found, create with existing settings or defaults
    let updated;
    try {
      updated = await prisma.settings.update({
        where: { id: "default" },
        data: { aboutUs },
      });
    } catch (err: any) {
      if (err?.code === "P2025") {
        // Try to fetch any existing settings (shouldn't happen, but for safety)
        const existing = await prisma.settings.findFirst();
        updated = await prisma.settings.create({
          data: {
            id: "default",
            name: existing?.name ?? "Molini Shoes",
            address: existing?.address ?? "",
            city: existing?.city ?? "",
            state: existing?.state ?? "",
            telephone: existing?.telephone ?? "",
            email: existing?.email ?? "",
            facebook: existing?.facebook ?? null,
            twitter: existing?.twitter ?? null,
            instagram: existing?.instagram ?? null,
            youtube: existing?.youtube ?? null,
            aboutInfo: existing?.aboutInfo ?? "",
            aboutUs,
          },
        });
      } else {
        throw err;
      }
    }
    return NextResponse.json({ aboutUs: updated.aboutUs }, { status: 200 });
  } catch (error) {
    console.error("Failed to update About Us:", error);
    return NextResponse.json(
      { error: "Failed to update About Us" },
      { status: 500 }
    );
  }
}
