import { isAdminServer } from "@/helpers/isAdminServer";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.gallery.count();

    // Fetch paginated gallery items
    const items = await prisma.gallery.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields based on Prisma schema
    const requiredFields = [
      "name",
      "size",
      "key",
      "lastModified",
      "serverData",
      "url",
      "appUrl",
      "ufsUrl",
      "type",
      "fileHash",
      "metadata",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Create new gallery item
    const newItem = await prisma.gallery.create({
      data: {
        name: data.name,
        size: data.size,
        key: data.key,
        lastModified: data.lastModified,
        serverData: data.serverData,
        url: data.url,
        appUrl: data.appUrl,
        ufsUrl: data.ufsUrl,
        customId: data.customId || null,
        type: data.type,
        fileHash: data.fileHash,
        metadata: data.metadata,
        width: data.width || null,
        height: data.height || null,
        tags: data.tags || [],
        uploadedBy: data.uploadedBy || null,
        usedIn: data.usedIn || [],
        isDeleted: false,
      },
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    console.error("Error creating gallery item:", error);

    // Return more specific error information
    return NextResponse.json(
      {
        error: "Failed to create gallery item",
        details: error?.message || "Unknown error occurred",
        code: error?.code,
      },
      { status: 500 }
    );
  }
}
