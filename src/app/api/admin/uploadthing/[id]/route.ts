import { NextResponse } from "next/server";

import { isAdminServer } from "@/helpers/isAdminServer";
import { utapi } from "@/utils/utapi";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the file from Uploadthing
    const response = await utapi.deleteFiles(id);

    if (!response.success) {
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "File deleted successfully",
      deletedCount: response.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { message: "Failed to delete file" },
      { status: 500 }
    );
  }
}
