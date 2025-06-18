import { isAdminServer } from "@/helpers/isAdminServer";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/utils/utapi";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get files from Uploadthing
    const uploadthingFiles = await utapi.listFiles();
    if (!uploadthingFiles) {
      return NextResponse.json(
        { error: "Failed to get files from Uploadthing" },
        { status: 500 }
      );
    }

    // Get existing gallery items
    const existingGalleryItems = await prisma.gallery.findMany({
      select: { key: true },
    });
    const existingKeys = new Set(existingGalleryItems.map((item) => item.key));

    // Prepare data for upsert
    const syncData = uploadthingFiles.files.map((file) => ({
      name: file.name,
      size: file.size,
      key: file.key,
      lastModified: Math.floor((file.uploadedAt || Date.now()) / 1000),
      serverData: {},
      url: `https://uploadthing.com/f/${file.key}`,
      appUrl: `https://uploadthing.com/f/${file.key}`,
      ufsUrl: `https://uploadthing.com/f/${file.key}`,
      customId: file.customId,
      type: "image",
      fileHash: "",
      metadata: {},
    }));

    // Upsert all files
    const results = await Promise.all(
      syncData.map((data) =>
        prisma.gallery.upsert({
          where: { key: data.key },
          update: {
            name: data.name,
            size: data.size,
            lastModified: data.lastModified,
            serverData: data.serverData,
            url: data.url,
            appUrl: data.appUrl,
            ufsUrl: data.ufsUrl,
            customId: data.customId,
            type: data.type,
            fileHash: data.fileHash,
            metadata: data.metadata,
          },
          create: {
            name: data.name,
            size: data.size,
            key: data.key,
            lastModified: data.lastModified,
            serverData: data.serverData,
            url: data.url,
            appUrl: data.appUrl,
            ufsUrl: data.ufsUrl,
            customId: data.customId,
            type: data.type,
            fileHash: data.fileHash,
            metadata: data.metadata,
          },
        })
      )
    );

    // Delete items that no longer exist in Uploadthing
    const uploadthingKeys = new Set(
      uploadthingFiles.files.map((file) => file.key)
    );
    const keysToDelete = Array.from(existingKeys).filter(
      (key) => !uploadthingKeys.has(key)
    );

    if (keysToDelete.length > 0) {
      await prisma.gallery.deleteMany({
        where: {
          key: {
            in: keysToDelete,
          },
        },
      });
    }

    return NextResponse.json({
      message: "Gallery synchronized successfully",
      synced: results.length,
      deleted: keysToDelete.length,
    });
  } catch (error) {
    console.error("Error synchronizing gallery:", error);
    return NextResponse.json(
      { error: "Failed to synchronize gallery" },
      { status: 500 }
    );
  }
}
